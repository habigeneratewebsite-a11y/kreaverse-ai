import { useState } from "react"
import StatusBadge from "./StatusBadge"

export default function ApiKeySection({ onValid }) {

  const [apiKey, setApiKey] = useState("")
  const [status, setStatus] = useState(null)
  const [credit, setCredit] = useState(null)
  const [loading, setLoading] = useState(false)

  async function checkKey() {

    if (!apiKey) return

    setLoading(true)

    const res = await fetch("/api/check-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey })
    })

    const data = await res.json()
    setLoading(false)

    if (data.success) {
      setStatus("connected")
      setCredit(data.credit)
      onValid(apiKey)
    } else {
      setStatus("error")
    }
  }

  return (
    <div>
      <label>API Key</label>

      <input
        value={apiKey}
        onChange={e => setApiKey(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          borderRadius: 6,
          border: "1px solid #334155",
          background: "#0f172a",
          color: "white",
          marginBottom: 10
        }}
      />

      <button
        onClick={checkKey}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 6,
          border: "none",
          background: "#3b82f6",
          color: "white"
        }}
      >
        {loading ? "Checking..." : "Confirm API Key"}
      </button>

      <StatusBadge status={status} credit={credit} />
    </div>
  )
}
