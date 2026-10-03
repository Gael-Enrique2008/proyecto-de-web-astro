import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { pool } from "../db/connection.js"
import { GraphQLError } from "graphql"

function requireAuth(context) {
    if (!context.usuario) {
        throw new GraphQLError("Debes iniciar sesión", {
            extensions: {
                code: "UNAUTHENTICATED"
            }
        })
    }

    return context.usuario
}

function requireAdmin(context) {
    const usuario = requireAuth(context)

    if (usuario.rol !== "ADMIN") {
        throw new GraphQLError("No tienes permisos para realizar esta acción", {
            extensions: {
                code: "FORBIDDEN"
            }
        })
    }

    return usuario
}

function id(value) {
    return value === null || value === undefined ? null : String(value)
}

function money(value) {
    return Number(value || 0)
}

function iso(value) {
    return value ? new Date(value).toISOString() : null
}

function mapCategoria(row) {
    if (!row) return null
    return {
        ...row,
        id: id(row.id)
    }
}

function mapProducto(row) {
    if (!row) return null
    return {
        ...row,
        id: id(row.id),
        precio: money(row.precio)
    }
}

function mapUsuario(row) {
    if (!row) return null
    return {
        ...row,
        id: id(row.id)
    }
}

function mapPedido(row) {
    if (!row) return null
    return {
        ...row,
        id: id(row.id),
        numeroPedido: row.numero_pedido,
        total: money(row.total),
        fecha: iso(row.fecha),
        nombreReceptor: row.nombre_receptor,
        numeroExterior: row.numero_exterior,
        numeroInterior: row.numero_interior,
        codigoPostal: row.codigo_postal
    }
}

function mapDetalle(row) {
    if (!row) return null
    return {
        ...row,
        id: id(row.id),
        precio: money(row.precio),
        subtotal: money(row.subtotal)
    }
}

function mapPago(row) {
    if (!row) return null
    return {
        ...row,
        id: id(row.id),
        referenciaExterna: row.referencia_externa,
        monto: money(row.monto),
        fecha: iso(row.fecha)
    }
}

function mapFactura(row) {
    if (!row) return null
    return {
        ...row,
        id: id(row.id),
        fecha: iso(row.fecha)
    }
}

async function getPedidoById(pedidoId, executor = pool) {
    const result = await executor.query("SELECT * FROM pedido WHERE id = $1", [pedidoId])
    return mapPedido(result.rows[0])
}

export const resolvers = {
    Query: {
        categorias: async (_, { incluirInactivas = false }) => {
            const result = await pool.query(
                `SELECT * FROM categoria ${incluirInactivas ? "" : "WHERE activo = TRUE"} ORDER BY nombre`
            )
            return result.rows.map(mapCategoria)
        },

        categoria: async (_, { id: categoriaId }) => {
            const result = await pool.query("SELECT * FROM categoria WHERE id = $1", [categoriaId])
            return mapCategoria(result.rows[0])
        },

        productos: async (_, args) => {
            const {
                busqueda = "",
                categoriaId = null,
                incluirInactivos = false,
                limite = 50,
                desde = 0
            } = args

            const filtros = []
            const valores = []

            if (!incluirInactivos) {
                filtros.push("p.activo = TRUE")
            }

            const textoBusqueda = typeof busqueda === "string" ? busqueda.trim() : ""

            if (textoBusqueda) {
                valores.push(`%${textoBusqueda}%`)
                filtros.push(
                    `(p.nombre ILIKE $${valores.length} OR COALESCE(p.descripcion, '') ILIKE $${valores.length})`
                )
            }

            if (categoriaId) {
                valores.push(categoriaId)
                filtros.push(`p.categoria_id = $${valores.length}`)
            }

            valores.push(Math.max(1, Math.min(Number(limite) || 50, 200)))
            const limitePos = valores.length
            valores.push(Math.max(0, Number(desde) || 0))
            const desdePos = valores.length

            const where = filtros.length ? `WHERE ${filtros.join(" AND ")}` : ""
            const result = await pool.query(
                `SELECT p.* FROM producto p ${where} ORDER BY p.id LIMIT $${limitePos} OFFSET $${desdePos}`,
                valores
            )

            return result.rows.map(mapProducto)
        },

        producto: async (_, { id: productoId }) => {
            const result = await pool.query("SELECT * FROM producto WHERE id = $1", [productoId])
            return mapProducto(result.rows[0])
        },

        pedidos: async (_, __, context) => {
            requireAdmin(context)

            const result = await pool.query("SELECT * FROM pedido ORDER BY fecha DESC")
            return result.rows.map(mapPedido)
        },

        misPedidos: async (_, __, context) => {
            const usuario = requireAuth(context)

            const result = await pool.query(
                "SELECT * FROM pedido WHERE usuario_id = $1 ORDER BY fecha DESC",
                [usuario.id]
            )

            return result.rows.map(mapPedido)
        },

        usuarios: async (_, __, context) => {
            requireAdmin(context)

            const result = await pool.query(
                "SELECT id, nombre, email, rol, activo FROM usuario ORDER BY id"
            )

            return result.rows.map(mapUsuario)
        },

        pagos: async (_, __, context) => {
            requireAdmin(context)

            const result = await pool.query("SELECT * FROM pago ORDER BY fecha DESC")
            return result.rows.map(mapPago)
        },

        facturas: async (_, __, context) => {
            requireAdmin(context)

            const result = await pool.query("SELECT * FROM factura ORDER BY fecha DESC")
            return result.rows.map(mapFactura)
        },

        dashboard: async (_, __, context) => {
            requireAdmin(context)

            const result = await pool.query(`
        SELECT
          (SELECT COUNT(*) FROM producto WHERE activo = TRUE)::int AS productos,
          (SELECT COUNT(*) FROM categoria WHERE activo = TRUE)::int AS categorias,
          (SELECT COUNT(*) FROM usuario WHERE activo = TRUE)::int AS usuarios,
          (SELECT COUNT(*) FROM pedido)::int AS pedidos,
          (SELECT COUNT(*) FROM pedido WHERE status = 'PENDIENTE')::int AS pedidos_pendientes,
          (SELECT COUNT(*) FROM pedido WHERE status = 'PAGADO')::int AS pedidos_pagados,
          (SELECT COUNT(*) FROM producto WHERE activo = TRUE AND stock <= 5)::int AS stock_bajo,
          COALESCE((SELECT SUM(total) FROM pedido WHERE status NOT IN ('CANCELADO', 'PENDIENTE')), 0) AS ventas
      `)

            const row = result.rows[0]
            return {
                productos: row.productos,
                categorias: row.categorias,
                usuarios: row.usuarios,
                pedidos: row.pedidos,
                pedidosPendientes: row.pedidos_pendientes,
                pedidosPagados: row.pedidos_pagados,
                stockBajo: row.stock_bajo,
                ventas: money(row.ventas)
            }
        }
    },

    Mutation: {
        login: async (_, { email, password }) => {
            const result = await pool.query(
                "SELECT id, nombre, email, password, rol, activo FROM usuario WHERE LOWER(email) = LOWER($1)",
                [email.trim()]
            )

            const usuario = result.rows[0]

            if (!usuario) {
                return {
                    ok: false,
                    mensaje: "Correo o contraseña incorrectos",
                    usuario: null,
                    token: null
                }
            }

            if (!usuario.activo) {
                return {
                    ok: false,
                    mensaje: "El usuario está desactivado",
                    usuario: null,
                    token: null
                }
            }

            let passwordValida = false

            if (usuario.password.startsWith("$2")) {
                passwordValida = await bcrypt.compare(password, usuario.password)
            } else {
                passwordValida = password === usuario.password

                if (passwordValida) {
                    const hash = await bcrypt.hash(password, 10)

                    await pool.query(
                        "UPDATE usuario SET password = $1 WHERE id = $2",
                        [hash, usuario.id]
                    )
                }
            }

            if (!passwordValida) {
                return {
                    ok: false,
                    mensaje: "Correo o contraseña incorrectos",
                    usuario: null,
                    token: null
                }
            }

            const token = jwt.sign(
                {
                    id: usuario.id,
                    rol: usuario.rol
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "8h"
                }
            )

            return {
                ok: true,
                mensaje: "Acceso correcto",
                usuario: mapUsuario(usuario),
                token
            }
        },

        registrarUsuario: async (_, { datos }) => {
    const existente = await pool.query(
        "SELECT id FROM usuario WHERE LOWER(email) = LOWER($1)",
        [datos.email.trim()]
    )

    if (existente.rowCount > 0) {
        throw new Error("Ya existe una cuenta con ese correo")
    }

    const passwordHash = await bcrypt.hash(datos.password, 10)

    const result = await pool.query(
        `INSERT INTO usuario (
            nombre,
            email,
            password,
            rol,
            activo
        )
        VALUES ($1, $2, $3, 'CLIENTE', TRUE)
        RETURNING id, nombre, email, rol, activo`,
        [
            datos.nombre.trim(),
            datos.email.trim(),
            passwordHash
        ]
    )

    const usuario = result.rows[0]

    const token = jwt.sign(
        {
            id: usuario.id,
            rol: usuario.rol
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "8h"
        }
    )

    return {
        ok: true,
        mensaje: "Cuenta creada correctamente",
        usuario: mapUsuario(usuario),
        token
    }
},

        crearProducto: async (_, { datos }, context) => {
            requireAdmin(context)
            const result = await pool.query(
                `INSERT INTO producto (nombre, descripcion, precio, imagen, stock, activo, categoria_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
                [
                    datos.nombre.trim(),
                    datos.descripcion || null,
                    datos.precio,
                    datos.imagen || null,
                    datos.stock,
                    datos.activo ?? true,
                    datos.categoriaId
                ]
            )
            return mapProducto(result.rows[0])
        },

        actualizarProducto: async (_, { id: productoId, datos }, context) => {
            requireAdmin(context)

            const campos = []
            const valores = []
            const mapa = {
                nombre: "nombre",
                descripcion: "descripcion",
                precio: "precio",
                imagen: "imagen",
                stock: "stock",
                categoriaId: "categoria_id",
                activo: "activo"
            }

            for (const [clave, columna] of Object.entries(mapa)) {
                if (datos[clave] !== undefined && datos[clave] !== null) {
                    valores.push(datos[clave])
                    campos.push(`${columna} = $${valores.length}`)
                }
            }

            if (!campos.length) {
                const actual = await pool.query("SELECT * FROM producto WHERE id = $1", [productoId])
                return mapProducto(actual.rows[0])
            }

            valores.push(productoId)
            const result = await pool.query(
                `UPDATE producto SET ${campos.join(", ")} WHERE id = $${valores.length} RETURNING *`,
                valores
            )
            return mapProducto(result.rows[0])
        },

        eliminarProducto: async (_, { id: productoId }, context) => {
            requireAdmin(context)

            const result = await pool.query(
                "UPDATE producto SET activo = FALSE WHERE id = $1 RETURNING id",
                [productoId]
            )
            return result.rowCount === 1
        },

        crearCategoria: async (_, { datos }, context) => {
            requireAdmin(context)

            const result = await pool.query(
                "INSERT INTO categoria (nombre, activo) VALUES ($1, $2) RETURNING *",
                [datos.nombre.trim(), datos.activo ?? true]
            )
            return mapCategoria(result.rows[0])
        },

        actualizarCategoria: async (_, { id: categoriaId, datos }, context) => {
            requireAdmin(context)

            const result = await pool.query(
                "UPDATE categoria SET nombre = $1, activo = $2 WHERE id = $3 RETURNING *",
                [datos.nombre.trim(), datos.activo ?? true, categoriaId]
            )
            return mapCategoria(result.rows[0])
        },

        eliminarCategoria: async (_, { id: categoriaId }, context) => {
            requireAdmin(context)

            const result = await pool.query(
                "UPDATE categoria SET activo = FALSE WHERE id = $1 RETURNING id",
                [categoriaId]
            )
            return result.rowCount === 1
        },

        ajustarStock: async (_, { id: productoId, stock }) => {
            if (stock < 0) throw new Error("El stock no puede ser negativo")
            const result = await pool.query(
                "UPDATE producto SET stock = $1 WHERE id = $2 RETURNING *",
                [stock, productoId]
            )
            return mapProducto(result.rows[0])
        },

        registrarPedido: async (_, { datos }, context) => {
            const usuario = requireAuth(context)
            const client = await pool.connect()

            try {
                await client.query("BEGIN")

                if (!datos.detalles.length) {
                    throw new Error("El carrito está vacío")
                }

                let total = 0
                const productos = []

                for (const detalle of datos.detalles) {
                    const result = await client.query(
                        "SELECT * FROM producto WHERE id = $1 AND activo = TRUE FOR UPDATE",
                        [detalle.productoId]
                    )
                    const producto = result.rows[0]

                    if (!producto) throw new Error(`El producto ${detalle.productoId} no existe`)
                    if (detalle.cantidad < 1) throw new Error("La cantidad debe ser mayor a cero")
                    if (producto.stock < detalle.cantidad) {
                        throw new Error(`Stock insuficiente para ${producto.nombre}`)
                    }

                    const subtotal = money(producto.precio) * detalle.cantidad
                    total += subtotal
                    productos.push({ producto, cantidad: detalle.cantidad, subtotal })
                }

                const numeroPedido = `QM-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 900 + 100)}`
                const d = datos.direccion
                const pedidoResult = await client.query(
                    `INSERT INTO pedido (
            numero_pedido, total, status, usuario_id, nombre_receptor, calle,
            numero_exterior, numero_interior, colonia, ciudad, estado,
            codigo_postal, referencias, notas
          ) VALUES ($1, $2, 'PENDIENTE', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          RETURNING *`,
                    [
                        numeroPedido,
                        total,
                        usuario.id,
                        d.nombreReceptor,
                        d.calle,
                        d.numeroExterior,
                        d.numeroInterior || null,
                        d.colonia,
                        d.ciudad,
                        d.estado,
                        d.codigoPostal,
                        d.referencias || null,
                        d.notas || null
                    ]
                )

                const pedido = pedidoResult.rows[0]

                for (const item of productos) {
                    await client.query(
                        `INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio, subtotal)
             VALUES ($1, $2, $3, $4, $5)`,
                        [pedido.id, item.producto.id, item.cantidad, item.producto.precio, item.subtotal]
                    )
                    await client.query(
                        "UPDATE producto SET stock = stock - $1 WHERE id = $2",
                        [item.cantidad, item.producto.id]
                    )
                }

                await client.query(
                    `INSERT INTO pago (pedido_id, proveedor, monto, estado)
           VALUES ($1, $2, $3, 'PENDIENTE_INTEGRACION')`,
                    [pedido.id, datos.proveedorPago, total]
                )

                await client.query("COMMIT")
                return mapPedido(pedido)
            } catch (error) {
                await client.query("ROLLBACK")
                throw error
            } finally {
                client.release()
            }
        },

        actualizarEstadoPedido: async (_, { id: pedidoId, status }, context) => {
            requireAdmin(context)

            const client = await pool.connect()

            try {
                await client.query("BEGIN")
                const actualResult = await client.query("SELECT * FROM pedido WHERE id = $1 FOR UPDATE", [pedidoId])
                const actual = actualResult.rows[0]
                if (!actual) throw new Error("Pedido no encontrado")

                if (actual.status === "CANCELADO" && status !== "CANCELADO") {
                    throw new Error("Un pedido cancelado no puede reactivarse")
                }

                if (actual.status !== "CANCELADO" && status === "CANCELADO") {
                    const detalles = await client.query(
                        "SELECT producto_id, cantidad FROM detalle_pedido WHERE pedido_id = $1",
                        [pedidoId]
                    )
                    for (const detalle of detalles.rows) {
                        await client.query(
                            "UPDATE producto SET stock = stock + $1 WHERE id = $2",
                            [detalle.cantidad, detalle.producto_id]
                        )
                    }
                }

                const result = await client.query(
                    "UPDATE pedido SET status = $1 WHERE id = $2 RETURNING *",
                    [status, pedidoId]
                )

                if (status === "PAGADO") {
                    await client.query(
                        "UPDATE pago SET estado = 'APROBADO_LOCAL' WHERE pedido_id = $1 AND estado = 'PENDIENTE_INTEGRACION'",
                        [pedidoId]
                    )
                }

                await client.query("COMMIT")
                return mapPedido(result.rows[0])
            } catch (error) {
                await client.query("ROLLBACK")
                throw error
            } finally {
                client.release()
            }
        },

        actualizarEstadoPago: async (_, { id: pagoId, estado }, context) => {
            requireAdmin(context)

            const client = await pool.connect()

            try {
                await client.query("BEGIN")
                const result = await client.query(
                    "UPDATE pago SET estado = $1 WHERE id = $2 RETURNING *",
                    [estado.trim(), pagoId]
                )
                const pago = result.rows[0]
                if (!pago) throw new Error("Pago no encontrado")

                if (estado.toUpperCase().startsWith("APROBADO")) {
                    await client.query(
                        "UPDATE pedido SET status = 'PAGADO' WHERE id = $1 AND status = 'PENDIENTE'",
                        [pago.pedido_id]
                    )
                }

                await client.query("COMMIT")
                return mapPago(pago)
            } catch (error) {
                await client.query("ROLLBACK")
                throw error
            } finally {
                client.release()
            }
        },

        prepararFactura: async (_, { pedidoId }, context) => {
            requireAdmin(context)

            const pedidoResult = await pool.query(
                "SELECT * FROM pedido WHERE id = $1",
                [pedidoId]
            )

            const pedido = pedidoResult.rows[0]

            if (!pedido) {
                throw new Error("Pedido no encontrado")
            }

            if (pedido.status !== "PAGADO") {
                throw new Error("El pedido debe estar pagado antes de preparar la factura")
            }

            const result = await pool.query(
                `INSERT INTO factura (pedido_id, estado)
                VALUES ($1, 'PENDIENTE_SOAP')
                ON CONFLICT (pedido_id) DO UPDATE
                SET pedido_id = EXCLUDED.pedido_id
                RETURNING *`,
                [pedidoId]
            )

            return mapFactura(result.rows[0])
        },

        actualizarUsuario: async (_, { id: usuarioId, rol, activo }, context) => {
            requireAdmin(context)

            const campos = []
            const valores = []

            if (rol !== undefined && rol !== null) {
                valores.push(rol)
                campos.push(`rol = $${valores.length}`)
            }

            if (activo !== undefined && activo !== null) {
                valores.push(activo)
                campos.push(`activo = $${valores.length}`)
            }

            if (!campos.length) {
                const actual = await pool.query(
                    "SELECT id, nombre, email, rol, activo FROM usuario WHERE id = $1",
                    [usuarioId]
                )
                return mapUsuario(actual.rows[0])
            }

            valores.push(usuarioId)
            const result = await pool.query(
                `UPDATE usuario SET ${campos.join(", ")} WHERE id = $${valores.length}
         RETURNING id, nombre, email, rol, activo`,
                valores
            )
            return mapUsuario(result.rows[0])
        }
    },

    Categoria: {
        productos: async (categoria) => {
            const result = await pool.query(
                "SELECT * FROM producto WHERE categoria_id = $1 ORDER BY nombre",
                [categoria.id]
            )
            return result.rows.map(mapProducto)
        }
    },

    Producto: {
        categoria: async (producto) => {
            const result = await pool.query("SELECT * FROM categoria WHERE id = $1", [producto.categoria_id])
            return mapCategoria(result.rows[0])
        }
    },

    Usuario: {
        pedidos: async (usuario) => {
            const result = await pool.query(
                "SELECT * FROM pedido WHERE usuario_id = $1 ORDER BY fecha DESC",
                [usuario.id]
            )

            return result.rows.map(mapPedido)
        }
    },

    Pedido: {
        usuario: async (pedido) => {
            if (!pedido.usuario_id) return null
            const result = await pool.query(
                "SELECT id, nombre, email, rol, activo FROM usuario WHERE id = $1",
                [pedido.usuario_id]
            )
            return mapUsuario(result.rows[0])
        },
        detalles: async (pedido) => {
            const result = await pool.query(
                "SELECT * FROM detalle_pedido WHERE pedido_id = $1 ORDER BY id",
                [pedido.id]
            )
            return result.rows.map(mapDetalle)
        },
        pago: async (pedido) => {
            const result = await pool.query("SELECT * FROM pago WHERE pedido_id = $1", [pedido.id])
            return mapPago(result.rows[0])
        },
        factura: async (pedido) => {
            const result = await pool.query("SELECT * FROM factura WHERE pedido_id = $1", [pedido.id])
            return mapFactura(result.rows[0])
        }
    },

    DetallePedido: {
        producto: async (detalle) => {
            const result = await pool.query("SELECT * FROM producto WHERE id = $1", [detalle.producto_id])
            return mapProducto(result.rows[0])
        }
    },

    Pago: {
        pedido: async (pago) => getPedidoById(pago.pedido_id)
    },

    Factura: {
        pedido: async (factura) => getPedidoById(factura.pedido_id)
    }
}
