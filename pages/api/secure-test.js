import { supabase } from '../../lib/supabase'

export async function validateApiKey(apiKey) {
  if (!apiKey) return { error: 'API key required' }

  const { data, error } = await supabase
    .from('api_keys')
    .select('*')
    .eq('api_key', apiKey)
    .single()

  if (error || !data) return { error: 'Invalid API key' }
  if (!data.is_active) return { error: 'API key not active' }
  if (new Date(data.expired_at) < new Date()) return { error: 'API key expired' }

  return { success: true }
}

export default async function handler(req, res) {
  const apiKey = req.headers['x-api-key']
  const check = await validateApiKey(apiKey)

  if (check.error) {
    return res.status(401).json({ error: check.error })
  }

  return res.status(200).json({
    success: true,
    message: 'API key valid ✅'
  })
}
