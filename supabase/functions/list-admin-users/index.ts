import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the caller is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller is admin using their JWT
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

    // Check admin role
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

    // Use service role to list users from auth.users
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get all user_roles
    const { data: roles, error: rolesError } = await serviceClient
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: true });

    if (rolesError) {
      throw rolesError;
    }

    // Get user emails from auth.users via admin API
    const userIds = [...new Set((roles || []).map((r: any) => r.user_id))];
    const emailMap: Record<string, string> = {};

    for (const uid of userIds) {
      const { data: { user: authUser } } = await serviceClient.auth.admin.getUserById(uid);
      if (authUser?.email) {
        emailMap[uid] = authUser.email;
      }
    }

    // Merge emails into roles
    const enrichedRoles = (roles || []).map((r: any) => ({
      ...r,
      email: emailMap[r.user_id] || null,
    }));

    return new Response(JSON.stringify(enrichedRoles), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
