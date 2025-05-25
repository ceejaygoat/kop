
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

    console.log('Fetching all licenses')

    const { data: licenses, error } = await supabase
      .from('licenses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching licenses:', error)
      return new Response(
        JSON.stringify({ success: false, licenses: [], message: 'Failed to fetch licenses' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Fetched licenses:', licenses.length)
    return new Response(
      JSON.stringify({
        success: true,
        licenses: licenses.map(license => ({
          id: license.id,
          key: license.key,
          email: license.email,
          expirationDate: license.expiration_date,
          isActive: license.is_active,
          createdAt: license.created_at,
          aviatorBotName: license.aviator_bot_name,
          ownerName: license.owner_name
        }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in get-licenses function:', error)
    return new Response(
      JSON.stringify({ success: false, licenses: [], message: 'Server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
