import { pool } from "./connection.js"

export async function setupDatabase() {
    await pool.query("SELECT 1")
    console.log("Conexión a la base de datos verificada")
}