import { Cron } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../email.service';

@Injectable()
export class EmailSchedulerService {
  private readonly logger = new Logger(EmailSchedulerService.name);

  constructor(private emailService: EmailService) {}

  @Cron('* * * * *', { name: 'mass-email', timeZone: 'America/Bogota' })
  async handleMassEmailCampaign() {
    this.logger.log('Iniciando campaña de correos masivos...');
    
    try {
      await this.emailService.sendMassEmails();
      this.logger.log('Campaña de correos completada exitosamente');
    } catch (error) {
      this.logger.error('Error en campaña de correos:', error);
    }
  }
}