import { useState } from "react"
import { ErrorBox, Loading, Status } from "../../components/Ui"
import { mutateGraphQL } from "../../lib/apollo"
import { M_ESTADO_PEDIDO, Q_ADMIN_PEDIDOS } from "../../lib/queries"
import { useApi } from "../../lib/useApi"

const statuses = ["PENDIENTE", "PAGADO", "EN_PREPARACION", "ENVIADO", "ENTREGADO", "CANCELADO"]

export default function AdminOrders() {
  const api = useApi(Q_ADMIN_PEDIDOS, {}, [])
  const [error, setError] = useState("")

  const change = async (id, status) => {
    setError("")
    try {
      await mutateGraphQL(M_ESTADO_PEDIDO, { id, status })
      api.reload()
    } catch (err) {
      setError(err.message)
    }
  }

  if (api.loading) return <Loading />
  if (api.error) return <ErrorBox message={api.error} retry={api.reload} />

  return (
    <>
      <div className="admin-title"><div><span className="eyebrow">OPERACIÓN</span><h1>Pedidos</h1></div><button onClick={api.reload}>Actualizar</button></div>
      {error && <div className="inline-error standalone">{error}</div>}
      <div className="order-admin-grid">
        {api.data.pedidos.map((order) => (
          <article className="admin-order-card" key={order.id}>
            <div className="order-head">
              <div><span className="eyebrow">{order.numeroPedido}</span><h3>{order.usuario?.nombre || order.nombreReceptor || "Invitado"}</h3></div>
              <Status value={order.status} />
            </div>
            <div className="order-admin-details">
              <span>{new Date(order.fecha).toLocaleString("es-MX")}</span>
              <span>{order.ciudad}, {order.estado} · CP {order.codigoPostal}</span>
              <span>{order.pago?.proveedor?.replaceAll("_", " ") || "Sin pago"} · {order.pago?.estado?.replaceAll("_", " ") || "N/A"}</span>
            </div>
            <div className="order-lines">
              {order.detalles.map((detail) => <div key={detail.id}><span>{detail.cantidad} × {detail.producto.nombre}</span><strong>${Number(detail.subtotal).toLocaleString("es-MX")}</strong></div>)}
            </div>
            <div className="order-foot"><strong>${Number(order.total).toLocaleString("es-MX")}</strong><select value={order.status} onChange={(e) => change(order.id, e.target.value)} disabled={order.status === "CANCELADO"}>{statuses.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></div>
          </article>
        ))}
      </div>
    </>
  )
}
