import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  const apiKey = req.query.key

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required (use ?key=...)' })
  }

  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('api_key', apiKey)
    .single()

  if (error || !data) {
    return res.status(401).json({ error: 'Invalid API key' })
  }

  if (!data.is_active) {
    return res.status(403).json({ error: 'API key not active' })
  }

  if (new Date(data.expired_at) < new Date()) {
    return res.status(403).json({ error: 'API key expired' })
  }

  return res.status(200).json({
    success: true,
    message: 'API key valid ✅'
  })
}
