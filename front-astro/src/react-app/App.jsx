import { useEffect, useState } from "react"
import AdminShell from "../components/AdminShell"
import Home from "../pages/client/Home"
import ProductDetail from "../pages/client/ProductDetail"
import Cart from "../pages/client/Cart"
import Checkout from "../pages/client/Checkout"
import Orders from "../pages/client/Orders"
import AdminDashboard from "../pages/admin/AdminDashboard"
import AdminProducts from "../pages/admin/AdminProducts"
import AdminCategories from "../pages/admin/AdminCategories"
import AdminInventory from "../pages/admin/AdminInventory"
import AdminOrders from "../pages/admin/AdminOrders"
import AdminPayments from "../pages/admin/AdminPayments"
import AdminInvoices from "../pages/admin/AdminInvoices"
import AdminUsers from "../pages/admin/AdminUsers"
import { useAuthStore } from "../store/authStore"
import Login from "../pages/client/Login"
import Register from "../pages/client/Register"

function useRoute() {
  const [route, setRoute] = useState(window.location.pathname)

  useEffect(() => {
    const handler = () => setRoute(window.location.pathname)
    window.addEventListener("popstate", handler)

    return () => window.removeEventListener("popstate", handler)
  }, [])

  const navigate = (path) => {
    window.history.pushState({}, "", path)
    setRoute(path)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return { route, navigate }
}

function AppContent() {
  const { route, navigate } = useRoute()
  const usuario = useAuthStore((state) => state.usuario)
  const logout = useAuthStore((state) => state.logout)

  if (route === "/login") {
    return <Login navigate={navigate} />
  }

  if (route === "/registro") {
    return <Register navigate={navigate} />
  }

  if (route.startsWith("/admin")) {
    if (!usuario) {
      return <Login navigate={navigate} />
    }

    if (usuario.rol !== "ADMIN") {
      return <Home navigate={navigate} />
    }

    let page = <AdminDashboard />

    if (route === "/admin/productos") page = <AdminProducts />
    if (route === "/admin/categorias") page = <AdminCategories />
    if (route === "/admin/inventario") page = <AdminInventory />
    if (route === "/admin/pedidos") page = <AdminOrders />
    if (route === "/admin/pagos") page = <AdminPayments />
    if (route === "/admin/facturas") page = <AdminInvoices />
    if (route === "/admin/usuarios") {
      page = <AdminUsers currentAdmin={usuario} />
    }

    return (
      <AdminShell
        navigate={navigate}
        admin={usuario}
        logout={() => {
          logout()
          navigate("/")
        }}
        route={route}
      >
        {page}
      </AdminShell>
    )
  }

  if (route.startsWith("/producto/")) {
    return (
      <ProductDetail
        id={route.split("/").pop()}
        navigate={navigate}
      />
    )
  }

  if (route === "/carrito") {
    if (!usuario) return <Login navigate={navigate} />
    return <Cart navigate={navigate} />
  }

  if (route === "/checkout") {
    if (!usuario) return <Login navigate={navigate} />
    return <Checkout navigate={navigate} />
  }

  if (route === "/pedidos") {
    if (!usuario) return <Login navigate={navigate} />
    return <Orders navigate={navigate} />
  }

  return <Home navigate={navigate} />
}

export default function App() {
  return <AppContent />
}