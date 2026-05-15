import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed"
    })
  }

  const { apiKey } = req.body

  if (!apiKey) {
    return res.status(400).json({
      success: false,
      message: "API Key required"
    })
  }

  try {

    // ✅ Cek API key di database Supabase
    const { data, error } = await supabase
      .from("api_keys")
      .select("*")
      .eq("api_key", apiKey)
      .single()

    if (error || !data) {
      return res.status(401).json({
        success: false,
        message: "API Key tidak ditemukan"
      })
    }

    if (!data.is_active) {
      return res.status(403).json({
        success: false,
        message: "API Key tidak aktif"
      })
    }

    const now = new Date()
    const expired = new Date(data.expired_at)

    if (expired < now) {
      return res.status(403).json({
        success: false,
        message: "API Key kedaluwarsa"
      })
    }

    // ✅ Ambil credit asli dari database (bukan dummy)
    const credit = data.credit ?? 50

    return res.status(200).json({
      success: true,
      credit: credit
    })

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: "Server error"
    })
  }
}
