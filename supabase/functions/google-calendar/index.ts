import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory cache (persists across warm invocations of the same isolate).
// This blunts quota-abuse attempts by serving repeated anonymous calls from
// memory instead of forwarding every request to the Google Calendar API.
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let cachedPayload: string | null = null;
let cachedAt = 0;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Serve from cache when fresh to avoid forwarding repeated anonymous
    // requests to Google Calendar and exhausting daily API quota.
    if (cachedPayload && Date.now() - cachedAt < CACHE_TTL_MS) {
      return new Response(cachedPayload, {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
      });
    }

    // Fetch calendarId from database instead of accepting from caller
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: secrets, error: dbError } = await supabase
      .from('site_secrets')
      .select('google_calendar_id')
      .limit(1)
      .maybeSingle();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(JSON.stringify({ error: 'Failed to fetch calendar config' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const calendarId = secrets?.google_calendar_id;
    if (!calendarId) {
      return new Response(JSON.stringify({ error: 'No calendar configured' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('GOOGLE_CALENDAR_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Google Calendar API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const now = new Date().toISOString();
    const maxDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}&timeMin=${now}&timeMax=${maxDate}&singleEvents=true&orderBy=startTime&maxResults=10`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('Google Calendar API error:', data);
      return new Response(JSON.stringify({ error: 'Failed to fetch calendar', details: data.error?.message }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
