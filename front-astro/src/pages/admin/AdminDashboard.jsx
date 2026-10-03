import { ErrorBox, Loading, Status } from "../../components/Ui"
import { Q_DASHBOARD } from "../../lib/queries"
import { useApi } from "../../lib/useApi"

export default function AdminDashboard() {
  const { data, loading, error, reload } = useApi(Q_DASHBOARD, {}, [])
  const stats = data?.dashboard

  if (loading) return <Loading />
  if (error) return <ErrorBox message={error} retry={reload} />

  const cards = [
    ["Productos", stats.productos],
    ["Categorías", stats.categorias],
    ["Usuarios", stats.usuarios],
    ["Pedidos", stats.pedidos],
    ["Pendientes", stats.pedidosPendientes],
    ["Pagados", stats.pedidosPagados],
    ["Stock bajo", stats.stockBajo],
    ["Ventas", `$${Number(stats.ventas).toLocaleString("es-MX")}`]
  ]

  return (
    <>
      <div className="admin-title"><div><span className="eyebrow">RESUMEN</span><h1>Dashboard</h1></div><button onClick={reload}>Actualizar</button></div>
      <div className="metric-grid">
        {cards.map(([label, value]) => <div className="metric-card" key={label}><span>{label}</span><strong>{value}</strong></div>)}
      </div>
      <div className="panel">
        <div className="panel-head"><div><span className="eyebrow">ACTIVIDAD</span><h2>Últimos pedidos</h2></div></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Pedido</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Estado</th></tr></thead>
            <tbody>
              {(data.pedidos || []).slice(0, 6).map((order) => (
                <tr key={order.id}>
                  <td>{order.numeroPedido}</td>
                  <td>{order.usuario?.nombre || "Invitado"}</td>
                  <td>{new Date(order.fecha).toLocaleDateString("es-MX")}</td>
                  <td>${Number(order.total).toLocaleString("es-MX")}</td>
                  <td><Status value={order.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="integration-strip">
        <div><strong>REST</strong><span>PayPal / Mercado Pago</span><small>Pendiente</small></div>
        <div><strong>SOAP</strong><span>Facturación XML</span><small>Pendiente</small></div>
        <div><strong>MCP</strong><span>Asistente IA</span><small>Pendiente</small></div>
        <div><strong>gRPC</strong><span>App móvil</span><small>Pendiente</small></div>
      </div>
    </>
  )
}
