import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class SendCommentDTO {
  @ApiProperty({
    description: 'Identificador del ítem de la orden (string externo o código único)',
    example: 'ITEM-12345',
  })
  @IsString({ message: 'El itemID debe ser un texto' })
  @IsNotEmpty({ message: 'El itemID no puede estar vacío' })
  @MaxLength(255, { message: 'El itemID no puede superar los 255 caracteres' })
  itemID: string;

  @ApiProperty({
    description: 'Identificador de la categoría de mensaje (UUID o ID string)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString({ message: 'El messageID debe ser un texto' })
  @IsNotEmpty({ message: 'El messageID no puede estar vacío' })
  @MaxLength(255, { message: 'El messageID no puede superar los 255 caracteres' })
  messageID: string;

  @ApiProperty({
    description: 'Comentario libre escrito por el proveedor',
    example: 'La entrega se realizará en 7 días hábiles.',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'El comentario debe ser un texto' })
  @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
  @MinLength(5, { message: 'El comentario debe tener al menos 5 caracteres' })
  @MaxLength(1000, { message: 'El comentario no puede superar los 1000 caracteres' })
  @Matches(/\w/, { message: 'El comentario debe contener al menos un carácter alfanumérico' })
  commentText: string;
}
