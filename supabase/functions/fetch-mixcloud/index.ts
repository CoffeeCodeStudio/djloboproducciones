import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

    // Service-role client used for privileged reads (Vault) and DB writes
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // --- Auth: allow either (a) valid CRON_SECRET header (checked against Vault), or (b) admin JWT ---
    const providedCronSecret = req.headers.get("x-cron-secret");
    let isCron = false;
    if (providedCronSecret) {
      const { data: vaultSecret } = await supabase.rpc("get_cron_secret");
      isCron = typeof vaultSecret === "string" && vaultSecret.length > 0 && providedCronSecret === vaultSecret;
    }


    if (!isCron) {
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

    // --- Check mixes for 404 (deleted on Mixcloud) — respects admin overrides ---
    let hidden = 0;
    let unhidden = 0;
    const { data: allMixes } = await supabase
      .from("mixcloud_mixes")
      .select("id, mixcloud_url, hidden, hidden_reason");

    if (allMixes) {
      const checks = await Promise.all(
        allMixes.map(async (m) => {
          try {
            const r = await fetch(m.mixcloud_url, { method: "HEAD", redirect: "follow" });
            return { id: m.id, ok: r.ok, status: r.status, wasHidden: m.hidden, reason: m.hidden_reason };
          } catch {
            return { id: m.id, ok: true, status: 0, wasHidden: m.hidden, reason: m.hidden_reason };
          }
        })
      );

      // Auto-hide on 404, but never overwrite an admin-set hidden_reason
      const toHide = checks
        .filter((c) => c.status === 404 && (!c.wasHidden || c.reason === "auto_404"))
        .filter((c) => c.reason !== "admin")
        .map((c) => c.id);

      // Auto-unhide ONLY if previously hidden by auto_404 (never touch admin-hidden)
      const toUnhide = checks
        .filter((c) => c.ok && c.wasHidden && c.reason === "auto_404")
        .map((c) => c.id);

      if (toHide.length > 0) {
        await supabase
          .from("mixcloud_mixes")
          .update({ hidden: true, hidden_reason: "auto_404" })
          .in("id", toHide);
        hidden = toHide.length;
      }
      if (toUnhide.length > 0) {
        await supabase
          .from("mixcloud_mixes")
          .update({ hidden: false, hidden_reason: null })
          .in("id", toUnhide);
        unhidden = toUnhide.length;
      }
    }

    return new Response(
      JSON.stringify({ success: true, fetched: cloudcasts.length, inserted, updated, hidden, unhidden, via: isCron ? "cron" : "admin" }),
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
