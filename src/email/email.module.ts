import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { EmailSchedulerService } from './services/email-scheduler.service';
import { BatchProcessorService } from './services/batch-processor.service';
import { EmailWorkerManager } from './utils/email-worker.manager';
import { MagicTokenService } from './services/magic-token.service';

@Module({
  imports: [ ScheduleModule.forRoot() ],
  controllers: [ EmailController ],
  providers: [
    EmailService, 
    EmailSchedulerService,
    BatchProcessorService,
    EmailWorkerManager,
    MagicTokenService
  ],
})

export class EmailModule {}
