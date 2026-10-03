import { useState } from "react"
import ClientShell from "../../components/ClientShell"
import { ErrorBox, Loading } from "../../components/Ui"
import { useCartStore } from "../../store/cartStore"
import { Q_CATEGORIAS, Q_PRODUCTO } from "../../lib/queries"
import { useApi } from "../../lib/useApi"
import { useAuthStore } from "../../store/authStore"

export default function ProductDetail({ id, navigate }) {
  const [quantity, setQuantity] = useState(1)
  const [toast, setToast] = useState("")
  const add = useCartStore((state) => state.add)
  const productQuery = useApi(Q_PRODUCTO, { id }, [id])
  const categoryQuery = useApi(Q_CATEGORIAS, {}, [])
  const product = productQuery.data?.producto
  const usuario = useAuthStore((state) => state.usuario)

  const addToCart = () => {
    if (!product) return

    if (!usuario) {
      navigate("/login")
      return
    }

    add(usuario.id, product, quantity)
    setToast("Agregado al carrito")
    setTimeout(() => setToast(""), 1600)
  }

  return (
    <ClientShell
      navigate={navigate}
      categories={categoryQuery.data?.categorias || []}
      onCategory={() => navigate("/")}
    >
      {toast && <div className="toast">{toast}</div>}
      {productQuery.loading && <Loading />}
      {productQuery.error && <ErrorBox message={productQuery.error} retry={productQuery.reload} />}
      {product && (
        <div className="detail-grid">
          <div className="detail-image-wrap">
            <img className="detail-image" src={product.imagen || "/images/dados-arcanos.jpg"} alt={product.nombre} />
          </div>
          <div className="detail-info">
            <span className="pill">{product.categoria.nombre}</span>
            <h1>{product.nombre}</h1>
            <p>{product.descripcion}</p>
            <strong className="detail-price">${Number(product.precio).toLocaleString("es-MX")}</strong>
            <span className={product.stock <= 5 ? "stock low" : "stock"}>{product.stock} disponibles</span>
            <div className="quantity-row">
              <button className="ghost" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
              <strong>{quantity}</strong>
              <button className="ghost" onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}>+</button>
            </div>
            <div className="button-row">
              <button onClick={addToCart} disabled={!product.stock}>Agregar al carrito</button>
              <button className="ghost" onClick={() => navigate("/")}>Volver</button>
            </div>
          </div>
        </div>
      )}
    </ClientShell>
  )
}
