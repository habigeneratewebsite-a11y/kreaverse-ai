
export default function Toast({ message, type }) {

  if (!message) return null

  const bg =
    type === "success" ? "#16a34a" :
    type === "error" ? "#dc2626" :
    "#334155"

  return (
    <div style={{
      position: "fixed",
      bottom: 20,
      right: 20,
      padding: "12px 20px",
      borderRadius: 8,
      background: bg,
      color: "white",
      boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
      zIndex: 999
    }}>
      {message}
    </div>
  )
}
