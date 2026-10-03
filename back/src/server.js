import "dotenv/config"
import jwt from "jsonwebtoken"
import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from "@apollo/server/standalone"
import { typeDefs } from "./graphql/schema.js"
import { resolvers } from "./resolvers/resolvers.js"
import { setupDatabase } from "./db/setup.js"
import { pool } from "./db/connection.js"

const port = Number(process.env.PORT) || 4000

try {
  await setupDatabase()
  await pool.query("SELECT 1")

  const server = new ApolloServer({ typeDefs, resolvers })

  const { url } = await startStandaloneServer(server, {
    listen: { port },

    context: async ({ req }) => {
      const authHeader = req.headers.authorization || ""

      if (!authHeader.startsWith("Bearer ")) {
        return { usuario: null }
      }

      const token = authHeader.slice(7)

      try {
        const usuario = jwt.verify(
          token,
          process.env.JWT_SECRET
        )

        return { usuario }
      } catch {
        return { usuario: null }
      }
    }
  })

  console.log(`Quest Merchant GraphQL: ${url}`)
} catch (error) {
  console.error(error)
  process.exit(1)
}