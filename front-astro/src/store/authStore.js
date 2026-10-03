import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useAuthStore = create(
    persist(
        (set) => ({
            usuario: null,
            token: null,

            login: (usuario, token) => set({
                usuario,
                token
            }),

            logout: () => set({
                usuario: null,
                token: null
            })
        }),
        {
            name: "quest-auth"
        }
    )
)