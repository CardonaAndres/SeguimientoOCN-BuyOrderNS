const { parentPort, workerData } = require('worker_threads');

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

/**
 * Procesa el envío de emails para un lote de grupos
 * Cada grupo recibe un email con todos sus miembros en copia
 */
async function sendGroupedEmails(emailGroups, batchNumber) {
  let transporter;
  
  try {
    // Crear conexión SMTP reutilizable
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

    // Verificar conexión antes de enviar
    await transporter.verify();
  } catch (error) {
    throw new Error(`Configuración SMTP inválida: ${error.message}`);
  }

  let sent = 0;
  const errors = [];

  // Procesar cada grupo de emails
  for (let i = 0; i < emailGroups.length; i++) {
    const group = emailGroups[i];
    
    try {
      // Enviar un email al grupo completo (todos en copia)
      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
        to: group.emails.join(', '), // Todos los emails del grupo
        subject: 'Newsletter Semanal - New Stetic',
        html: generateEmailTemplate(group.groupName || 'Suscriptor'),
      });
      
      sent++;
      // Pausa para evitar límites del servidor SMTP
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

/**
 * Genera el template HTML del email
 */
function generateEmailTemplate(recipientName) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Newsletter New Stetic</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #0078d4;">¡Hola ${recipientName}!</h1>
        <p>Este es tu newsletter semanal de New Stetic.</p>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2>Novedades de esta semana</h2>
          <p>Contenido de tu newsletter aquí...</p>
        </div>
        
        <p style="color: #666; font-size: 12px;">
          Has recibido este email porque estás suscrito a nuestro newsletter.
        </p>
    </body>
    </html>
  `;
}

// Ejecutar el worker
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