const items = [
  ["/admin", "Dashboard"],
  ["/admin/productos", "Productos"],
  ["/admin/categorias", "Categorías"],
  ["/admin/inventario", "Inventario"],
  ["/admin/pedidos", "Pedidos"],
  ["/admin/pagos", "Pagos"],
  ["/admin/facturas", "Facturas"],
  ["/admin/usuarios", "Usuarios"]
]

export default function AdminShell({ children, navigate, admin, logout, route }) {
  return (
    <div className="admin-shell">
      <aside className="admin-nav">
        <button className="admin-brand" onClick={() => navigate("/admin")}>Quest Merchant</button>
        <span className="admin-kicker">PANEL ADMIN</span>
        <nav>
          {items.map(([path, label]) => (
            <button
              key={path}
              className={route === path ? "admin-link active" : "admin-link"}
              onClick={() => navigate(path)}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="admin-profile">
          <strong>{admin?.nombre}</strong>
          <span>{admin?.email}</span>
          <button className="ghost" onClick={() => navigate("/")}>Ver tienda</button>
          <button className="danger" onClick={logout}>Cerrar sesión</button>
        </div>
      </aside>
      <section className="admin-main">{children}</section>
    </div>
  )
}
