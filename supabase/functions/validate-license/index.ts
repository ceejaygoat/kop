
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { licenseKey } = await req.json()

    console.log('Validating license key:', licenseKey)

    const { data: license, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('key', licenseKey.trim())
      .single()

    if (error || !license) {
      console.log('License not found:', error)
      return new Response(
        JSON.stringify({ isValid: false, message: 'Invalid license key' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!license.is_active) {
      console.log('License is deactivated')
      return new Response(
        JSON.stringify({ isValid: false, message: 'License has been deactivated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const now = new Date()
    const expirationDate = new Date(license.expiration_date)

    if (expirationDate < now) {
      console.log('License has expired')
      return new Response(
        JSON.stringify({ isValid: false, message: 'License has expired' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('License is valid')
    return new Response(
      JSON.stringify({
        isValid: true,
        message: 'License is valid',
        data: {
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
    console.error('Error validating license:', error)
    return new Response(
      JSON.stringify({ isValid: false, message: 'Server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
