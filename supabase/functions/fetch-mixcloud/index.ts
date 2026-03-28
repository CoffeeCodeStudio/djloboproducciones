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

    // --- Auth check: verify caller is admin ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await anonClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleData } = await anonClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // --- End auth check ---

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
    let updated = 0;

    for (const cast of cloudcasts) {
      const externalId = cast.key;

      const { data: existing } = await supabase
        .from("mixcloud_mixes")
        .select("id, mixcloud_created_time")
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
          mixcloud_created_time: cast.created_time || null,
        });
        if (!error) inserted++;
      } else if (!existing.mixcloud_created_time && cast.created_time) {
        await supabase
          .from("mixcloud_mixes")
          .update({ mixcloud_created_time: cast.created_time })
          .eq("id", existing.id);
        updated++;
      }
    }

    return new Response(
      JSON.stringify({ success: true, fetched: cloudcasts.length, inserted, updated }),
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
