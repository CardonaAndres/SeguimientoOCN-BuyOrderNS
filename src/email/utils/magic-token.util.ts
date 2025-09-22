import * as jwt from 'jsonwebtoken';
import { BadRequestException } from '@nestjs/common';
import type { MagicTokenPayload } from '../interfaces/email.interfaces';

export class MagicTokenUtil {

  static verifyToken(token: string): MagicTokenPayload {
    try {
      const decoded = jwt.verify(
        token, 
        process.env.MAGIC_TOKEN_SECRET || 'supersecret'
      ) as MagicTokenPayload;

      return decoded;

    } catch (error) {
      throw new BadRequestException(`Token inválido o expirado: ${error.message}`)
    }
  }

}
