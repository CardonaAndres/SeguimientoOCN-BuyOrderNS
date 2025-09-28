import { TokenGuard } from './guards/token.guard';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { errorHandler } from 'src/app/handlers/error.handler';
import { SupplierOrdersService } from './supplier-orders.service';
import { MagicTokenUtil } from 'src/email/utils/magic-token.util';
import { Controller, Get, Param, UseGuards, Req, Post, Body } from '@nestjs/common';
import type { SupplierRequest } from './interfaces/supplier-request.interface';
import { SendCommentDTO } from './dto/send-comment.dto';

@UseGuards(TokenGuard) 
@Controller('supplier-orders')
export class SupplierOrdersController {
  constructor(private readonly supplierOrdersService: SupplierOrdersService) {}

  @Get('validate/:token')
  @ApiParam({
    name: 'token',
    description: 'Token mágico de validación del proveedor',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Token válido. Devuelve información del proveedor.',
  })
  @ApiResponse({
    status: 401,
    description: 'Token inválido o expirado',
  })
  async validateToken(@Param('token') token: string) {
    try {
      const { razonSocial } = MagicTokenUtil.verifyToken(token);
      return { valid: true, supplier: razonSocial };
    } catch (err) {
      errorHandler(err);
    }
  }

  @Get('/pending/:token')
  @ApiParam({
    name: 'token',
    description: 'Token mágico de validación del proveedor',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de órdenes de compra pendientes',
  })
  async findAllByToken(@Req() req: SupplierRequest) {
    try {
      return await this.supplierOrdersService.findAllNPOByToken(req);
    } catch (err) {
      errorHandler(err);
    }
  }

  @Get('/pending/:token/:consec_docto')
  @ApiParam({
    name: 'token',
    description: 'Token mágico de validación del proveedor',
    type: String,
  })
  @ApiParam({
    name: 'consec_docto',
    description: 'Consecutivo de la orden de compra nacional',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de los ítems de una orden de compra nacional de un proveedor.',
  })
  async findNpoItems(@Param('consec_docto') id: string) {
    try {
      return await this.supplierOrdersService.getNpoItems(id);
    } catch (err) {
      errorHandler(err);
    }
  }

  @Get('/commets/item/:token/:itemID')
  @ApiOperation({
    summary: 'Obtener comentarios de un ítem',
    description: 'Devuelve los comentarios asociados a un ítem específico dentro de una orden de compra.',
  })
  @ApiParam({
    name: 'token',
    description: 'Token mágico de validación del proveedor',
    type: String,
  })
  @ApiParam({
    name: 'itemID',
    description: 'Identificador del ítem dentro de la orden de compra',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de comentarios asociados al ítem.',
  })
  async getOrderItemsComments(@Param('itemID') itemID: string){
    try {
      return await this.supplierOrdersService.getOrderItemsComments(itemID)
    } catch (err) {
      errorHandler(err)
    }
  }
  
  @Post('/:token')
  @ApiOperation({
    summary: 'Enviar comentario de proveedor',
    description: 'Permite a un proveedor enviar un comentario relacionado a una orden de compra o ítem.',
  })
  @ApiParam({
    name: 'token',
    description: 'Token mágico de validación del proveedor',
    type: String,
  })
  @ApiResponse({
    status: 201,
    description: 'Comentario enviado exitosamente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Error en los datos enviados.',
  })
  async sendComment(@Body() comment: SendCommentDTO, @Req() req: SupplierRequest){ 
    try {
      return await this.supplierOrdersService.sendComment(comment, req);
    } catch (err) {
      errorHandler(err);
    }
  }
}
