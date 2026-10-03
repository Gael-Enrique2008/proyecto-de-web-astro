export default function ProductCard({ product, onOpen }) {
  return (
    <article className="product-card">
      <img src={product.imagen || "/images/dados-arcanos.jpg"} alt={product.nombre} />
      <div className="product-meta">
        <span className="pill">{product.categoria?.nombre}</span>
        <span className={product.stock <= 5 ? "stock low" : "stock"}>Stock {product.stock}</span>
      </div>
      <h3>{product.nombre}</h3>
      <p>{product.descripcion || "Producto de Quest Merchant"}</p>
      <div className="product-footer">
        <strong>${Number(product.precio).toLocaleString("es-MX")}</strong>
        <button onClick={() => onOpen(product.id)}>Ver</button>
      </div>
    </article>
  )
}
