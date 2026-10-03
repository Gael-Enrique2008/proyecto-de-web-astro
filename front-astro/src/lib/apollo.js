import { ApolloClient, HttpLink, InMemoryCache, gql } from "@apollo/client"
import { useAuthStore } from "../store/authStore"

const httpLink = new HttpLink({
    uri: import.meta.env.VITE_GRAPHQL_URL || "https://proyecto-de-web-astro.onrender.com/",

  fetch: (uri, options = {}) => {
    const token = useAuthStore.getState().token
    const headers = new Headers(options.headers || {})

    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }

    return fetch(uri, {
      ...options,
      headers
    })
  }
})

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
})

export async function queryGraphQL(source, variables = {}) {
  const result = await client.query({
    query: gql(source),
    variables,
    fetchPolicy: "no-cache"
  })

  return result.data
}

export async function mutateGraphQL(source, variables = {}) {
  const result = await client.mutate({
    mutation: gql(source),
    variables
  })

  return result.data
}