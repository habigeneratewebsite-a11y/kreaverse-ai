export default function StatusBadge({ status, credit }) {

  if (!status) return null

  const color =
    status === "connected" ? "#16a34a" :
    status === "error" ? "#dc2626" :
    "#475569"

  return (
    <div style={{
      marginTop: 10,
      padding: 10,
      borderRadius: 8,
      background: color,
      color: "white",
      fontSize: 14
    }}>
      {status === "connected"
        ? `✅ Connected | Credit: ${credit}`
        : "❌ Invalid API Key"}
    </div>
  )
}
