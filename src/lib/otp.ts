export async function sendOtp(phone: string) {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-otp`;
  
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ phone }),
    });
  
    const data = await res.json().catch(() => ({}));
  
    if (!res.ok) {
      throw new Error(data?.error || data?.message || `Send OTP failed (${res.status})`);
    }
  
    return data;
  }
  
  export async function verifyOtp(phone: string, code: string) {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify-otp`;
  
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ phone, code }),
    });
  
    const data = await res.json().catch(() => ({}));
  
    if (!res.ok) {
      throw new Error(data?.error || data?.message || `Verify OTP failed (${res.status})`);
    }
  
    return data as { approved: boolean; status: string };
  }
  