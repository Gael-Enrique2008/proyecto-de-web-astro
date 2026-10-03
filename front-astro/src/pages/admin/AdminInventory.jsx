import { useState } from "react"
import { ErrorBox, Loading, Status } from "../../components/Ui"
import { mutateGraphQL } from "../../lib/apollo"
import { M_AJUSTAR_STOCK, Q_ADMIN_PRODUCTOS } from "../../lib/queries"
import { useApi } from "../../lib/useApi"

export default function AdminInventory() {
  const api = useApi(Q_ADMIN_PRODUCTOS, {}, [])
  const [values, setValues] = useState({})
  const [message, setMessage] = useState("")

  const save = async (product) => {
    const stock = Number(values[product.id] ?? product.stock)
    try {
      await mutateGraphQL(M_AJUSTAR_STOCK, { id: product.id, stock })
      setMessage(`Stock de ${product.nombre} actualizado`)
      setTimeout(() => setMessage(""), 1800)
      api.reload()
    } catch (err) {
      setMessage(err.message)
    }
  }

  if (api.loading) return <Loading />
  if (api.error) return <ErrorBox message={api.error} retry={api.reload} />

  return (
    <>
      {message && <div className="toast">{message}</div>}
      <div className="admin-title"><div><span className="eyebrow">EXISTENCIAS</span><h1>Inventario</h1></div><span>{api.data.productos.filter((p) => p.stock <= 5 && p.activo).length} con stock bajo</span></div>
      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Producto</th><th>Categoría</th><th>Stock actual</th><th>Estado</th><th>Nuevo stock</th><th></th></tr></thead>
            <tbody>
              {api.data.productos.filter((p) => p.activo).map((product) => (
                <tr key={product.id}>
                  <td><strong>{product.nombre}</strong></td>
                  <td>{product.categoria.nombre}</td>
                  <td>{product.stock}</td>
                  <td><Status value={product.stock === 0 ? "AGOTADO" : product.stock <= 5 ? "STOCK_BAJO" : "DISPONIBLE"} /></td>
                  <td><input className="table-input" type="number" min="0" value={values[product.id] ?? product.stock} onChange={(e) => setValues({ ...values, [product.id]: e.target.value })} /></td>
                  <td><button onClick={() => save(product)}>Guardar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
