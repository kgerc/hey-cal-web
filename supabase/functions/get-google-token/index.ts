import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get user from request
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')

    // Create Supabase Admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user to verify authentication
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    if (userError) throw userError
    if (!user) throw new Error('User not found')

    // Query the connected_accounts table directly for the Google token
    // This is where tokens are stored after OAuth callback
    // Use limit(1) to get the most recent record if there are duplicates
    const { data: accountsList, error: queryError } = await supabaseAdmin
      .from('connected_accounts')
      .select('access_token, refresh_token, expires_at')
      .eq('user_id', user.id)
      .eq('provider', 'google')
      .order('updated_at', { ascending: false })
      .limit(1)

    if (queryError) {
      console.error('Query error:', queryError)
      throw queryError
    }

    if (!accountsList || accountsList.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No Google account connected' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const accounts = accountsList[0]

    if (!accounts.access_token) {
      return new Response(
        JSON.stringify({ error: 'No access token found in connected account' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({
        access_token: accounts.access_token,
        refresh_token: accounts.refresh_token,
        expires_at: accounts.expires_at
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Edge Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
