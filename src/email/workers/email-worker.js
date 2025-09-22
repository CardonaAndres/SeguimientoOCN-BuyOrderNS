const { parentPort, workerData } = require('worker_threads');
const { generatePendingOrdersTemplate } = require('./generatePendingOrdersTemplate');

let nodemailer;

try {
  nodemailer = require('nodemailer');
} catch (error) {
  parentPort.postMessage({
    sent: 0,
    total: workerData.emailGroups.length,
    batchNumber: workerData.batchNumber,
    error: `Error cargando nodemailer: ${error.message}`
  });
  process.exit(1);
}

async function sendGroupedEmails(emailGroups, batchNumber) {
  let transporter;
  
  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      requireTLS: true,
      tls: {
        ciphers: 'SSLv3',
        rejectUnauthorized: false
      }
    });

    await transporter.verify();
  } catch (error) {
    throw new Error(`Configuración SMTP inválida: ${error.message}`);
  }

  let sent = 0;
  const errors = [];

  for (let i = 0; i < emailGroups.length; i++) {
    const group = emailGroups[i];
    
    try {
      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: group.emails.join(', '),
        subject: 'Recordatorio de órdenes pendientes por entrega',
        html: generatePendingOrdersTemplate(group.groupName || 'Proveedor'),
      });
      
      sent++;
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      errors.push({
        emails: group.emails,
        error: error.message
      });
    }
  }

  return { sent, total: emailGroups.length, batchNumber, errors };
}

sendGroupedEmails(workerData.emailGroups, workerData.batchNumber)
  .then(result => parentPort.postMessage(result))
  .catch(error => {
    parentPort.postMessage({
      sent: 0,
      total: workerData.emailGroups.length,
      batchNumber: workerData.batchNumber,
      error: error.message
    });
  });