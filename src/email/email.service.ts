import * as queries from '../suppliers/queries/queries';
import { Injectable, Logger } from '@nestjs/common';
import { EmailWorkerManager } from './utils/email-worker.manager';
import { BatchProcessorService } from './services/batch-processor.service';
import { DatabaseService } from 'src/app/database/database.service';
import { DatabaseEmailGroup } from './interfaces/email.interfaces';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly workerManager: EmailWorkerManager,
    private readonly batchProcessor: BatchProcessorService,
  ) {}

  async sendMassEmails(): Promise<void> {
    // Obtener datos de la base de datos
    const conn = await this.dbService.connect(process.env.DB_COMP_NAME || 'localhost'); 
    const results = await conn?.request()
     .query<DatabaseEmailGroup[]>(`USE UNOEE ${queries.getAllSuppliers} ORDER BY RazonSocial`);

     // ! A LA HORA DE PASAR A PRODUCCIÓN DESCOMENTAR LA LINEA 25 Y ELIMINAR LA 27
    // const databaseGroups: DatabaseEmailGroup[] = results?.recordset || [];

    const databaseGroups = [
      {
        RazonSocial: "LABORATORIOS HIGIETEX S.A.S",
        EmailsString: "amjimenez@newstetic.com,ptic2@newstetic.com"
      }
    ];

    // Transformar al formato requerido por el worker
    const emailGroups = this.batchProcessor.transformDatabaseGroups(databaseGroups);
    
    this.logger.log(`Iniciando envío de ${emailGroups.length} grupos de correos`);

    // Dividir en lotes para procesamiento paralelo
    const batches = this.batchProcessor.createBatches(emailGroups);
    
    // Procesar cada lote con pausa entre ellos
    for (let i = 0; i < batches.length; i++) {
      
      await this.workerManager.processEmailBatch(batches[i], i + 1);
      
      // Pausa entre lotes para evitar sobrecarga del servidor SMTP
      if (i < batches.length - 1) 
        await this.batchProcessor.sleep(2000);
      
    }

    this.logger.log('Envío masivo completado');
  }
}