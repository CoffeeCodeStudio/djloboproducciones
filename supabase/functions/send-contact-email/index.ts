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

    // 1. Send notification to DJ Lobo (existing)
    const adminEmailResponse = await resend.emails.send({
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

    console.log("Admin notification sent:", adminEmailResponse);

    // 2. Send confirmation email to customer
    const customerEmailResponse = await resend.emails.send({
      from: "DJ Lobo Producciones <noreply@djloboproducciones.com>",
      to: [safeReplyTo],
      subject: "Tack för ditt meddelande — DJ Lobo Producciones",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 30px 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #00d4ff; margin: 0; font-size: 24px;">Tack för ditt meddelande!</h1>
          </div>
          <div style="padding: 24px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
            <p style="font-size: 16px; color: #333; line-height: 1.6; margin: 0 0 20px;">
              Hej <strong>${sanitizedName}</strong>,
            </p>
            <p style="font-size: 15px; color: #555; line-height: 1.6; margin: 0 0 20px;">
              Vi har tagit emot ditt meddelande och återkommer inom <strong>24 timmar</strong>.
            </p>

            <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <h2 style="font-size: 16px; color: #1a1a2e; margin: 0 0 12px;">📋 Ditt meddelande</h2>
              <p style="color: #333; font-size: 14px; margin: 0; white-space: pre-wrap; line-height: 1.5;">${sanitizedMessage}</p>
            </div>

            <div style="background: #1a1a2e; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="color: #ffffff; font-size: 14px; margin: 0 0 8px;">📞 Kontakta oss</p>
              <p style="margin: 0;">
                <a href="mailto:info@djloboproducciones.com" style="color: #00d4ff; text-decoration: none; font-size: 14px;">info@djloboproducciones.com</a>
              </p>
              <p style="margin: 4px 0 0;">
                <a href="tel:+46769125260" style="color: #00d4ff; text-decoration: none; font-size: 14px;">+46 76 912 52 60</a>
              </p>
            </div>

            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #999; font-size: 11px; text-align: center; margin: 0; line-height: 1.5;">
              Detta är en automatisk bekräftelse från DJ Lobo Producciones.<br/>
              Du behöver inte svara på detta meddelande.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Customer confirmation sent:", customerEmailResponse);

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
