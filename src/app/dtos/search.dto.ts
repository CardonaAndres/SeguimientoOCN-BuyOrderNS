import { Type } from 'class-transformer';
import { IsString, IsOptional, IsDate, IsEnum } from 'class-validator';
import { PaginationDto } from './pagination.dto';
import type { Time } from '../types/global.types';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchDTO extends PaginationDto {
  @ApiPropertyOptional({ description: 'Texto a buscar en consecutivo, proveedor o email', example: '12345' })
  @IsOptional()
  @IsString({ message: 'El valor debe ser un texto.' })
  value?: string;

  @ApiPropertyOptional({ description: 'Fecha estimada de llegada (ISO)', example: '2025-09-03' })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La fecha estimada de llegada debe ser una fecha válida.' })
  arrivalDate?: Date;

  @ApiPropertyOptional({ description: 'Comparación para arrivalDate', enum: ['before', 'after'] })
  @IsOptional()
  @IsEnum(
    ['before', 'after'], { message: 'El tipo de comparación para la fecha de llegada debe ser "before" o "after".' }
  )
  arrivalDateType?: Time; 
    
  @ApiPropertyOptional({ description: 'Fecha del pedido (ISO)', example: '2025-09-01' })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La fecha del pedido debe ser una fecha válida.' })
  orderDate?: Date;

  @ApiPropertyOptional({ description: 'Comparación para orderDate', enum: ['before', 'after'] })
  @IsOptional()
  @IsEnum(
    ['before', 'after'], { message: 'El tipo de comparación para la fecha del pedido debe ser "before" o "after".' }
  )
  orderDateType?: Time; 
}
