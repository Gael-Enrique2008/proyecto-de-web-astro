import { useState } from "react"
import { ErrorBox, Loading, Status } from "../../components/Ui"
import { mutateGraphQL } from "../../lib/apollo"
import { M_ESTADO_PAGO, Q_ADMIN_PAGOS } from "../../lib/queries"
import { useApi } from "../../lib/useApi"

export default function AdminPayments() {
  const api = useApi(Q_ADMIN_PAGOS, {}, [])
  const [error, setError] = useState("")

  const update = async (id, estado) => {
    setError("")
    try {
      await mutateGraphQL(M_ESTADO_PAGO, { id, estado })
      api.reload()
    } catch (err) {
      setError(err.message)
    }
  }

  if (api.loading) return <Loading />
  if (api.error) return <ErrorBox message={api.error} retry={api.reload} />

  return (
    <>
      <div className="admin-title"><div><span className="eyebrow">REST · SIGUIENTE ETAPA</span><h1>Pagos</h1></div></div>
      <div className="notice-card">Por ahora se registra el proveedor y el intento de pago dentro de Quest Merchant. La llamada real a PayPal o Mercado Pago todavía no está conectada.</div>
      {error && <div className="inline-error standalone">{error}</div>}
      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Pedido</th><th>Proveedor</th><th>Monto</th><th>Fecha</th><th>Estado</th><th>Control local</th></tr></thead>
            <tbody>
              {api.data.pagos.map((payment) => (
                <tr key={payment.id}>
                  <td><strong>{payment.pedido.numeroPedido}</strong></td>
                  <td>{payment.proveedor.replaceAll("_", " ")}</td>
                  <td>${Number(payment.monto).toLocaleString("es-MX")}</td>
                  <td>{new Date(payment.fecha).toLocaleString("es-MX")}</td>
                  <td><Status value={payment.estado} /></td>
                  <td className="table-actions"><button onClick={() => update(payment.id, "APROBADO_LOCAL")}>Aprobar demo</button><button className="danger" onClick={() => update(payment.id, "RECHAZADO_LOCAL")}>Rechazar demo</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
