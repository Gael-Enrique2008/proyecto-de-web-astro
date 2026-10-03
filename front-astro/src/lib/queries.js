export const Q_CATALOGO = `
  query Catalogo($busqueda: String, $categoriaId: ID) {
    categorias { id nombre activo }
    productos(busqueda: $busqueda, categoriaId: $categoriaId) {
      id nombre descripcion precio imagen stock activo
      categoria { id nombre }
    }
  }
`

export const Q_PRODUCTO = `
  query Producto($id: ID!) {
    producto(id: $id) {
      id nombre descripcion precio imagen stock activo
      categoria { id nombre }
    }
  }
`

export const Q_MIS_PEDIDOS = `
  query MisPedidos {
    misPedidos {
      id
      numeroPedido
      total
      status
      fecha
      detalles {
        id
        cantidad
        subtotal
        producto {
          id
          nombre
        }
      }
      pago {
        id
        proveedor
        estado
      }
    }
  }
`

export const M_REGISTRAR_PEDIDO = `
  mutation RegistrarPedido($datos: CrearPedidoInput!) {
    registrarPedido(datos: $datos) {
      id numeroPedido total status fecha
      pago { id proveedor estado }
    }
  }
`

export const M_LOGIN = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      ok
      mensaje
      token
      usuario {
        id
        nombre
        email
        rol
        activo
      }
    }
  }
`

export const M_REGISTRAR_USUARIO = `
  mutation RegistrarUsuario($datos: RegistrarUsuarioInput!) {
    registrarUsuario(datos: $datos) {
      ok
      mensaje
      token
      usuario {
        id
        nombre
        email
        rol
        activo
      }
    }
  }
`

export const Q_DASHBOARD = `
  query Dashboard {
    dashboard {
      productos categorias usuarios pedidos pedidosPendientes pedidosPagados stockBajo ventas
    }
    pedidos {
      id numeroPedido fecha total status
      usuario { id nombre email }
    }
  }
`

export const Q_ADMIN_PRODUCTOS = `
  query AdminProductos {
    categorias(incluirInactivas: true) { id nombre activo }
    productos(incluirInactivos: true, limite: 200) {
      id nombre descripcion precio imagen stock activo
      categoria { id nombre activo }
    }
  }
`

export const M_CREAR_PRODUCTO = `
  mutation CrearProducto($datos: ProductoInput!) {
    crearProducto(datos: $datos) { id nombre }
  }
`

export const M_ACTUALIZAR_PRODUCTO = `
  mutation ActualizarProducto($id: ID!, $datos: ActualizarProductoInput!) {
    actualizarProducto(id: $id, datos: $datos) { id nombre stock activo }
  }
`

export const M_ELIMINAR_PRODUCTO = `
  mutation EliminarProducto($id: ID!) { eliminarProducto(id: $id) }
`

export const M_AJUSTAR_STOCK = `
  mutation AjustarStock($id: ID!, $stock: Int!) {
    ajustarStock(id: $id, stock: $stock) { id stock }
  }
`

export const Q_ADMIN_CATEGORIAS = `
  query AdminCategorias {
    categorias(incluirInactivas: true) {
      id nombre activo
      productos { id nombre activo }
    }
  }
`

export const M_CREAR_CATEGORIA = `
  mutation CrearCategoria($datos: CategoriaInput!) {
    crearCategoria(datos: $datos) { id nombre activo }
  }
`

export const M_ACTUALIZAR_CATEGORIA = `
  mutation ActualizarCategoria($id: ID!, $datos: CategoriaInput!) {
    actualizarCategoria(id: $id, datos: $datos) { id nombre activo }
  }
`

export const M_ELIMINAR_CATEGORIA = `
  mutation EliminarCategoria($id: ID!) { eliminarCategoria(id: $id) }
`

export const Q_ADMIN_PEDIDOS = `
  query AdminPedidos {
    pedidos {
      id numeroPedido fecha total status
      nombreReceptor ciudad estado codigoPostal
      usuario { id nombre email }
      pago { id proveedor estado monto }
      factura { id estado folio }
      detalles {
        id cantidad subtotal
        producto { id nombre }
      }
    }
  }
`

export const M_ESTADO_PEDIDO = `
  mutation EstadoPedido($id: ID!, $status: EstadoPedido!) {
    actualizarEstadoPedido(id: $id, status: $status) { id status }
  }
`

export const Q_ADMIN_PAGOS = `
  query AdminPagos {
    pagos {
      id proveedor referenciaExterna monto estado fecha
      pedido { id numeroPedido status }
    }
  }
`

export const M_ESTADO_PAGO = `
  mutation EstadoPago($id: ID!, $estado: String!) {
    actualizarEstadoPago(id: $id, estado: $estado) { id estado }
  }
`

export const Q_ADMIN_FACTURAS = `
  query AdminFacturas {
    facturas {
      id folio estado fecha xml
      pedido { id numeroPedido status total }
    }
    pedidos {
      id numeroPedido status total
      factura { id }
    }
  }
`

export const M_PREPARAR_FACTURA = `
  mutation PrepararFactura($pedidoId: ID!) {
    prepararFactura(pedidoId: $pedidoId) { id estado }
  }
`

export const Q_ADMIN_USUARIOS = `
  query AdminUsuarios {
    usuarios {
      id nombre email rol activo
      pedidos { id total status }
    }
  }
`

export const M_ACTUALIZAR_USUARIO = `
  mutation ActualizarUsuario($id: ID!, $rol: RolUsuario, $activo: Boolean) {
    actualizarUsuario(id: $id, rol: $rol, activo: $activo) { id rol activo }
  }
`

export const Q_CATEGORIAS = `
  query Categorias { categorias { id nombre activo } }
`
