export default function handler(req, res) {
  res.status(200).json({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "OK" : "Missing",
    key: process.env.SUPABASE_SERVICE_ROLE_KEY ? "OK" : "Missing"
  })
}
