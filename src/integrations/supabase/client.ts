// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ypfpcufhydljsjtalxlm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwZnBjdWZoeWRsanNqdGFseGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMTU5MDMsImV4cCI6MjA2MzY5MTkwM30.SJl9OdMWtFS6gq-EijfA0rR4IAFqzTgztsLdGynJtT8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);