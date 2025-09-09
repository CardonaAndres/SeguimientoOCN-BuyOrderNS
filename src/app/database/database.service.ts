import * as sql from 'mssql';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService {
    private pool: Promise<sql.ConnectionPool> | null = null;
    private readonly databases: string[];

    constructor(private readonly configService: ConfigService) {
        this.databases = [
            String(this.configService.get<string>('DB_COMP_NAME')),
        ];
    }

    async connect(databaseName: string){
        if (!this.databases.includes(databaseName)) {
            console.log(`La base de datos ${databaseName} no está soportada.`);
            return null;
        }

        let config: sql.config;

        switch(databaseName){
            case String(this.configService.get<string>('DB_COMP_NAME')):
                config = {
                    user: this.configService.get<string>('DB_COMP_USER'),
                    password: this.configService.get<string>('DB_COMP_PASSWORD'),
                    server: this.configService.getOrThrow<string>('DB_COMP_SERVER'),
                    options: {
                        encrypt: true,
                        trustServerCertificate: true,
                    },
                };
            break; 

            default:
                console.log(`La base de datos ${databaseName} no está soportada.`);
                return null;
        }

        try {
            const pool = new sql.ConnectionPool(config);

            pool.on('connect', () => console.log(`✓ Conexión exitosa a ${databaseName}`));
            pool.on('error', (err) => console.error(`Error en la conexión a ${databaseName}:`, err.message));

            await pool.connect();
            this.pool = Promise.resolve(pool);
            return pool;

        } catch (err) {
            console.error('Error al conectar a la base de datos:', err);
            throw err;
        }

    }
}