import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ContactRequest {
  name: string;
  email: string;
  message: string;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, message }: ContactRequest = await req.json();

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate input lengths
    if (name.length > 100) {
      return new Response(
        JSON.stringify({ error: "Name too long" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (email.length > 255) {
      return new Response(
        JSON.stringify({ error: "Email too long" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (message.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Message too long" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Rate limiting: max 3 contact submissions per email per hour
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase
      .from("contact_submissions")
      .select("id", { count: "exact", head: true })
      .eq("email", email)
      .gte("created_at", oneHourAgo);

    if (countError) {
      console.error("Rate limit check failed:", countError.message);
      return new Response(
        JSON.stringify({ error: "An unexpected error occurred. Please try again later." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if ((count ?? 0) >= 3) {
      return new Response(
        JSON.stringify({ error: "Too many submissions. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Record this contact submission for rate limiting
    await supabase.from("contact_submissions").insert({ email });

    // Sanitize inputs for HTML
    const sanitize = (str: string) => str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    const sanitizedName = sanitize(name);
    const sanitizedEmail = sanitize(email);
    const sanitizedMessage = sanitize(message);

    // Sanitize reply_to email (strip newlines to prevent header injection)
    const safeReplyTo = email.replace(/[\r\n]/g, "");

    const emailResponse = await resend.emails.send({
      from: "DJ Lobo Producciones <noreply@djloboproducciones.com>",
      to: ["djloboproducciones75@gmail.com"],
      reply_to: safeReplyTo,
      subject: `Nytt kontaktmeddelande från ${sanitizedName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; border-bottom: 2px solid #00d4ff; padding-bottom: 10px;">
            Nytt kontaktmeddelande
          </h1>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Namn:</strong> ${sanitizedName}</p>
            <p><strong>E-post:</strong> <a href="mailto:${sanitizedEmail}">${sanitizedEmail}</a></p>
          </div>
          <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h2 style="color: #333; margin-top: 0;">Meddelande:</h2>
            <p style="white-space: pre-wrap; line-height: 1.6;">${sanitizedMessage}</p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Detta meddelande skickades via kontaktformuläret på DJ Lobo Producciones.
          </p>
        </div>
      `,
    });

    console.log("Contact email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error in send-contact-email:", error instanceof Error ? error.message : error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again later." }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
