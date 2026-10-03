import { useState } from "react"
import { ErrorBox, Loading, Status } from "../../components/Ui"
import { mutateGraphQL } from "../../lib/apollo"
import { M_ACTUALIZAR_CATEGORIA, M_CREAR_CATEGORIA, M_ELIMINAR_CATEGORIA, Q_ADMIN_CATEGORIAS } from "../../lib/queries"
import { useApi } from "../../lib/useApi"

export default function AdminCategories() {
  const api = useApi(Q_ADMIN_CATEGORIAS, {}, [])
  const [name, setName] = useState("")
  const [editing, setEditing] = useState(null)
  const [active, setActive] = useState(true)
  const [error, setError] = useState("")

  const submit = async (event) => {
    event.preventDefault()
    setError("")
    try {
      const variables = { datos: { nombre: name, activo: active } }
      if (editing) await mutateGraphQL(M_ACTUALIZAR_CATEGORIA, { id: editing, ...variables })
      else await mutateGraphQL(M_CREAR_CATEGORIA, variables)
      setName("")
      setEditing(null)
      setActive(true)
      api.reload()
    } catch (err) {
      setError(err.message)
    }
  }

  const edit = (category) => {
    setEditing(category.id)
    setName(category.nombre)
    setActive(category.activo)
  }

  const remove = async (id) => {
    if (!window.confirm("¿Desactivar esta categoría?")) return
    try {
      await mutateGraphQL(M_ELIMINAR_CATEGORIA, { id })
      api.reload()
    } catch (err) {
      setError(err.message)
    }
  }

  if (api.loading) return <Loading />
  if (api.error) return <ErrorBox message={api.error} retry={api.reload} />

  return (
    <>
      <div className="admin-title"><div><span className="eyebrow">ORGANIZACIÓN</span><h1>Categorías</h1></div></div>
      <div className="admin-two-col narrow-left">
        <div className="panel">
          <div className="panel-head"><h2>{editing ? "Editar categoría" : "Nueva categoría"}</h2></div>
          <form className="compact-form" onSubmit={submit}>
            <label>Nombre<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
            <label className="checkbox"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />Activa</label>
            {error && <div className="inline-error">{error}</div>}
            <div className="button-row"><button>{editing ? "Guardar" : "Crear"}</button>{editing && <button type="button" className="ghost" onClick={() => { setEditing(null); setName(""); setActive(true) }}>Cancelar</button>}</div>
          </form>
        </div>
        <div className="panel grow">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Categoría</th><th>Productos</th><th>Estado</th><th></th></tr></thead>
              <tbody>
                {api.data.categorias.map((category) => (
                  <tr key={category.id}>
                    <td><strong>{category.nombre}</strong></td>
                    <td>{category.productos.length}</td>
                    <td><Status value={category.activo ? "ACTIVA" : "INACTIVA"} /></td>
                    <td className="table-actions"><button className="ghost" onClick={() => edit(category)}>Editar</button>{category.activo && <button className="danger" onClick={() => remove(category.id)}>Desactivar</button>}</td>
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
