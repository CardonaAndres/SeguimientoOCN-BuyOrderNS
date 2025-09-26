import sql from 'mssql';
import { ConflictException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/app/database/database.service';
import { CreateUsersAllowedDto } from './dto/create-users-allowed.dto';
import { UpdateUsersAllowedDto } from './dto/update-users-allowed.dto';

@Injectable()
export class UsersAllowedService {
  constructor(private readonly dbService: DatabaseService){}
  
  async findAll() {
    const conn = await this.dbService.connect(process.env.DB_BUYORDER_NAME || 'localhost'); 
    const results = await conn?.request().query(`SELECT * FROM buyorder_db.dbo.usuarios`);

    return {
      message: 'Usarios con acceso al sistema',
      users: results?.recordset
    }
  }

  async create(createUsersAllowedDto: CreateUsersAllowedDto) {
    const { username, email, numDoc } = createUsersAllowedDto;
    const conn = await this.dbService.connect(process.env.DB_BUYORDER_NAME || 'localhost'); 

    const result = await conn?.request()
      .input('username', sql.VarChar, username)
      .input('email', sql.VarChar, email)
      .input('numDoc', sql.VarChar, numDoc)
      .query(`
        SELECT TOP 1 * FROM buyorder_db.dbo.usuarios
        WHERE username = @username OR email = @email OR num_documento = @numDoc
      `);

    if (result?.recordset && result.recordset.length > 0) {
      const conflict = result.recordset[0];

      if (conflict.username === username) 
          throw new ConflictException(`El nombre de usuario "${username}" ya está en uso.`)
      
      if (conflict.email === email) 
        throw new ConflictException(`El correo electrónico "${email}" ya está en uso.`)

      if (conflict.num_documento === numDoc) 
        throw new ConflictException(`El número de documento "${numDoc}" ya está en uso.`)

    }

    await conn?.request()
     .input('username', sql.VarChar, username)
     .input('email', sql.VarChar, email)
     .input('numDoc', sql.VarChar, numDoc)
     .query(` 
        INSERT INTO buyorder_db.dbo.usuarios (username, email, num_documento, estado)
        VALUES (@username, @email, @numDoc, 'Activo')
      `);

    return {
      message: `Acceso autorizado para el usuario: ${createUsersAllowedDto.username}`,
    }
  }

  async update(userID: number, updateUsersAllowedDto: UpdateUsersAllowedDto) {
    const { username, email, numDoc, state } = updateUsersAllowedDto;
    const conn = await this.dbService.connect(process.env.DB_BUYORDER_NAME || 'localhost');

    const result = await conn?.request()
    .input('userID', sql.Int, userID)
    .input('username', sql.VarChar, username)
    .input('email', sql.VarChar, email)
    .input('numDoc', sql.VarChar, numDoc)
    .query(`
      SELECT TOP 1 * FROM buyorder_db.dbo.usuarios
      WHERE (username = @username OR email = @email OR num_documento = @numDoc)
      AND usuario_id != @userID
    `);

    if (result?.recordset && result.recordset.length > 0) {
      const conflict = result.recordset[0];

      if (conflict.username === username) 
        throw new ConflictException(`El nombre de usuario "${username}" ya está en uso.`);

      if (conflict.email === email) 
        throw new ConflictException(`El correo electrónico "${email}" ya está en uso.`);

      if (conflict.num_documento === numDoc) 
        throw new ConflictException(`El número de documento "${numDoc}" ya está en uso.`);
    }

    await conn?.request()
    .input('userID', sql.Int, userID)
    .input('username', sql.VarChar, username)
    .input('email', sql.VarChar, email)
    .input('numDoc', sql.VarChar, numDoc)
    .input('state', sql.VarChar, state)
    .query(`
      UPDATE buyorder_db.dbo.usuarios
      SET username = @username,
          email = @email,
          num_documento = @numDoc,
          estado = @state
      WHERE usuario_id = @userID
    `);

    return {
      message: `Acceso autorizado para el usuario: ${updateUsersAllowedDto.username}`,
    }
  }
}
