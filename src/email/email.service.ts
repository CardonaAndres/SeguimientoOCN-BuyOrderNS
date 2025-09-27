import * as queries from '../suppliers/queries/queries';
import { Injectable, Logger } from '@nestjs/common';
import { EmailWorkerManager } from './utils/email-worker.manager';
import { BatchProcessorService } from './services/batch-processor.service';
import { DatabaseService } from 'src/app/database/database.service';
import { DatabaseEmailGroup } from './interfaces/email.interfaces';
import { PaginationDto } from 'src/app/dtos/pagination.dto';

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

    const databaseGroups = Array.from({ length: 200 }, () => ({
      RazonSocial: 'LABORATORIOS HIGIETEX S.A.S',
      EmailsString: 'ptic2@newstetic.com,pticdos@gmail.com'
    }));

    // Transformar al formato requerido por el worker
    const emailGroups = this.batchProcessor.transformDatabaseGroups(databaseGroups);
    
    this.logger.log(`Iniciando envío de ${emailGroups.length} grupos de correos`);

    // Dividir en lotes para procesamiento paralelo
    const batches = this.batchProcessor.createBatches(emailGroups);
    
    // Procesar cada lote con pausa entre ellos
    for (let i = 0; i < batches.length; i++) {
      this.logger.log(`🚀 Procesando lote ${i + 1} de ${batches.length} (${batches[i].length} grupos)`);
      await this.workerManager.processEmailBatch(batches[i], i + 1);
      
      // Pausa entre lotes para evitar sobrecarga del servidor SMTP
      if (i < batches.length - 1) {
        this.logger.log(`⏸️ Pausa de 2s antes del siguiente lote...`);
        await this.batchProcessor.sleep(2000);
      }
      
    }

    this.logger.log('Envío masivo completado');
  }

  async getEmailLogs(pagination: PaginationDto){
    const conn = await this.dbService.connect(process.env.DB_BUYORDER_NAME || 'localhost');

    const resultLogs = await conn?.request()
      .input('page', pagination.page)
      .input('limit', pagination.limit)
      .query(`
        SELECT 
          email_log_id, 
          estado, 
          error_mensaje,
          FORMAT(fecha, 'yyyy-MM-dd hh:mm:ss tt') AS fecha
        FROM buyorder_db.dbo.email_logs ORDER BY fecha DESC 
        OFFSET (@page - 1) * @limit ROWS FETCH NEXT @limit ROWS ONLY;
      `);

    const resultTotalLogs = await conn?.request().query(`
      SELECT COUNT(*) AS totalLogs FROM buyorder_db.dbo.email_logs;
    `);

    return {
      logs: resultLogs?.recordsets[0] || [], 
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        totalLogs: resultTotalLogs?.recordset[0].totalLogs || 0,
        totalPages: Math.ceil((resultTotalLogs?.recordset[0].totalLogs || 0) / pagination.limit)
      }
    }
  }
}