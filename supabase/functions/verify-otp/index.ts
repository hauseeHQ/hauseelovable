// supabase/functions/verify-otp/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import twilio from "npm:twilio@5.5.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { phone, code } = await req.json();
    if (!phone || typeof phone !== "string") {
      return json(400, { error: "Missing or invalid 'phone'." });
    }
    if (!code || typeof code !== "string") {
      return json(400, { error: "Missing or invalid 'code'." });
    }

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID") ?? "";
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN") ?? "";
    const serviceSid = Deno.env.get("TWILIO_VERIFY_SERVICE_SID") ?? "";

    if (!accountSid || !authToken || !serviceSid) {
      return json(500, {
        error:
          "Server misconfigured. Missing TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_VERIFY_SERVICE_SID.",
      });
    }

    const client = twilio(accountSid, authToken);

    const check = await client.verify.v2
      .services(serviceSid)
      .verificationChecks.create({ to: phone, code });

    // Twilio returns status like: "approved", "pending", "canceled"
    const verified = check.status === "approved";

    return json(200, { verified, status: check.status });
  } catch (e) {
    return json(500, { error: String(e?.message ?? e) });
  }
});
