import { IsString, MinLength } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { PaginationDto } from "src/app/dtos/pagination.dto";

export class SearchSuppliersDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Texto de búsqueda para filtrar por nombre o correo del proveedor',
    example: 'Carrefour',
  })
  @MinLength(1, { message: 'El valor de búsqueda no puede estar vacío' })
  @IsString({ message: 'El valor de búsqueda debe ser una cadena de texto' })
  value: string;
}
