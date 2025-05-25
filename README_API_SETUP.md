
# Aviator License System API Setup

This guide explains how to set up the real API connection between the Aviator app and the licensing system.

## Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Lovable Project**: Your current Aviator project

## Step 1: Set Up Supabase Database

1. Create a new Supabase project
2. Go to the SQL Editor and run this schema:

```sql
-- Create licenses table
CREATE TABLE licenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  expiration_date TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_licenses_key ON licenses(key);
CREATE INDEX idx_licenses_email ON licenses(email);

-- Enable Row Level Security (RLS)
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (adjust as needed for production)
CREATE POLICY "Allow all operations on licenses" ON licenses
FOR ALL USING (true);
```

## Step 2: Create Supabase Edge Functions

Create these edge functions in your Supabase project:

### validate-license function:
```typescript
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

    const { data: license, error } = await supabase
      .from('licenses')
      .select('*')
      .eq('key', licenseKey.trim())
      .single()

    if (error || !license) {
      return new Response(
        JSON.stringify({ isValid: false, message: 'Invalid license key' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!license.is_active) {
      return new Response(
        JSON.stringify({ isValid: false, message: 'License has been deactivated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const now = new Date()
    const expirationDate = new Date(license.expiration_date)

    if (expirationDate < now) {
      return new Response(
        JSON.stringify({ isValid: false, message: 'License has expired' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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
          createdAt: license.created_at
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ isValid: false, message: 'Server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
```

### create-license function:
```typescript
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

    const { email, durationDays } = await req.json()

    const licenseKey = generateLicenseKey()
    const expirationDate = new Date()
    expirationDate.setDate(expirationDate.getDate() + durationDays)

    const { data: license, error } = await supabase
      .from('licenses')
      .insert({
        key: licenseKey,
        email: email,
        expiration_date: expirationDate.toISOString(),
        is_active: true
      })
      .select()
      .single()

    if (error) {
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to create license' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

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
          createdAt: license.created_at
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: 'Server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
```

## Step 3: Configure Environment Variables

In your Lovable project, you'll need to set these environment variables:

1. `VITE_LICENSE_API_URL` - Your Supabase Functions URL
2. `VITE_SUPABASE_ANON_KEY` - Your Supabase Anonymous Key

You can find these in your Supabase project settings.

## Step 4: Deploy and Test

1. Deploy your Supabase edge functions
2. Update the environment variables in your Lovable project
3. Test the license validation and generation features

## Production Considerations

1. **Security**: Implement proper authentication for the admin licensing system
2. **Rate Limiting**: Add rate limiting to prevent abuse
3. **Monitoring**: Set up logging and monitoring for the API endpoints
4. **Backup**: Regular database backups
5. **CORS**: Restrict CORS to your specific domains

## Troubleshooting

- Check the Supabase function logs for errors
- Verify environment variables are set correctly
- Ensure database policies allow the required operations
- Test API endpoints directly using a tool like Postman
