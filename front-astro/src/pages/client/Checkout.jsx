import { useState } from "react"
import ClientShell from "../../components/ClientShell"
import { useCartStore, selectItems, selectTotal } from "../../store/cartStore"
import { mutateGraphQL } from "../../lib/apollo"
import { M_REGISTRAR_PEDIDO, Q_CATEGORIAS } from "../../lib/queries"
import { useApi } from "../../lib/useApi"
import { useAuthStore } from "../../store/authStore"

const initial = {
  nombreReceptor: "",
  calle: "",
  numeroExterior: "",
  numeroInterior: "",
  colonia: "",
  ciudad: "",
  estado: "",
  codigoPostal: "",
  referencias: "",
  notas: ""
}

export default function Checkout({ navigate }) {
  const usuario = useAuthStore((state) => state.usuario)

  const items = useCartStore(selectItems(usuario?.id))
  const clear = useCartStore((state) => state.clear)
  const total = useCartStore(selectTotal(usuario?.id))

  const categories = useApi(Q_CATEGORIAS, {}, [])
  const [form, setForm] = useState(initial)
  const [provider, setProvider] = useState("MERCADO_PAGO")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [order, setOrder] = useState(null)

  const change = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setError("")

    const nombre = form.nombreReceptor.trim()
    const calle = form.calle.trim()
    const numeroExterior = form.numeroExterior.trim()
    const colonia = form.colonia.trim()
    const ciudad = form.ciudad.trim()
    const estado = form.estado.trim()
    const cp = form.codigoPostal.trim()

    if (nombre.length < 3) {
      setError("Ingresa un nombre válido")
      return
    }

    if (calle.length < 3) {
      setError("Ingresa una calle válida")
      return
    }

    if (!numeroExterior) {
      setError("Ingresa un número exterior")
      return
    }

    if (colonia.length < 3) {
      setError("Ingresa una colonia válida")
      return
    }

    if (ciudad.length < 2) {
      setError("Ingresa una ciudad válida")
      return
    }

    if (estado.length < 2) {
      setError("Ingresa un estado válido")
      return
    }

    if (!/^\d{5}$/.test(cp)) {
      setError("El código postal debe contener exactamente 5 números")
      return
    }

    setLoading(true)

    try {
      const result = await mutateGraphQL(M_REGISTRAR_PEDIDO, {
        datos: {
          proveedorPago: provider,
          direccion: {
            ...form,
            nombreReceptor: nombre,
            calle,
            numeroExterior,
            colonia,
            ciudad,
            estado,
            codigoPostal: cp
          },
          detalles: items.map((item) => ({
            productoId: item.producto.id,
            cantidad: item.cantidad
          }))
        }
      })

      setOrder(result.registrarPedido)
      clear(usuario.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ClientShell
      navigate={navigate}
      categories={categories.data?.categorias || []}
      onCategory={() => navigate("/")}
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">FINALIZAR</span>
          <h1>Checkout</h1>
        </div>
      </div>

      {order ? (
        <div className="success-card">
          <span className="eyebrow">PEDIDO CREADO</span>
          <h2>{order.numeroPedido}</h2>

          <p>
            El pago quedó registrado como{" "}
            <strong>{order.pago.estado.replaceAll("_", " ")}</strong>.
            La integración real con{" "}
            {order.pago.proveedor.replaceAll("_", " ")} se conecta en la
            siguiente etapa.
          </p>

          <button onClick={() => navigate("/pedidos")}>
            Ver mis pedidos
          </button>
        </div>
      ) : !items.length ? (
        <div className="state-card">
          No hay productos para finalizar.{" "}
          <button onClick={() => navigate("/")}>
            Volver a la tienda
          </button>
        </div>
      ) : (
        <div className="checkout-layout">
          <form className="form-card" onSubmit={submit}>
            <h2>Datos de entrega</h2>

            <div className="form-grid">
              <label className="full">
                Nombre del receptor
                <input
                  required
                  name="nombreReceptor"
                  value={form.nombreReceptor}
                  onChange={change}
                />
              </label>

              <label>
                Calle
                <input
                  required
                  name="calle"
                  value={form.calle}
                  onChange={change}
                />
              </label>

              <label>
                Número exterior
                <input
                  required
                  name="numeroExterior"
                  value={form.numeroExterior}
                  onChange={change}
                />
              </label>

              <label>
                Número interior
                <input
                  name="numeroInterior"
                  value={form.numeroInterior}
                  onChange={change}
                />
              </label>

              <label>
                Colonia
                <input
                  required
                  name="colonia"
                  value={form.colonia}
                  onChange={change}
                />
              </label>

              <label>
                Ciudad
                <input
                  required
                  name="ciudad"
                  value={form.ciudad}
                  onChange={change}
                />
              </label>

              <label>
                Estado
                <input
                  required
                  name="estado"
                  value={form.estado}
                  onChange={change}
                />
              </label>

              <label>
                Código postal
                <input
                  required
                  name="codigoPostal"
                  value={form.codigoPostal}
                  onChange={change}
                  inputMode="numeric"
                  maxLength={5}
                />
              </label>

              <label className="full">
                Referencias
                <textarea
                  name="referencias"
                  value={form.referencias}
                  onChange={change}
                />
              </label>

              <label className="full">
                Notas
                <textarea
                  name="notas"
                  value={form.notas}
                  onChange={change}
                />
              </label>
            </div>

            <h2>Método de pago</h2>

            <div className="payment-options">
              <label
                className={
                  provider === "MERCADO_PAGO"
                    ? "payment active"
                    : "payment"
                }
              >
                <input
                  type="radio"
                  value="MERCADO_PAGO"
                  checked={provider === "MERCADO_PAGO"}
                  onChange={(e) => setProvider(e.target.value)}
                />
                Mercado Pago
                <span>REST pendiente</span>
              </label>

              <label
                className={
                  provider === "PAYPAL"
                    ? "payment active"
                    : "payment"
                }
              >
                <input
                  type="radio"
                  value="PAYPAL"
                  checked={provider === "PAYPAL"}
                  onChange={(e) => setProvider(e.target.value)}
                />
                PayPal
                <span>REST pendiente</span>
              </label>
            </div>

            {error && (
              <div className="inline-error">
                {error}
              </div>
            )}

            <button disabled={loading}>
              {loading ? "Registrando..." : "Crear pedido"}
            </button>
          </form>

          <aside className="summary-card">
            <span className="eyebrow">TOTAL</span>

            {items.map((item) => (
              <div
                className="summary-line"
                key={item.producto.id}
              >
                <span>
                  {item.cantidad} × {item.producto.nombre}
                </span>

                <strong>
                  $
                  {Number(
                    item.producto.precio * item.cantidad
                  ).toLocaleString("es-MX")}
                </strong>
              </div>
            ))}

            <div className="summary-line total">
              <span>Total</span>
              <strong>
                ${Number(total).toLocaleString("es-MX")}
              </strong>
            </div>
          </aside>
        </div>
      )}
    </ClientShell>
  )
}