import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsInt, Min } from "class-validator";

export class PaginationDto {
  @ApiPropertyOptional({ description: 'Número de página (mínimo 1, por defecto 1)', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'La página debe ser un número entero.' })
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ description: 'Cantidad de registros por página (mínimo 1, por defecto 10)', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero.' })
  @Min(1)
  limit: number = 10;
}
