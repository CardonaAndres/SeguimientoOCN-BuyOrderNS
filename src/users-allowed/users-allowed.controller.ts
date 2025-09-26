import { AuthGuard } from 'src/auth/guards/auth.guard';
import { UsersAllowedService } from './users-allowed.service';
import { errorHandler } from 'src/app/handlers/error.handler';
import { CreateUsersAllowedDto } from './dto/create-users-allowed.dto';
import { UpdateUsersAllowedDto } from './dto/update-users-allowed.dto';
import { ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Patch, Param, UseGuards, ParseIntPipe } from '@nestjs/common';

@UseGuards(AuthGuard)
@ApiBearerAuth()
@Controller('users-allowed')
export class UsersAllowedController {
  constructor(private readonly usersAllowedService: UsersAllowedService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuarios permitidos' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida correctamente.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async findAll() {
    try {
      return this.usersAllowedService.findAll();
    } catch (err) {
      errorHandler(err);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario permitido' })
  @ApiResponse({ status: 201, description: 'Usuario creado correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o usuario ya existe.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  async create(@Body() createUsersAllowedDto: CreateUsersAllowedDto) {
    try {
      return await this.usersAllowedService.create(createUsersAllowedDto);
    } catch (err) {
      errorHandler(err);
    }
  }

  @Patch(':userID')
  @ApiOperation({ summary: 'Actualizar un usuario permitido' })
  @ApiParam({ name: 'userID', type: Number, description: 'ID del usuario a actualizar' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado correctamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o conflicto con otros registros.' })
  @ApiResponse({ status: 401, description: 'No autorizado.' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
  async update(
    @Param('userID', ParseIntPipe) userID: number, 
    @Body() updateUsersAllowedDto: UpdateUsersAllowedDto
  ) {
    try {
      return await this.usersAllowedService.update(userID, updateUsersAllowedDto);
    } catch (err) {
      errorHandler(err);
    }
  }
}
