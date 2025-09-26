import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsIn, Length } from 'class-validator';

export class CreateUsersAllowedDto {
  @ApiProperty({
    example: 'juanperez',
    description: 'Nombre de usuario único. Máximo 100 caracteres.',
  })
  @IsString({ message: 'El nombre de usuario debe ser una cadena de texto.' })
  @Length(1, 100, {
    message: 'El nombre de usuario debe tener entre $constraint1 y $constraint2 caracteres.',
  })
  username: string;

  @ApiProperty({
    example: 'juan.perez@mail.com',
    description: 'Correo electrónico único del usuario. Máximo 100 caracteres.',
  })
  @IsEmail({}, { message: 'El correo electrónico debe tener un formato válido.' })
  @Length(1, 100, {
    message: 'El correo electrónico debe tener entre $constraint1 y $constraint2 caracteres.',
  })
  email: string;

  @ApiProperty({
    example: '1234567890',
    description: 'Número de documento único del usuario. Máximo 100 caracteres.',
  })
  @IsString({ message: 'El número de documento debe ser una cadena de texto.' })
  @Length(1, 100, {
    message: 'El número de documento debe tener entre $constraint1 y $constraint2 caracteres.',
  })
  numDoc: string;

  @ApiProperty({
    example: 'Activo',
    description: 'Estado del usuario. Puede ser "Activo" o "Inactivo".',
    enum: ['Activo', 'Inactivo'],
  })
  @IsString({ message: 'El estado debe ser una cadena de texto.' })
  @IsIn(['Activo', 'Inactivo'], {
    message: 'El estado solo puede ser "Activo" o "Inactivo".',
  })
  state: string;
}
