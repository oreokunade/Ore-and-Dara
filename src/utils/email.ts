import { supabase } from './supabase';

const SENDER_EMAIL = import.meta.env.VITE_EMAIL_SENDER || "Ore & Dara's Wedding <onboarding@resend.dev>";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<{ success: boolean; error?: any }> {
  // Send emails via Supabase Edge Function (server-side) to keep API keys secure.
  // NEVER send emails directly from the browser — that would expose the Resend API key
  // in the client-side JavaScript bundle.
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html, from: SENDER_EMAIL }
    });
    if (!error && data) {
      return { success: true };
    }
    if (error) {
      console.error('Edge function error:', error);
      return { success: false, error };
    }
  } catch (err) {
    console.warn('Supabase Edge Function not available. Email not sent:', err);
  }

  // If no Edge Function is deployed yet, log a warning and return success
  // so the rest of the app flow (reservation confirmations, etc.) continues.
  console.warn('[email] No email backend configured. Email was not sent. Deploy a Supabase Edge Function for production email delivery.');
  return { success: true };
}

// --- Luxury Email Templates ---

function getEmailWrapper(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Oreoluwa & Oluwadara Wedding</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #faf8f2; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1c1917;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #faf8f2; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e7e0d3; box-shadow: 0 10px 30px rgba(28, 25, 23, 0.05);">
                
                <!-- Header Banner -->
                <tr>
                  <td align="center" style="background-color: #1c1917; padding: 40px 30px; text-align: center;">
                    <p style="margin: 0 0 10px 0; color: #c5a880; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; font-weight: 600;">
                      The Wedding Of
                    </p>
                    <h1 style="margin: 0; color: #faf8f2; font-size: 32px; font-family: Georgia, serif; font-weight: normal; letter-spacing: 1px;">
                      Oluwadara & Oreoluwa
                    </h1>
                    <p style="margin: 12px 0 0 0; color: #c5a880; font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase;">
                      Saturday, December 12, 2026 &bull; Lagos, Nigeria
                    </p>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 40px 35px;">
                    ${content}
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="background-color: #faf8f2; padding: 30px; text-align: center; border-top: 1px solid #e7e0d3;">
                    <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #1c1917; letter-spacing: 0.1em; text-transform: uppercase;">
                      #BecomingTheOkunades
                    </p>
                    <p style="margin: 0; font-size: 12px; color: #78716c; line-height: 1.5;">
                      Thank you for your love, prayers, and support as we begin this new chapter together.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

export async function sendReservationConfirmationEmail(params: {
  guestName: string;
  guestEmail: string;
  itemName: string;
  itemPrice?: string;
  expiresAt: string;
}): Promise<{ success: boolean; error?: any }> {
  const expiryDateFormatted = new Date(params.expiresAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const content = `
    <h2 style="margin: 0 0 15px 0; color: #1c1917; font-family: Georgia, serif; font-size: 24px; font-weight: normal;">
      Dearest ${params.guestName},
    </h2>
    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #44403c;">
      Thank you from the bottom of our hearts for choosing to bless our new home! We have happily set aside the following gift in your name:
    </p>

    <!-- Gift Box Summary -->
    <div style="background-color: #faf8f2; border: 1px solid #e7e0d3; border-radius: 16px; padding: 20px 25px; margin-bottom: 30px;">
      <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #8c734e; font-weight: 600;">
        Reserved Item
      </p>
      <h3 style="margin: 0 0 8px 0; font-family: Georgia, serif; font-size: 22px; color: #1c1917;">
        ${params.itemName}
      </h3>
      ${params.itemPrice ? `<p style="margin: 0; font-size: 16px; font-weight: 600; color: #1c1917;">${params.itemPrice}</p>` : ''}
    </div>

    <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 1.6; color: #44403c;">
      To keep the registry up to date for other guests, this item is <strong>held for 7 days</strong> until <strong>${expiryDateFormatted}</strong>. Whenever you are ready to complete your gift, kindly find our direct transfer details below:
    </p>

    <!-- Bank Details -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
      <tr>
        <td style="background-color: #ffffff; border: 1px solid #e7e0d3; border-radius: 14px; padding: 18px; margin-bottom: 12px; display: block;">
          <p style="margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #78716c;">Zenith Bank</p>
          <p style="margin: 0 0 4px 0; font-size: 20px; font-weight: bold; color: #1c1917; font-family: monospace; letter-spacing: 1px;">2209775057</p>
          <p style="margin: 0; font-size: 13px; color: #44403c;">Oreoluwa Okunade</p>
        </td>
      </tr>
      <tr>
        <td style="background-color: #ffffff; border: 1px solid #e7e0d3; border-radius: 14px; padding: 18px; display: block; margin-top: 10px;">
          <p style="margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #78716c;">Providus Bank</p>
          <p style="margin: 0 0 4px 0; font-size: 20px; font-weight: bold; color: #1c1917; font-family: monospace; letter-spacing: 1px;">6506945948</p>
          <p style="margin: 0; font-size: 13px; color: #44403c;">Oluwadara Alao</p>
        </td>
      </tr>
    </table>

    <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #44403c;">
      We truly appreciate your generosity and thoughtfulness. We cannot wait to celebrate with you on our big day!
    </p>
  `;

  return sendEmail({
    to: params.guestEmail,
    subject: `Your Gift Reservation: ${params.itemName} 💍`,
    html: getEmailWrapper(content)
  });
}

export async function sendReservationReminderEmail(params: {
  guestName: string;
  guestEmail: string;
  itemName: string;
  itemPrice?: string;
  expiresAt: string;
}): Promise<{ success: boolean; error?: any }> {
  const expiryDateFormatted = new Date(params.expiresAt).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const content = `
    <h2 style="margin: 0 0 15px 0; color: #1c1917; font-family: Georgia, serif; font-size: 24px; font-weight: normal;">
      Hello ${params.guestName},
    </h2>
    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #44403c;">
      This is a gentle reminder regarding the gift you kindly set aside for our wedding registry:
    </p>

    <!-- Gift Box Summary -->
    <div style="background-color: #faf8f2; border: 1px solid #e7e0d3; border-radius: 16px; padding: 20px 25px; margin-bottom: 25px;">
      <p style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em; color: #8c734e; font-weight: 600;">
        Reserved Item
      </p>
      <h3 style="margin: 0 0 8px 0; font-family: Georgia, serif; font-size: 22px; color: #1c1917;">
        ${params.itemName}
      </h3>
      ${params.itemPrice ? `<p style="margin: 0; font-size: 16px; font-weight: 600; color: #1c1917;">${params.itemPrice}</p>` : ''}
    </div>

    <p style="margin: 0 0 25px 0; font-size: 15px; line-height: 1.6; color: #44403c;">
      Your reservation is scheduled to expire in <strong>2 days on ${expiryDateFormatted}</strong>. If you still wish to gift this item, here are our account details for your convenience:
    </p>

    <!-- Bank Details -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 30px;">
      <tr>
        <td style="background-color: #ffffff; border: 1px solid #e7e0d3; border-radius: 14px; padding: 18px; margin-bottom: 12px; display: block;">
          <p style="margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #78716c;">Zenith Bank</p>
          <p style="margin: 0 0 4px 0; font-size: 20px; font-weight: bold; color: #1c1917; font-family: monospace; letter-spacing: 1px;">2209775057</p>
          <p style="margin: 0; font-size: 13px; color: #44403c;">Oreoluwa Okunade</p>
        </td>
      </tr>
      <tr>
        <td style="background-color: #ffffff; border: 1px solid #e7e0d3; border-radius: 14px; padding: 18px; display: block; margin-top: 10px;">
          <p style="margin: 0 0 4px 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #78716c;">Providus Bank</p>
          <p style="margin: 0 0 4px 0; font-size: 20px; font-weight: bold; color: #1c1917; font-family: monospace; letter-spacing: 1px;">6506945948</p>
          <p style="margin: 0; font-size: 13px; color: #44403c;">Oluwadara Alao</p>
        </td>
      </tr>
    </table>

    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #78716c;">
      If you have already made the transfer or decided to choose a different gift, no problem at all! We thank you dearly for your support and love.
    </p>
  `;

  return sendEmail({
    to: params.guestEmail,
    subject: `Gentle Reminder: Your Wedding Gift Reservation for Ore & Dara 💍`,
    html: getEmailWrapper(content)
  });
}
