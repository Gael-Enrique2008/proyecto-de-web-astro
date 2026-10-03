import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"
import { pool } from "./connection.js"

const currentFile = fileURLToPath(import.meta.url)
const currentDir = dirname(currentFile)
const sqlPath = resolve(currentDir, "../../../db.sql")

export async function setupDatabase() {
  const sql = await readFile(sqlPath, "utf8")
  await pool.query(sql)
}
