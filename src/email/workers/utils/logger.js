const sql = require('mssql');
const db = require('../database/conn.database');

async function logError(errorMessage) {
  try {
    const pool = await db.connect(process.env.DB_BUYORDER_NAME);

    await pool.request()
      .input('estado', sql.VarChar, 'ERROR')
      .input('error_mensaje', sql.NVarChar, errorMessage)
      .query(`
        INSERT INTO buyorder_db.dbo.email_logs (estado, error_mensaje)
        VALUES (@estado, @error_mensaje)
      `);

  } catch (err) {
    console.error('Error guardando log en DB:', err.message);
  }
}

module.exports = { logError };