import { useState } from "react"
import { ErrorBox, Loading, Status } from "../../components/Ui"
import { mutateGraphQL } from "../../lib/apollo"
import { M_ACTUALIZAR_PRODUCTO, M_CREAR_PRODUCTO, M_ELIMINAR_PRODUCTO, Q_ADMIN_PRODUCTOS } from "../../lib/queries"
import { useApi } from "../../lib/useApi"

const blank = { nombre: "", descripcion: "", precio: "", imagen: "", stock: "", categoriaId: "", activo: true }

export default function AdminProducts() {
  const api = useApi(Q_ADMIN_PRODUCTOS, {}, [])
  const [form, setForm] = useState(blank)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState("")

  const edit = (product) => {
    setEditing(product.id)
    setForm({
      nombre: product.nombre,
      descripcion: product.descripcion || "",
      precio: String(product.precio),
      imagen: product.imagen || "",
      stock: String(product.stock),
      categoriaId: product.categoria.id,
      activo: product.activo
    })
  }

  const reset = () => {
    setEditing(null)
    setForm(blank)
    setError("")
  }

  const submit = async (event) => {
    event.preventDefault()
    setError("")
    const datos = {
      nombre: form.nombre,
      descripcion: form.descripcion || null,
      precio: Number(form.precio),
      imagen: form.imagen || null,
      stock: Number(form.stock),
      categoriaId: form.categoriaId,
      activo: form.activo
    }
    try {
      if (editing) await mutateGraphQL(M_ACTUALIZAR_PRODUCTO, { id: editing, datos })
      else await mutateGraphQL(M_CREAR_PRODUCTO, { datos })
      reset()
      api.reload()
    } catch (err) {
      setError(err.message)
    }
  }

  const remove = async (id) => {
    if (!window.confirm("¿Desactivar este producto?")) return
    try {
      await mutateGraphQL(M_ELIMINAR_PRODUCTO, { id })
      api.reload()
    } catch (err) {
      setError(err.message)
    }
  }

  if (api.loading) return <Loading />
  if (api.error) return <ErrorBox message={api.error} retry={api.reload} />

  return (
    <>
      <div className="admin-title"><div><span className="eyebrow">CATÁLOGO</span><h1>Productos</h1></div></div>
      <div className="admin-two-col">
        <div className="panel">
          <div className="panel-head"><h2>{editing ? "Editar producto" : "Nuevo producto"}</h2></div>
          <form className="compact-form" onSubmit={submit}>
            <label>Nombre<input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></label>
            <label>Descripción<textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></label>
            <div className="form-grid">
              <label>Precio<input type="number" min="0" step="0.01" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} required /></label>
              <label>Stock<input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required /></label>
            </div>
            <label>Imagen<input value={form.imagen} onChange={(e) => setForm({ ...form, imagen: e.target.value })} placeholder="/images/producto.jpg" /></label>
            <label>Categoría<select value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: e.target.value })} required><option value="">Selecciona</option>{api.data.categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}{!c.activo ? " (inactiva)" : ""}</option>)}</select></label>
            <label className="checkbox"><input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />Activo</label>
            {error && <div className="inline-error">{error}</div>}
            <div className="button-row"><button>{editing ? "Guardar cambios" : "Crear producto"}</button>{editing && <button type="button" className="ghost" onClick={reset}>Cancelar</button>}</div>
          </form>
        </div>
        <div className="panel grow">
          <div className="panel-head"><h2>Catálogo completo</h2><span>{api.data.productos.length} productos</span></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {api.data.productos.map((product) => (
                  <tr key={product.id}>
                    <td><strong>{product.nombre}</strong></td>
                    <td>{product.categoria.nombre}</td>
                    <td>${Number(product.precio).toLocaleString("es-MX")}</td>
                    <td>{product.stock}</td>
                    <td><Status value={product.activo ? "ACTIVO" : "INACTIVO"} /></td>
                    <td className="table-actions"><button className="ghost" onClick={() => edit(product)}>Editar</button>{product.activo && <button className="danger" onClick={() => remove(product.id)}>Desactivar</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
