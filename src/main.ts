import morgan from 'morgan';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const main = async () => {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
   .setTitle('NPO Follow Up | BuyOrder New Stetic')
   .setDescription(
      '📦 Microservicio Seguimiento OCN: Notifica a los proveedores sobre órdenes de compra pendientes, ' +
      'envía recordatorios automáticos vía email dos veces por semana (martes y jueves a las 11:00 a.m.) ' +
      'y redirige a un formulario donde pueden visualizar detalles de la orden y comentar cada ítem usando motivos predefinidos. ' +
      'Además, genera automáticamente cartas de atraso para órdenes no cumplidas, detallando los ítems afectados. ' +
      'Con esto se mejora la comunicación y transparencia con proveedores, se reduce el riesgo de incumplimientos, ' +
      'se asegura trazabilidad en las respuestas y se automatizan procesos clave, disminuyendo la carga operativa del equipo de compras.'
    )
   .setVersion('1.0.0')
   .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('API-BUYORDER/v1/docs', app, document);

  app.enableCors({
    origin : [process.env.BUYORDER_CLIENT],
    credentials : true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.use(morgan('dev'));

  app.setGlobalPrefix('API-BUYORDER/v1');

  app.useGlobalPipes(new ValidationPipe({
    whitelist : true,
    forbidNonWhitelisted: true, 
    transform: true 
  }));

  await app.listen(process.env.PORT ?? 3004, () => {
    console.log(`Server running on port ${process.env.PORT || 3004}`);
  });
}

main();
