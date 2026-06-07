const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'asebem.nationale@gmail.com',
    pass: 'niujqovlmxnkzmwr',
  },
});

transporter.verify(function(error, success) {
  if (error) {
    console.error("ERREUR DE CONNEXION:");
    console.error(error);
  } else {
    console.log("CONNEXION REUSSIE!");
  }
});
