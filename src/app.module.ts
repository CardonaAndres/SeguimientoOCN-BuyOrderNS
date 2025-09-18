import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './app/database/database.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { AuthModule } from './auth/auth.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    DatabaseModule,
    PurchaseOrdersModule,
    SuppliersModule,
    EmailModule,
  ],
  controllers: [],
  providers: [],
})

export class AppModule {}
