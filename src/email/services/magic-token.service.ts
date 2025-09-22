import * as jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MagicTokenService {
  private readonly expiresIn = '2d';  
  private readonly secret = process.env.MAGIC_TOKEN_SECRET || 'super_secret_key';

  generateToken(companyName: string): string {
    const payload = { companyName };
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verifyToken(token: string): { companyName: string } {
    try {
      return jwt.verify(token, this.secret) as { companyName: string };
    } catch (err) {
      throw new Error('Token inválido o expirado');
    }
  }
}
