import { useState } from "react"
import { mutateGraphQL } from "../../lib/apollo"
import { M_LOGIN } from "../../lib/queries"

export default function AdminLogin({ onLogin, navigate }) {
  const [email, setEmail] = useState("admin@questmerchant.com")
  const [password, setPassword] = useState("admin123")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError("")
    setLoading(true)
    try {
      const result = await mutateGraphQL(M_LOGIN, { email, password })
      const response = result.login
      if (!response.ok) throw new Error(response.mensaje)
      if (response.usuario.rol !== "ADMIN") throw new Error("Este usuario no tiene permisos de administrador")
      onLogin(response.usuario)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <span className="eyebrow">QUEST MERCHANT</span>
        <h1>Administración</h1>
        <p>Controla catálogo, inventario, pedidos, pagos, facturas y usuarios desde un solo lugar.</p>
        <form onSubmit={submit}>
          <label>Correo<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          {error && <div className="inline-error">{error}</div>}
          <button disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
          <button type="button" className="ghost" onClick={() => navigate("/")}>Volver a la tienda</button>
        </form>
        <div className="demo-credentials"><strong>Cuenta demo</strong><span>admin@questmerchant.com</span><span>admin123</span></div>
      </div>
    </div>
  )
}
