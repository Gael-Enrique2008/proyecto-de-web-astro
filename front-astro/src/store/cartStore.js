import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useCartStore = create(
    persist(
        (set) => ({
            carts: {},

            add: (usuarioId, producto, cantidad = 1) => set((state) => {
                const items = state.carts[usuarioId] || []

                const existe = items.find(
                    (item) => item.producto.id === producto.id
                )

                let nuevosItems

                if (existe) {
                    nuevosItems = items.map((item) =>
                        item.producto.id === producto.id
                            ? {
                                ...item,
                                cantidad: Math.min(
                                    item.cantidad + cantidad,
                                    producto.stock
                                )
                            }
                            : item
                    )
                } else {
                    nuevosItems = [
                        ...items,
                        {
                            producto,
                            cantidad: Math.min(cantidad, producto.stock)
                        }
                    ]
                }

                return {
                    carts: {
                        ...state.carts,
                        [usuarioId]: nuevosItems
                    }
                }
            }),

            remove: (usuarioId, id) => set((state) => {
                const items = state.carts[usuarioId] || []

                return {
                    carts: {
                        ...state.carts,
                        [usuarioId]: items.filter(
                            (item) => item.producto.id !== id
                        )
                    }
                }
            }),

            decrease: (usuarioId, id) => set((state) => {
                const items = state.carts[usuarioId] || []

                return {
                    carts: {
                        ...state.carts,
                        [usuarioId]: items
                            .map((item) =>
                                item.producto.id === id
                                    ? {
                                        ...item,
                                        cantidad: item.cantidad - 1
                                    }
                                    : item
                            )
                            .filter((item) => item.cantidad > 0)
                    }
                }
            }),

            update: (usuarioId, id, cantidad) => set((state) => {
                const items = state.carts[usuarioId] || []

                return {
                    carts: {
                        ...state.carts,
                        [usuarioId]: items.map((item) =>
                            item.producto.id === id
                                ? {
                                    ...item,
                                    cantidad: Math.max(
                                        1,
                                        Math.min(cantidad, item.producto.stock)
                                    )
                                }
                                : item
                        )
                    }
                }
            }),

            clear: (usuarioId) => set((state) => ({
                carts: {
                    ...state.carts,
                    [usuarioId]: []
                }
            }))
        }),
        {
            name: "quest-carts"
        }
    )
)

export const selectItems = (usuarioId) => (state) =>
    state.carts[usuarioId] || []

export const selectCount = (usuarioId) => (state) =>
    (state.carts[usuarioId] || []).reduce(
        (acum, item) => acum + item.cantidad,
        0
    )

export const selectTotal = (usuarioId) => (state) =>
    (state.carts[usuarioId] || []).reduce(
        (acum, item) =>
            acum + item.producto.precio * item.cantidad,
        0
    )