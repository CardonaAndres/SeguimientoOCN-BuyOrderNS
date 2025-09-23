import { Request } from 'express';

export interface SupplierRequest extends Request {
  supplier: {
    razonSocial: string;
    
  };
}
