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

    // Get connected account with refresh token
    const { data: accounts, error: queryError } = await supabaseAdmin
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

    if (!accounts || accounts.length === 0 || !accounts[0].refresh_token) {
      return new Response(
        JSON.stringify({ error: 'No refresh token found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const account = accounts[0]

    // Check if token is still valid (with 5 minute buffer)
    if (account.expires_at) {
      const expiresAt = new Date(account.expires_at)
      const now = new Date()
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)

      if (expiresAt > fiveMinutesFromNow) {
        // Token is still valid, return it
        console.log('Token still valid, returning existing token')
        return new Response(
          JSON.stringify({
            access_token: account.access_token,
            expires_at: account.expires_at
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    // Token expired or about to expire, refresh it
    console.log('Token expired, refreshing...')

    const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: Deno.env.get('GOOGLE_CLIENT_ID') ?? '',
        client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET') ?? '',
        refresh_token: account.refresh_token,
        grant_type: 'refresh_token',
      }),
    })

    if (!refreshResponse.ok) {
      const error = await refreshResponse.json().catch(() => ({}))
      console.error('Token refresh failed:', error)
      throw new Error(error.error_description || 'Failed to refresh token')
    }

    const refreshData = await refreshResponse.json()
    const newAccessToken = refreshData.access_token
    const expiresIn = refreshData.expires_in || 3600
    const newExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    // Update database with new token
    const { error: updateError } = await supabaseAdmin
      .from('connected_accounts')
      .update({
        access_token: newAccessToken,
        expires_at: newExpiresAt,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('provider', 'google')

    if (updateError) {
      console.error('Failed to update token in database:', updateError)
      throw updateError
    }

    console.log('✓ Token refreshed and updated in database')

    return new Response(
      JSON.stringify({
        access_token: newAccessToken,
        expires_at: newExpiresAt
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
