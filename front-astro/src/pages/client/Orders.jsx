import ClientShell from "../../components/ClientShell"
import { ErrorBox, Loading, Status } from "../../components/Ui"
import { Q_CATEGORIAS, Q_MIS_PEDIDOS } from "../../lib/queries"
import { useApi } from "../../lib/useApi"
import { useAuthStore } from "../../store/authStore"

export default function Orders({ navigate }) {
  const usuario = useAuthStore((state) => state.usuario)
  const categories = useApi(Q_CATEGORIAS, {}, [])
  const orders = useApi(
    Q_MIS_PEDIDOS,
    {},
    [usuario?.id]
  )

  return (
    <ClientShell navigate={navigate} categories={categories.data?.categorias || []} onCategory={() => navigate("/")}>
      <div className="section-heading"><div><span className="eyebrow">{usuario?.nombre}</span><h1>Mis pedidos</h1></div></div>
      {orders.loading && <Loading />}
      {orders.error && <ErrorBox message={orders.error} retry={orders.reload} />}
      <div className="order-list">
        {(orders.data?.misPedidos || []).map((order) => (
          <article className="order-card" key={order.id}>
            <div className="order-head">
              <div><span className="eyebrow">{order.numeroPedido}</span><h3>{new Date(order.fecha).toLocaleString("es-MX")}</h3></div>
              <Status value={order.status} />
            </div>
            {order.detalles.map((detail) => <div className="order-line" key={detail.id}><span>{detail.cantidad} × {detail.producto.nombre}</span><strong>${Number(detail.subtotal).toLocaleString("es-MX")}</strong></div>)}
            <div className="order-foot"><span>{order.pago?.proveedor?.replaceAll("_", " ")} · {order.pago?.estado?.replaceAll("_", " ")}</span><strong>${Number(order.total).toLocaleString("es-MX")}</strong></div>
          </article>
        ))}
      </div>
    </ClientShell>
  )
}
