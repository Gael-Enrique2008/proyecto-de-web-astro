import "dotenv/config"
import pg from "pg"

const { Pool } = pg

const useUrl = Boolean(process.env.DATABASE_URL)

if (process.env.DATABASE_URL) {
    try {
        const dbUrl = new URL(process.env.DATABASE_URL)

        console.log("DATABASE_URL detectada")
        console.log("Host DB:", dbUrl.hostname)
        console.log("Puerto DB:", dbUrl.port)
        console.log("Usuario DB:", dbUrl.username)
    } catch (error) {
        console.error("DATABASE_URL inválida:", error.message)
    }
}

export const pool = new Pool(
    useUrl
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl:
                process.env.DB_SSL === "true"
                    ? { rejectUnauthorized: false }
                    : false
        }
        : {
            host: process.env.DB_HOST || "localhost",
            port: Number(process.env.DB_PORT) || 5432,
            database: process.env.DB_NAME || "quest_merchant",
            user: process.env.DB_USER || "postgres",
            password: process.env.DB_PASSWORD || "postgres",
            ssl:
                process.env.DB_SSL === "true"
                    ? { rejectUnauthorized: false }
                    : false
        }
)