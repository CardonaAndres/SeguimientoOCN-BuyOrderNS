import { Type } from 'class-transformer';
import { IsString, IsOptional, IsDate, IsEnum } from 'class-validator';
import { PaginationDto } from './pagination.dto';
import type { Time } from '../types/global.types';

export class SearchDTO extends PaginationDto {
  @IsOptional()
  @IsString({ message: 'El valor debe ser un texto.' })
  value?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La fecha estimada de llegada debe ser una fecha válida.' })
  arrivalDate?: Date;

  @IsOptional()
  @IsEnum(
    ['before', 'after'], { message: 'El tipo de comparación para la fecha de llegada debe ser "before" o "after".' }
  )
  arrivalDateType?: Time; 
    
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'La fecha del pedido debe ser una fecha válida.' })
  orderDate?: Date;

  @IsOptional()
  @IsEnum(
    ['before', 'after'], { message: 'El tipo de comparación para la fecha del pedido debe ser "before" o "after".' }
  )
  orderDateType?: Time; 
}
