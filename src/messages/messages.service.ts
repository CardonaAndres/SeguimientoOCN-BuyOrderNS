import * as sql from 'mssql';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { DatabaseService } from 'src/app/database/database.service';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class MessagesService {
  constructor(private readonly dbService: DatabaseService) {}

  async findAll() {
    const conn = await this.dbService.connect(process.env.DB_BUYORDER_NAME || 'localhost');
    const result = await conn?.request().query(`SELECT * FROM buyorder_db.dbo.mensajes`);

    return {
      message: "Todos los mensajes encontrados",
      messages: result?.recordset,
    }
  }

  async create(createMessageDto: CreateMessageDto) {
    const conn = await this.dbService.connect(process.env.DB_BUYORDER_NAME || 'localhost');

    const exists = await conn?.request()
      .input('nombre', sql.VarChar, createMessageDto?.name)
      .query(`SELECT TOP 1 * FROM buyorder_db.dbo.mensajes WHERE nombre = @nombre`);

    if (exists?.recordset && exists.recordset.length > 0) 
      throw new ConflictException(`El tipo de mensaje "${createMessageDto.name}" ya existe.`);

    await conn?.request()
     .input('nombre', sql.VarChar, createMessageDto.name)
     .input('descripcion', sql.VarChar, createMessageDto.description || 'Sin descripción')
     .input('estado', sql.VarChar, createMessageDto.state)
     .query(`
        INSERT INTO buyorder_db.dbo.mensajes (nombre, descripcion, estado)
        VALUES (@nombre, @descripcion, @estado)
     `);

    return {
      message: `Tipo de mensaje "${createMessageDto.name}" creado correctamente.`
    }
  }

  async update(messageID: number, updateMessageDto: UpdateMessageDto) {
    const { name, description, state } = updateMessageDto;
    const conn = await this.dbService.connect(process.env.DB_BUYORDER_NAME || 'localhost');

    const existing = await conn?.request()
    .input('messageID', sql.Int, messageID)
    .query(`SELECT * FROM buyorder_db.dbo.mensajes WHERE mensaje_id = @messageID`);

    if (!existing || existing.recordset.length === 0) 
      throw new NotFoundException(`El mensaje con ID ${messageID} no existe.`);

    if (name) {
      const duplicate = await conn?.request()
        .input('messageID', sql.Int, messageID)
        .input('nombre', sql.VarChar(100), name)
        .query(`
          SELECT TOP 1 * FROM buyorder_db.dbo.mensajes
          WHERE nombre = @nombre AND mensaje_id <> @messageID
        `);

      if (!duplicate || duplicate.recordset.length > 0) 
        throw new ConflictException(`El nombre de mensaje "${name}" ya está en uso.`);
    }

    await conn?.request()
    .input('messageID', sql.Int, messageID)
    .input('nombre', sql.VarChar(100), name || existing?.recordset[0].nombre)
    .input('descripcion', sql.VarChar(100), description ?? existing?.recordset[0].descripcion)
    .input('estado', sql.VarChar(50), state ?? existing?.recordset[0].estado)
    .query(`
      UPDATE buyorder_db.dbo.mensajes
      SET nombre = @nombre, descripcion = @descripcion, estado = @estado
      WHERE mensaje_id = @messageID
    `);

    return {
      message: `Mensaje con ID ${messageID} actualizado correctamente.`,
    }
  }
}
