export function Loading() {
  return <div className="state-card">Cargando...</div>
}

export function ErrorBox({ message, retry }) {
  return (
    <div className="state-card error-box">
      <strong>No se pudo cargar</strong>
      <span>{message}</span>
      {retry && <button onClick={retry}>Reintentar</button>}
    </div>
  )
}

export function Empty({ children }) {
  return <div className="state-card">{children}</div>
}

export function Status({ value }) {
  const safe = String(value || "").toLowerCase().replaceAll("_", "-")
  return <span className={`status-badge status-${safe}`}>{String(value || "").replaceAll("_", " ")}</span>
}
