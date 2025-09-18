import { Injectable, Logger } from '@nestjs/common';
import { EmailWorkerManager } from './utils/email-worker.manager';
import { BatchProcessorService } from './services/batch-processor.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly workerManager: EmailWorkerManager,
    private readonly batchProcessor: BatchProcessorService,
  ) {}

  async sendMassEmails(): Promise<void> {
    // Obtener datos de la base de datos
    const databaseGroups = []

    // Transformar al formato requerido por el worker
    const emailGroups = this.batchProcessor.transformDatabaseGroups(databaseGroups);
    
    this.logger.log(`Iniciando envío de ${emailGroups.length} grupos de correos`);

    // Dividir en lotes para procesamiento paralelo
    const batches = this.batchProcessor.createBatches(emailGroups);
    
    // Procesar cada lote con pausa entre ellos
    for (let i = 0; i < batches.length; i++) {
      //! DESCOMENTAR LA LINEA 29 PARA EL ENVIO DE LOS CORREOS
      // await this.workerManager.processEmailBatch(batches[i], i + 1);
      
      // Pausa entre lotes para evitar sobrecarga del servidor SMTP
      if (i < batches.length - 1) 
        await this.batchProcessor.sleep(2000);
      
    }

    this.logger.log('Envío masivo completado');
  }
}