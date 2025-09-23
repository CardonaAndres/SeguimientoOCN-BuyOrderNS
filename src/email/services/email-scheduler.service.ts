import { Cron } from '@nestjs/schedule';
import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../email.service';

@Injectable()
export class EmailSchedulerService {
  private readonly logger = new Logger(EmailSchedulerService.name);

  constructor(private emailService: EmailService) {}

  @Cron('0 11 * * 2,4', { name: 'mass-email', timeZone: 'America/Bogota' })
  async handleMassEmailCampaign() {

    try {
      await this.emailService.sendMassEmails();
    } catch (error) {
      this.logger.error('Error en campaña de correos:', error);
    }
    
  }
}