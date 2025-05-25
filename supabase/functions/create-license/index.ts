
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateLicenseKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const segments = []
  for (let i = 0; i < 4; i++) {
    let segment = ''
    for (let j = 0; j < 4; j++) {
      segment += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    segments.push(segment)
  }
  return segments.join('-')
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid authentication' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const { email, durationDays, aviatorBotName, ownerName } = await req.json()

    console.log('Creating license for:', email, 'duration:', durationDays, 'bot:', aviatorBotName, 'owner:', ownerName, 'user:', user.id)

    // Check license count for this user
    const { count } = await supabase
      .from('licenses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (count && count >= 1000) {
      return new Response(
        JSON.stringify({ success: false, message: 'Maximum license limit of 1000 reached for your account' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const licenseKey = generateLicenseKey()
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + durationDays)

    const { data: license, error } = await supabase
      .from('licenses')
      .insert({
        key: licenseKey,
        email: email,
        expiration_date: expirationDate.toISOString(),
        is_active: true,
        aviator_bot_name: aviatorBotName,
        owner_name: ownerName,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating license:', error)
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to create license' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('License created successfully:', license.key)
    return new Response(
      JSON.stringify({
        success: true,
        message: 'License created successfully',
        license: {
          id: license.id,
          key: license.key,
          email: license.email,
          expirationDate: license.expiration_date,
          isActive: license.is_active,
          createdAt: license.created_at,
          aviatorBotName: license.aviator_bot_name,
          ownerName: license.owner_name
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in create-license function:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'Server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
