import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn, Length, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    example: 'Recordatorio de Pago',
    description: 'Nombre único para el tipo de mensaje',
  })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @Length(1, 100, { message: 'El nombre debe tener entre $constraint1 y $constraint2 caracteres.' })
  name: string;

  @ApiProperty({
    example: 'Se utiliza para notificar vencimientos de pago',
    description: 'Descripción opcional del tipo de mensaje',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto.' })
  description?: string;

  @ApiProperty({
    example: 'Activo',
    enum: ['Activo', 'Inactivo'],
    description: 'Estado del tipo de mensaje',
  })
  @IsString({ message: 'El estado debe ser una cadena de texto.' })
  @IsIn(['Activo', 'Inactivo'], { message: 'El estado solo puede ser "Activo" o "Inactivo".' })
  state: 'Activo' | 'Inactivo';
}
