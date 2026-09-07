import { Resend } from "resend";
import logger from "@/lib/logger";

const log = logger.child({ module: "email" });

const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface SendPasswordResetEmailParams {
  toEmail: string;
  resetUrl: string;
  recipientName?: string;
}

export async function sendPasswordResetEmail({
  toEmail,
  resetUrl,
  recipientName = "Pengguna OSkost",
}: SendPasswordResetEmailParams) {
  if (!resend) {
    log.warn("RESEND_API_KEY belum dikonfigurasi. Email tidak dikirim.");
    return { success: false, error: "Konfigurasi email belum diset." };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "OSkost <onboarding@resend.dev>";

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: "🔒 Reset Password Akun OSkost Anda",
      html: `
        <!DOCTYPE html>
        <html lang="id">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Password OSkost</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 20px; }
            .container { max-width: 500px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
            .header { text-align: center; padding-bottom: 24px; border-bottom: 1px solid #27272a; }
            .logo { font-size: 24px; font-weight: 800; color: #facc15; text-decoration: none; }
            .content { padding: 24px 0; }
            .title { font-size: 18px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
            .text { font-size: 14px; color: #a1a1aa; line-height: 1.6; margin-bottom: 24px; }
            .btn-container { text-align: center; margin: 28px 0; }
            .btn { background-color: #8b5cf6; color: #ffffff !important; font-weight: 700; padding: 14px 28px; border-radius: 12px; text-decoration: none; display: inline-block; font-size: 14px; transition: all 0.2s ease; }
            .warning { font-size: 12px; color: #ef4444; background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; padding: 12px; margin-top: 20px; }
            .footer { font-size: 11px; color: #71717a; text-align: center; margin-top: 32px; border-top: 1px solid #27272a; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <span class="logo">OSkost</span>
            </div>
            <div class="content">
              <div class="title">Halo ${recipientName},</div>
              <div class="text">
                Kami menerima permintaan untuk mereset password akun OSkost Anda. Klik tombol di bawah ini untuk membuat password baru:
              </div>
              <div class="btn-container">
                <a href="${resetUrl}" class="btn">Reset Password Saya</a>
              </div>
              <div class="warning">
                ⏰ <strong>PENTING:</strong> Tautan ini hanya berlaku selama <strong>5 menit</strong> demi keamanan akun Anda.
              </div>
              <div class="text" style="margin-top: 20px; font-size: 12px;">
                Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini. Password Anda akan tetap aman.
              </div>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} OSkost Smartkost Pulo Jahe System. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      log.error({ err: error }, "Resend API error");
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    log.error({ err }, "Gagal mengirim email reset password");
    return { success: false, error: err.message || "Gagal mengirim email." };
  }
}
