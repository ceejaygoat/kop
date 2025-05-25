
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

    const { licenseId } = await req.json()

    console.log('Toggling license status for:', licenseId)

    // First get the current status
    const { data: currentLicense, error: fetchError } = await supabase
      .from('licenses')
      .select('is_active')
      .eq('id', licenseId)
      .single()

    if (fetchError || !currentLicense) {
      console.error('License not found:', fetchError)
      return new Response(
        JSON.stringify({ success: false, message: 'License not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Toggle the status
    const newStatus = !currentLicense.is_active
    
    const { error: updateError } = await supabase
      .from('licenses')
      .update({ is_active: newStatus })
      .eq('id', licenseId)

    if (updateError) {
      console.error('Error updating license status:', updateError)
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to update license status' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('License status updated to:', newStatus)
    return new Response(
      JSON.stringify({
        success: true,
        message: `License ${newStatus ? 'activated' : 'deactivated'} successfully`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in toggle-license function:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'Server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
