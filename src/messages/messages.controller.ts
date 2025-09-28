import { MessagesService } from './messages.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Controller, Get, Post, Body, Patch, Param, UseGuards, ParseIntPipe } from '@nestjs/common';
import { errorHandler } from 'src/app/handlers/error.handler';
import { TokenGuard } from 'src/supplier-orders/guards/token.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener todos los mensajes',
    description: 'Devuelve el listado completo de mensajes registrados en el sistema.',
  })
  @ApiResponse({ status: 200, description: 'Listado de mensajes recuperado con éxito.' })
  async findAll() {
    try {
      return await this.messagesService.findAll();
    } catch (err) {
      errorHandler(err);
    }
  }

  @Get('/by-token/:token')
  @UseGuards(TokenGuard)
  @ApiOperation({
    summary: 'Obtener mensajes por token de proveedor',
    description: 'Devuelve el listado de mensajes asociados a un proveedor, validando mediante token mágico.',
  })
  @ApiParam({
    name: 'token',
    description: 'Token mágico de validación del proveedor',
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Listado de mensajes asociado al token.' })
  @ApiResponse({ status: 401, description: 'Token inválido o expirado.' })
  async findAllByToken() {
    try {
      return await this.messagesService.findAll();
    } catch (err) {
      errorHandler(err);
    }
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Crear un nuevo mensaje',
    description: 'Crea un nuevo mensaje en el sistema.',
  })
  @ApiBody({ type: CreateMessageDto })
  @ApiResponse({ status: 201, description: 'Mensaje creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Error en los datos enviados.' })
  async create(@Body() createMessageDto: CreateMessageDto) {
    try {
      return await this.messagesService.create(createMessageDto);
    } catch (err) {
      errorHandler(err);
    }
  }

  @Patch(':messageID')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Actualizar un mensaje',
    description: 'Permite actualizar el contenido o estado de un mensaje existente.',
  })
  @ApiParam({
    name: 'messageID',
    description: 'Identificador numérico del mensaje',
    type: Number,
  })
  @ApiBody({ type: UpdateMessageDto })
  @ApiResponse({ status: 200, description: 'Mensaje actualizado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Mensaje no encontrado.' })
  async update(
    @Param('messageID', ParseIntPipe) messageID: number,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    try {
      return await this.messagesService.update(messageID, updateMessageDto);
    } catch (err) {
      errorHandler(err);
    }
  }
}
