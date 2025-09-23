import { MagicTokenUtil } from 'src/email/utils/magic-token.util';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class TokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const token = req.params.token; // lo traes de la URL
    
    if (!token) {
      return false;
    }

    try {
      const supplierData = MagicTokenUtil.verifyToken(token);
      req.supplier = supplierData; // guardamos datos para usarlos en el controller
      return true;
    } catch (error) {
      return false;
    }
  }
}
