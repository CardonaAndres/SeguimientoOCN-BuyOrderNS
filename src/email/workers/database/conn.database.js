const sql = require('mssql');

class ConnDataBase {
    constructor() {
        this.pool = null;
        this.databases = [
            String(process.env.DB_BUYORDER_NAME)
        ];
    }

    async connect(databaseName) {
        if (!this.databases.includes(databaseName)) {
            console.log(`La base de datos ${databaseName} no está soportada.`);
            return null;
        }

        switch(databaseName) {
            case String(process.env.DB_BUYORDER_NAME):
                try {
                    const pool = new sql.ConnectionPool({
                        user: process.env.DB_BUYORDER_USER,
                        password: process.env.DB_BUYORDER_PASSWORD,
                        server: process.env.DB_BUYORDER_SERVER,
                        options: {
                            encrypt: false,
                            trustServerCertificate: true 
                        }
                    });

                    pool.on('connect', () => console.log('✓ Conexión exitosa a SST'));
                    pool.on('error', (err) => console.error('Error en la conexión a SST: ', err.message));

                    this.pool = await pool.connect();
                    return pool;

                } catch (err) {
                    console.error('Error al conectar a la base de datos:', err);
                    throw err;
                } 
                
            default:
                console.log(`La base de datos ${databaseName} no está soportada.`);
                return null;
        }
    }
}

module.exports = new ConnDataBase();