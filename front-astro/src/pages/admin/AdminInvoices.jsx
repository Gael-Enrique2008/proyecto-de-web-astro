import { useState } from "react"
import { ErrorBox, Loading, Status } from "../../components/Ui"
import { mutateGraphQL } from "../../lib/apollo"
import { M_PREPARAR_FACTURA, Q_ADMIN_FACTURAS } from "../../lib/queries"
import { useApi } from "../../lib/useApi"

export default function AdminInvoices() {
  const api = useApi(Q_ADMIN_FACTURAS, {}, [])
  const [error, setError] = useState("")

  const prepare = async (pedidoId) => {
    setError("")
    try {
      await mutateGraphQL(M_PREPARAR_FACTURA, { pedidoId })
      api.reload()
    } catch (err) {
      setError(err.message)
    }
  }

  if (api.loading) return <Loading />
  if (api.error) return <ErrorBox message={api.error} retry={api.reload} />

  const eligible = api.data.pedidos.filter((order) => order.status === "PAGADO" && !order.factura)

  return (
    <>
      <div className="admin-title"><div><span className="eyebrow">SOAP / XML · SIGUIENTE ETAPA</span><h1>Facturas</h1></div></div>
      <div className="notice-card">La sección ya identifica pedidos pagados y prepara el registro de factura. El timbrado SOAP y el XML real quedan listos para conectarse después.</div>
      {error && <div className="inline-error standalone">{error}</div>}
      {eligible.length > 0 && (
        <div className="panel">
          <div className="panel-head"><h2>Pedidos listos para facturar</h2></div>
          <div className="invoice-ready-grid">
            {eligible.map((order) => <div className="invoice-ready" key={order.id}><div><strong>{order.numeroPedido}</strong><span>${Number(order.total).toLocaleString("es-MX")}</span></div><button onClick={() => prepare(order.id)}>Preparar factura</button></div>)}
          </div>
        </div>
      )}
      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Pedido</th><th>Total</th><th>Folio</th><th>Fecha</th><th>Estado</th><th>XML</th></tr></thead>
            <tbody>
              {api.data.facturas.map((invoice) => (
                <tr key={invoice.id}>
                  <td><strong>{invoice.pedido.numeroPedido}</strong></td>
                  <td>${Number(invoice.pedido.total).toLocaleString("es-MX")}</td>
                  <td>{invoice.folio || "Pendiente"}</td>
                  <td>{new Date(invoice.fecha).toLocaleString("es-MX")}</td>
                  <td><Status value={invoice.estado} /></td>
                  <td>{invoice.xml ? "Disponible" : "Pendiente SOAP"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
