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
  const imagePath = path.join(__dirname, '../src/assets/DIAMANT VIP Prestige copy.png');
  const image = await Jimp.read(imagePath);
  
  // Load fonts
  const fontMed = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
  const fontSmall = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);

  // 1. Cover and write Pack Type (Top Left)
  // The original says "DIAMANT VIP Prestige" around x:120, y:60
  const overlayPack = new Jimp(250, 60, 0x5a567aFF); // Using a color matching the background
  image.composite(overlayPack, 120, 50);
  
  let label = '';
  let sub = '';
  if (order.pack === 'StandardEtudiant') {
    label = 'ÉTUDIANT'; sub = 'Standard';
  } else if (order.pack === 'StandardProfessionnel') {
    label = 'PROFESSIONNEL'; sub = 'Standard';
  } else {
    label = 'VIP'; sub = 'Table 6 pers.';
  }
  image.print(fontMed, 125, 55, label);
  image.print(fontSmall, 125, 90, sub);

  // 2. Cover and write Price (Bottom Left)
  // Original is "3 000 DHS" around x:40, y:280
  const overlayPrice = new Jimp(200, 50, 0x5a567aFF);
  image.composite(overlayPrice, 40, 280);
  
  let price = 200;
  if (order.pack === 'VIP') price = 2000;
  if (order.pack === 'StandardProfessionnel') price = 300;
  
  const totalPrice = price * order.nombrePersonnes;
  
  image.print(fontMed, 40, 290, `${totalPrice} DHS`);

  // 3. Cover and write Places (Bottom Right)
  // Original is "6 pers." around x:800, y:280
  const overlayPlaces = new Jimp(100, 50, 0x5a567aFF);
  image.composite(overlayPlaces, 800, 280);
  image.print(fontMed, 800, 290, `${order.nombrePersonnes} pers.`);

  // 4. Generate QR code buffer (Top Right)
  const qrData = `GALA ASEBEM 2026\nID: ASEBEM-${order.id}\nPack: ${order.pack}\nNom: ${order.nom} ${order.prenom}\nCIN: ${order.cin}\nPlaces: ${order.nombrePersonnes}`;
  const qrDataUrl = await QRCode.toDataURL(qrData, { margin: 1 });
  const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
  const qrImage = await Jimp.read(qrBuffer);
  
  qrImage.resize(80, 80);
  // Original QR code is around x:790, y:50
  image.composite(qrImage, 790, 50); 
  
  return await image.getBufferAsync(Jimp.MIME_PNG);
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
