import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import Jimp from 'jimp';
import QRCode from 'qrcode';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

dotenv.config();

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'asebem.nationale@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'niujqovlmxnkzmwr',
  },
});

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/api/orders/:id/receipt', upload.single('receipt'), async (req, res) => {
  try {
    const id = req.params.id as string;
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }
    const receiptUrl = `/uploads/${req.file.filename}`;
    
    const order = await prisma.order.update({
      where: { id },
      data: { receiptUrl }
    });
    
    res.json({ success: true, receiptUrl });
  } catch (error) {
    console.error('Error uploading receipt:', error);
    res.status(500).json({ error: 'Failed to upload receipt' });
  }
});

async function generateTicketImage(order: any): Promise<Buffer> {
  // ── Dimensions du ticket ──────────────────────────────────────────────────
  const W = 1000;
  const H = 420;

  // ── Couleurs pack ─────────────────────────────────────────────────────────
  const packColors: Record<string, number> = {
    StandardEtudiant:      0xCD7F32FF,
    StandardProfessionnel: 0xb87333FF,
    VIP:                   0xFFD700FF,
    Deplacement:           0x60a5faFF,
  };

  // Labels tickets
  const ticketLabels: Record<string, string> = {
    StandardEtudiant:      'Ticket Standard Étudiant',
    StandardProfessionnel: 'Ticket Standard Professionnel',
    VIP:                   'Ticket VIP — Table 6 pers.',
    Deplacement:           'Ticket Déplacement',
  };

  const ticketPrices: Record<string, number> = {
    StandardEtudiant: 200,
    StandardProfessionnel: 300,
    VIP: 2000,
    Deplacement: 100,
  };
  const packColor = packColors[order.pack] || 0xC5A059FF;

  // ── Fond dégradé sombre ───────────────────────────────────────────────────
  const ticket = new Jimp(W, H, 0x1a1033FF); // fond violet foncé

  // Bande décorative gauche (couleur pack)
  const leftBar = new Jimp(6, H, packColor);
  ticket.composite(leftBar, 0, 0);

  // ── Photo Amazone (côté gauche) ───────────────────────────────────────────
  try {
    const amazone = await Jimp.read(path.join(__dirname, '../src/assets/amazone.png'));
    const targetH = H;
    const targetW = Math.round(amazone.getWidth() * (targetH / amazone.getHeight()));
    amazone.resize(targetW, targetH);
    // Assombrir légèrement l'image pour lisibilité
    amazone.brightness(-0.15);
    ticket.composite(amazone, 8, 0);

    // Dégradé overlay sur l'amazone pour transition vers le fond
    const fadeW = 80;
    for (let x = 0; x < fadeW; x++) {
      const alpha = Math.round(255 * (x / fadeW));
      const col = new Jimp(1, H, (0x1a1033FF & 0xFFFFFF00) | (255 - alpha));
      ticket.composite(col, 8 + targetW - fadeW + x, 0);
    }
  } catch (e) {
    console.error('Amazone image error:', e);
  }

  // ── Logo ASEBEM (rond, en haut à gauche sur l'amazone) ────────────────────
  try {
    const logoAsebem = await Jimp.read(path.join(__dirname, '../src/assets/logo-asebem.jpg'));
    logoAsebem.resize(80, 80).circle();
    ticket.composite(logoAsebem, 20, 16);
  } catch (e) {
    console.error('Logo ASEBEM error:', e);
  }

  // ── Logo Triduum (en haut à droite de la zone info) ───────────────────────
  try {
    const logoTriduum = await Jimp.read(path.join(__dirname, '../src/assets/logo-triduum.jpg'));
    logoTriduum.resize(90, 90);
    ticket.composite(logoTriduum, W - 110, 14);
  } catch (e) {
    console.error('Logo Triduum error:', e);
  }

  // ── Fonts ─────────────────────────────────────────────────────────────────
  const fontLarge  = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
  const fontMed    = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
  const fontSmall  = await Jimp.loadFont(Jimp.FONT_SANS_8_WHITE);

  // ── Zone info (à droite de l'amazone) ────────────────────────────────────
  const infoX = 290; // décalé après la photo

  // Titre
  ticket.print(fontLarge, infoX, 20, 'SOIREE DE GALA');
  ticket.print(fontMed,   infoX, 58, 'TRIDUUM CULTUREL ASEBEM 2026');

  // Ligne séparatrice dorée
  const sep = new Jimp(W - infoX - 120, 2, packColor);
  ticket.composite(sep, infoX, 84);

  // Nom du participant
  ticket.print(fontMed, infoX, 96,  `Participant : ${order.prenom} ${order.nom}`);
  ticket.print(fontMed, infoX, 122, `CIN / ID    : ${order.cin}`);
  if (order.isBeninois && order.idAsebem) {
    ticket.print(fontMed, infoX, 148, `ID ASEBEM   : ${order.idAsebem}`);
  }

  // Pack
  const packLabel = ticketLabels[order.pack] || order.pack;
  const price = ticketPrices[order.pack] || 200;
  const totalPrice = price * order.nombrePersonnes;

  ticket.print(fontMed, infoX, 178, `Ticket      : ${packLabel}`);
  ticket.print(fontMed, infoX, 204, `Places      : ${order.nombrePersonnes} pers.`);

  // Montant (mise en évidence couleur pack)
  const priceBg = new Jimp(200, 36, (packColor & 0xFFFFFF00) | 0x33); // semi-transparent
  ticket.composite(priceBg, infoX, 234);
  ticket.print(fontLarge, infoX + 8, 236, `${totalPrice} DHS`);

  // ID commande
  ticket.print(fontSmall, infoX, 284, `REF: ASEBEM-${order.id.slice(0, 8).toUpperCase()}`);

  // ── QR Code (coin bas droit) ──────────────────────────────────────────────
  const qrData = `GALA ASEBEM 2026|ID:${order.id}|Pack:${order.pack}|Nom:${order.nom} ${order.prenom}|CIN:${order.cin}|Places:${order.nombrePersonnes}`;
  const qrDataUrl = await QRCode.toDataURL(qrData, { margin: 1, width: 140 });
  const qrBuffer  = Buffer.from(qrDataUrl.split(',')[1], 'base64');
  const qrImage   = await Jimp.read(qrBuffer);
  qrImage.resize(130, 130);

  // Fond blanc derrière le QR
  const qrBg = new Jimp(138, 138, 0xFFFFFFFF);
  ticket.composite(qrBg, W - 148, H - 148);
  ticket.composite(qrImage, W - 144, H - 144);

  ticket.print(fontSmall, W - 148, H - 14, 'Scannez à l\'entrée');

  return await ticket.getBufferAsync(Jimp.MIME_PNG);
}

app.get('/', (req, res) => {
  res.send('Hello World!, Bienvenue sur la page d\'inscription de la soirée gala');
});
app.post('/api/orders', async (req, res) => {
  try {
    const { nom, prenom, email, cin, idAsebem, isBeninois, pack, nombrePersonnes, beneficiaires } = req.body;

    const order = await prisma.order.create({
      data: {
        nom,
        prenom,
        email,
        cin,
        idAsebem: isBeninois ? idAsebem : null,
        isBeninois,
        pack,
        nombrePersonnes,
        beneficiaires: {
          create: beneficiaires || [],
        },
      },
    });

    res.status(201).json({ success: true, orderId: order.id });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// ADMIN ROUTES
const JWT_SECRET = process.env.JWT_SECRET || "gala_asebem_super_secret_2026";

app.post('/api/admin/signup', async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingAdmin = await prisma.admin.findUnique({ where: { username } });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Cet utilisateur existe déjà' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
      }
    });

    res.status(201).json({ success: true, message: 'Administrateur créé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du compte' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const token = jwt.sign({ adminId: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Middleware for Admin Auth
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Non autorisé' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Session expirée ou invalide' });
  }
};

app.get('/api/admin/orders', requireAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: { beneficiaires: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.patch('/api/admin/orders/:id/status', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: String(id) },
      include: { beneficiaires: true }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: String(id) },
      data: { status: String(status) }
    });

    if (status === 'VALIDE' && order.status !== 'VALIDE') {
      try {
        const ticketBuffer = await generateTicketImage(order);

        const mailOptions = {
          from: 'asebem.nationale@gmail.com',
          to: order.email,
          subject: 'Validation de votre réservation - Soirée de Gala',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2>Bonjour ${order.prenom} ${order.nom},</h2>
              <p>Votre réservation pour la Soirée de Gala a été validée avec succès.</p>
              <p>Veuillez trouver votre E-ticket officiel en pièce jointe de ce mail. Il contient un QR code unique qui sera scanné à l'entrée.</p>
              <p>Merci et à très bientôt !</p>
              <br />
              <p>L'équipe ASEBEM</p>
            </div>
          `,
          attachments: [
            {
              filename: 'ticket-gala.png',
              content: ticketBuffer
            }
          ]
        };
        await transporter.sendMail(mailOptions);
        console.log(`Email envoyé avec succès à ${order.email}`);
      } catch (mailError) {
        console.error("Erreur lors de l'envoi de l'email :", mailError);
        // On ne bloque pas la mise à jour du statut si l'email échoue
      }
    } else if (status === 'ANNULE' && order.status !== 'ANNULE') {
      try {
        const mailOptions = {
          from: 'asebem.nationale@gmail.com',
          to: order.email,
          subject: 'Annulation de votre réservation - Soirée de Gala',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
              <h2>Bonjour ${order.prenom} ${order.nom},</h2>
              <p>Nous sommes au regret de vous informer que votre réservation pour la Soirée de Gala a été annulée ou refusée.</p>
              <p>Pour plus d'informations ou en cas d'erreur, n'hésitez pas à nous contacter.</p>
              <br />
              <p>L'équipe ASEBEM</p>
            </div>
          `
        };
        await transporter.sendMail(mailOptions);
        console.log(`Email d'annulation envoyé avec succès à ${order.email}`);
      } catch (mailError) {
        console.error("Erreur lors de l'envoi de l'email d'annulation :", mailError);
      }
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
