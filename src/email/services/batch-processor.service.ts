import { Injectable } from '@nestjs/common';
import { DatabaseEmailGroup, EmailGroup } from '../interfaces/email.interfaces';
import { UtilClass } from 'src/app/utils/util';

@Injectable()
export class BatchProcessorService {
  private readonly BATCH_SIZE = 50; // Grupos por lote

  /**
   * Divide un array en lotes más pequeños para procesamiento paralelo
   * Evita sobrecargar el servidor SMTP con demasiados emails simultáneos
   */
  createBatches<T>(array: T[], chunkSize: number = this.BATCH_SIZE): T[][] {
    const chunks: T[][] = [];
    
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    
    return chunks;
  }

  /**
   * Transforma datos de la BD al formato requerido por el worker
   * Simplifica la estructura y mantiene solo los datos necesarios
   */
  transformDatabaseGroups(databaseGroups: DatabaseEmailGroup[]): EmailGroup[] {
    const emailGroups = databaseGroups.map(group => {
      const emailsArr = UtilClass.parseEmailList(group.EmailsString)

      return {
        groupName: group.RazonSocial,
        emails: emailsArr
      }

    });

    return emailGroups;
  }

  /**
   * Pausa la ejecución por el tiempo especificado
   * Útil para evitar límites de rate limiting del servidor SMTP
   */
  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}