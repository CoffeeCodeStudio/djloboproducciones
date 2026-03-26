import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const eventTypeLabels: Record<string, string> = {
  wedding: "Bröllop",
  corporate: "Företagsevent",
  private: "Privatfest",
  club: "Klubb/Festival",
  other: "Annat",
  inquiry: "Allmän fråga",
};

interface BookingRequest {
  name: string;
  email: string;
  phone?: string;
  eventType: string;
  eventDate: string;
  location?: string;
  message?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, eventType, eventDate, location, message }: BookingRequest = await req.json();

    if (!name || !email) {
      throw new Error("Missing required fields");
    }

    const isInquiry = eventType === "inquiry" || !eventType;

    // Validate lengths
    if (name.length > 100 || email.length > 255) {
      throw new Error("Input too long");
    }

    const sanitize = (str: string) =>
      str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

    const s = {
      name: sanitize(name),
      email: sanitize(email),
      phone: phone ? sanitize(phone) : null,
      eventType: eventTypeLabels[eventType] || sanitize(eventType),
      eventDate: sanitize(eventDate),
      location: location ? sanitize(location) : null,
      message: message ? sanitize(message) : null,
    };

    const emailResponse = await resend.emails.send({
      from: "DJ Lobo Producciones <info@djloboradio.com>",
      to: ["djloboproducciones75@gmail.com"],
      reply_to: email,
      subject: isInquiry
        ? `💬 Ny fråga från ${s.name}`
        : `🎧 Ny bokningsförfrågan från ${s.name} — ${s.eventType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 30px 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #00d4ff; margin: 0; font-size: 24px;">${isInquiry ? "💬 Ny Fråga" : "🎧 Ny Bokningsförfrågan"}</h1>
          </div>
          <div style="padding: 24px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 12px 12px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #666; width: 140px;"><strong>Namn</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">${s.name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #666;"><strong>E-post</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;"><a href="mailto:${s.email}" style="color: #00d4ff;">${s.email}</a></td>
              </tr>
              ${s.phone ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #666;"><strong>Telefon</strong></td><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;"><a href="tel:${s.phone}" style="color: #00d4ff;">${s.phone}</a></td></tr>` : ""}
              ${!isInquiry ? `<tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #666;"><strong>Typ av event</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">${s.eventType}</td>
              </tr>
              ${s.eventDate ? `<tr>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #666;"><strong>Datum</strong></td>
                <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">${s.eventDate}</td>
              </tr>` : ""}
              ${s.location ? `<tr><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; color: #666;"><strong>Plats</strong></td><td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">${s.location}</td></tr>` : ""}` : ""}
            </table>
            ${s.message ? `<div style="margin-top: 20px; padding: 16px; background: #f9f9f9; border-radius: 8px; border-left: 4px solid #00d4ff;"><h3 style="margin: 0 0 8px; color: #333; font-size: 14px;">Meddelande:</h3><p style="margin: 0; white-space: pre-wrap; line-height: 1.6; color: #555;">${s.message}</p></div>` : ""}
            <p style="color: #999; font-size: 11px; margin-top: 24px; text-align: center;">
              Skickat via bokningsformuläret på DJ Lobo Producciones
            </p>
          </div>
        </div>
      `,
    });

    console.log("Booking notification sent:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-booking-notification:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
