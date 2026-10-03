import { useState } from "react"
import { ErrorBox, Loading, Status } from "../../components/Ui"
import { mutateGraphQL } from "../../lib/apollo"
import { M_ACTUALIZAR_USUARIO, Q_ADMIN_USUARIOS } from "../../lib/queries"
import { useApi } from "../../lib/useApi"

export default function AdminUsers({ currentAdmin }) {
  const api = useApi(Q_ADMIN_USUARIOS, {}, [])
  const [error, setError] = useState("")

  const update = async (user, patch) => {
    setError("")
    try {
      await mutateGraphQL(M_ACTUALIZAR_USUARIO, { id: user.id, ...patch })
      api.reload()
    } catch (err) {
      setError(err.message)
    }
  }

  if (api.loading) return <Loading />
  if (api.error) return <ErrorBox message={api.error} retry={api.reload} />

  return (
    <>
      <div className="admin-title"><div><span className="eyebrow">ACCESO</span><h1>Usuarios</h1></div></div>
      {error && <div className="inline-error standalone">{error}</div>}
      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Usuario</th><th>Correo</th><th>Pedidos</th><th>Rol</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {api.data.usuarios.map((user) => (
                <tr key={user.id}>
                  <td><strong>{user.nombre}</strong></td>
                  <td>{user.email}</td>
                  <td>{user.pedidos.length}</td>
                  <td><select value={user.rol} onChange={(e) => update(user, { rol: e.target.value })} disabled={user.id === currentAdmin?.id}><option value="CLIENTE">CLIENTE</option><option value="ADMIN">ADMIN</option></select></td>
                  <td><Status value={user.activo ? "ACTIVO" : "INACTIVO"} /></td>
                  <td>{user.id !== currentAdmin?.id && <button className={user.activo ? "danger" : ""} onClick={() => update(user, { activo: !user.activo })}>{user.activo ? "Desactivar" : "Activar"}</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
