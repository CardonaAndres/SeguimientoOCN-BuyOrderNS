import * as fs from 'fs';
import * as path from 'path';
import { Worker } from 'worker_threads';
import { Injectable, Logger } from '@nestjs/common';
import { EmailGroup, EmailBatchResult } from '../interfaces/email.interfaces';

@Injectable()
export class EmailWorkerManager {
  private readonly logger = new Logger(EmailWorkerManager.name);

  /**
   * Ejecuta un worker para procesar un lote de grupos de emails
   * Cada worker maneja el envío SMTP en un hilo separado
   */
  async processEmailBatch(emailGroups: EmailGroup[], batchNumber: number): Promise<void> {
    const workerPath = this.getWorkerPath();
    
    if (!fs.existsSync(workerPath)) {
      this.logger.error(`Worker no encontrado: ${workerPath}`);
      return;
    }

    return new Promise((resolve) => {
      // Crear worker thread con los datos del lote
      const worker = new Worker(workerPath, {
        workerData: { emailGroups, batchNumber },
        env: process.env
      });

      let hasResponded = false;

      // Escuchar resultado del worker
      worker.on('message', (result: EmailBatchResult) => {
        if (!hasResponded) {
          hasResponded = true;
          this.logResult(result);
          resolve();
        }
      });

      // Manejar errores del worker
      worker.on('error', (error) => {
        if (!hasResponded) {
          hasResponded = true;
          this.logger.error(`Error en worker lote ${batchNumber}: ${error.message}`);
          resolve();
        }
      });

      // Manejar salida del worker
      worker.on('exit', (code) => {
        if (!hasResponded) {
          hasResponded = true;
          if (code !== 0) {
            this.logger.error(`Worker lote ${batchNumber} terminó con código: ${code}`);
          }
          resolve();
        }
      });
    });
  }

  /**
   * Obtiene la ruta del archivo worker según el entorno
   */
  private getWorkerPath(): string {
    return process.env.NODE_ENV === 'production' 
      ? path.join(__dirname, '..', 'workers', 'email-worker.js')
      : path.join(process.cwd(), 'src', 'email', 'workers', 'email-worker.js');
  }

  /**
   * Registra el resultado del procesamiento del lote
   */
  private logResult(result: EmailBatchResult): void {
    this.logger.log(`Lote ${result.batchNumber}: ${result.sent}/${result.total} grupos enviados`);
    
    if (result.errors && result.errors?.length > 0) 
      this.logger.warn(`Errores en lote ${result.batchNumber}: ${result.errors.length} fallos`);
    

    if (result.error) 
      this.logger.error(`Error general en lote ${result.batchNumber}: ${result.error}`);
  }
}