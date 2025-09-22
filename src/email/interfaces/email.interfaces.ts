/**
 * Estructura de datos que viene de la base de datos
 */
export interface DatabaseEmailGroup {
  RazonSocial: string;
  EmailsString: string; 
}


export interface EmailGroup {
  emails: string[];   // Emails que recibirán el mismo correo
  groupName?: string; // Nombre del grupo (opcional)
}

/**
 * Resultado del envío de un lote de emails
 */
export interface EmailBatchResult {
  sent: number;           // Grupos enviados exitosamente
  total: number;          // Total de grupos en el lote
  batchNumber: number;    // Número del lote procesado
  errors?: EmailError[];  // Errores durante el envío
  error?: string;         // Error general del worker
}

/**
 * Error específico de envío de email
 */
export interface EmailError {
  emails: string[];  // Emails que fallaron
  error: string;     // Mensaje de error
}

export interface MagicTokenPayload {
  razonSocial: string
  iat: number;   
  exp?: number;       
}