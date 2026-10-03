import { useCartStore, selectCount } from "../store/cartStore"
import { useAuthStore } from "../store/authStore"

export default function ClientShell({ children, navigate, categories = [], onCategory, search, setSearch }) {
  const usuario = useAuthStore((state) => state.usuario)
  const logout = useAuthStore((state) => state.logout)
  const count = useCartStore(selectCount(usuario?.id))
  
  return (
    <div className="client-shell">
      <header className="topbar">
        <button className="brand" onClick={() => navigate("/")}>Quest Merchant</button>
        <input
          className="search"
          value={search || ""}
          onChange={(e) => setSearch?.(e.target.value)}
          placeholder="Buscar manuales, dados, miniaturas..."
        />
        <div className="top-actions">
          <button
            className="ghost"
            onClick={() => usuario ? navigate("/pedidos") : navigate("/login")}
          >
            Mis pedidos
          </button>

          <button
            onClick={() => usuario ? navigate("/carrito") : navigate("/login")}
          >
            Carrito ({count})
          </button>

          {usuario ? (
            <>
              <span>Hola, {usuario.nombre}</span>
              <button className="ghost" onClick={logout}>
                Cerrar sesión
              </button>
            </>
          ) : (
            <button className="ghost" onClick={() => navigate("/login")}>
              Iniciar sesión
            </button>
          )}
          
        </div>
      </header>
      <aside className="sidebar">
        <div className="sidebar-title">Categorías</div>
        <button className="side-link" onClick={() => onCategory?.(null)}>Todo</button>
        {categories.map((category) => (
          <button className="side-link" key={category.id} onClick={() => onCategory?.(category.id)}>
            {category.nombre}
          </button>
        ))}
        <div className="sidebar-note">
          <strong>Arquitectura actual</strong>
          <span>React + Vite</span>
          <span>Apollo + GraphQL</span>
          <span>PostgreSQL</span>
        </div>
      </aside>
      <main className="content">{children}</main>
      <footer className="footer">Quest Merchant · Tu próxima aventura comienza aquí</footer>
    </div>
  )
}
