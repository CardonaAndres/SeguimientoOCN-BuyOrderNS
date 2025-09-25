import sql from 'mssql';
import { Cron } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../email.service';
import { DatabaseService } from 'src/app/database/database.service';

@Injectable()
export class EmailSchedulerService {
  private readonly logger = new Logger(EmailSchedulerService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private emailService: EmailService
  ) {}

  @Cron('45 10 * * 2,4', { name: 'mass-email', timeZone: 'America/Bogota' })
  async handleMassEmailCampaign() {

    try {
      await this.emailService.sendMassEmails();

      const conn = await this.dbService.connect(process.env.DB_BUYORDER_NAME || 'localhost'); 

      await conn?.request()
        .input('estado', sql.VarChar, 'SUCCESS')
        .query(`INSERT INTO buyorder_db.dbo.email_logs (estado) VALUES (@estado)`);

    } catch (error) {
      this.logger.error('Error en campaña de correos:', error);
    }
    
  }
}