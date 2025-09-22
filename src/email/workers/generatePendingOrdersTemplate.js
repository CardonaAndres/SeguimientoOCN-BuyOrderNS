function generatePendingOrdersTemplate(providerName) {
  const currentDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recordatorio de Órdenes Pendientes</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f4f4f4;
            }
            .container {
                background-color: #ffffff;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0, 163, 180, 1);
            }
            .header {
                text-align: center;
                border-bottom: 2px solid rgba(227, 231, 102, 1);
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: rgba(0, 163, 180, 1);
                margin: 0;
                font-size: 24px;
            }
            .content {
                margin-bottom: 30px;
            }
            .provider-info {
                background-color: #f8f9fa;
                padding: 15px;
                border-left: 4px solid rgba(0, 163, 180, 1);
                margin: 20px 0;
                border-radius: 5px;
            }
            .provider-name {
                font-weight: bold;
                color: #000000;
                font-size: 18px;
            }
            .footer {
                border-top: 2px solid rgba(0, 163, 180, 1);
                padding-top: 20px;
                text-align: center;
                color: #666;
            }
            .signature {
                margin-top: 20px;
                font-weight: bold;
                color: #333;
            }
            .date {
                color: #666;
                font-style: italic;
                margin-bottom: 20px;
            }
            p {
                margin-bottom: 15px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>NewStetic</h1>
            </div>
            
            <div class="content">
                <p class="date">${currentDate}</p>
                
                <p><strong>Estimado/a ${providerName}</strong></p>
                
                <p>Nos dirigimos a usted con el fin de recordarle las órdenes que a hoy se encuentran pendientes en el sistema.</p>
                
                <p>En caso de que ya haya realizado la entrega, por favor omitir este correo, o si por el contrario hay alguna novedad, respecto a precio, cantidad, fecha de entrega u otro; agradecemos responder sobre este mismo correo y le daremos respuesta en la mayor brevedad posible.</p>
                
                <div class="provider-info">
                    <div class="provider-name">Proveedor: ${providerName.toUpperCase()}</div>
                </div>
            </div>
            
            <div class="footer">
                <div class="signature">
                    Atentamente,<br>
                    <strong>Departamento de Compras NewStetic</strong>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}

module.exports = {
  generatePendingOrdersTemplate
};