import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface MixcloudCloudcast {
  key: string;
  name: string;
  url: string;
  pictures: { large: string; "1024wx1024h": string; extra_large: string };
  created_time: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const MIXCLOUD_USERNAME = "DjLobo75";
    const apiUrl = `https://api.mixcloud.com/${MIXCLOUD_USERNAME}/cloudcasts/?limit=20`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Mixcloud API returned ${response.status}`);
    }

    const data = await response.json();
    const cloudcasts: MixcloudCloudcast[] = data.data || [];

    let inserted = 0;
    for (const cast of cloudcasts) {
      const externalId = cast.key;

      // Check if already exists
      const { data: existing } = await supabase
        .from("mixcloud_mixes")
        .select("id")
        .eq("external_id", externalId)
        .maybeSingle();

      if (!existing) {
        const { error } = await supabase.from("mixcloud_mixes").insert({
          title: cast.name,
          mixcloud_url: `https://www.mixcloud.com${cast.key}`,
          cover_art_url:
            cast.pictures["1024wx1024h"] ||
            cast.pictures.extra_large ||
            cast.pictures.large,
          external_id: externalId,
          source: "auto",
          sort_order: inserted,
        });
        if (!error) inserted++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, fetched: cloudcasts.length, inserted }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("fetch-mixcloud error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
