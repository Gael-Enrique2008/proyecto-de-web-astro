import ClientShell from "../../components/ClientShell"
import { Empty } from "../../components/Ui"
import { Q_CATEGORIAS } from "../../lib/queries"
import { useApi } from "../../lib/useApi"
import { useCartStore, selectItems, selectTotal } from "../../store/cartStore"
import { useAuthStore } from "../../store/authStore"

export default function Cart({ navigate }) {
  const usuario = useAuthStore((state) => state.usuario)

  const items = useCartStore(selectItems(usuario.id))
  const update = useCartStore((state) => state.update)
  const remove = useCartStore((state) => state.remove)
  const total = useCartStore(selectTotal(usuario.id))

  const categories = useApi(Q_CATEGORIAS, {}, [])

  return (
    <ClientShell
      navigate={navigate}
      categories={categories.data?.categorias || []}
      onCategory={() => navigate("/")}
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">TU COMPRA</span>
          <h1>Carrito</h1>
        </div>
      </div>

      {!items.length ? (
        <Empty>
          Tu carrito está vacío. El dragón no se va a derrotar solo :p
        </Empty>
      ) : (
        <div className="cart-layout">
          <div className="cart-list">
            {items.map((item) => (
              <div className="cart-item" key={item.producto.id}>
                <img
                  src={item.producto.imagen || "/images/dados-arcanos.jpg"}
                  alt={item.producto.nombre}
                />

                <div className="cart-item-info">
                  <h3>{item.producto.nombre}</h3>
                  <span>
                    ${Number(item.producto.precio).toLocaleString("es-MX")}
                  </span>
                </div>

                <div className="quantity-row compact">
                  <button
                    className="ghost"
                    onClick={() =>
                      update(
                        usuario.id,
                        item.producto.id,
                        item.cantidad - 1
                      )
                    }
                  >
                    −
                  </button>

                  <strong>{item.cantidad}</strong>

                  <button
                    className="ghost"
                    onClick={() =>
                      update(
                        usuario.id,
                        item.producto.id,
                        item.cantidad + 1
                      )
                    }
                  >
                    +
                  </button>
                </div>

                <strong>
                  $
                  {Number(
                    item.producto.precio * item.cantidad
                  ).toLocaleString("es-MX")}
                </strong>

                <button
                  className="danger"
                  onClick={() =>
                    remove(usuario.id, item.producto.id)
                  }
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>

          <aside className="summary-card">
            <span className="eyebrow">RESUMEN</span>

            <div className="summary-line">
              <span>Productos</span>
              <strong>
                {items.reduce((s, i) => s + i.cantidad, 0)}
              </strong>
            </div>

            <div className="summary-line total">
              <span>Total</span>
              <strong>
                ${Number(total).toLocaleString("es-MX")}
              </strong>
            </div>

            <button onClick={() => navigate("/checkout")}>
              Continuar al checkout
            </button>
          </aside>
        </div>
      )}
    </ClientShell>
  )
}