import nodemailer from 'nodemailer';
import { logger } from '../config/logger';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendPasswordResetEmail(email: string, codigo: string): Promise<void> {
  const mailOptions = {
    from: `"Suporte do TotalFretes" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Código de Recuperação de Senha',
    html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #0056b3; text-align: center;">Recuperação de Senha</h2>
            <p>Olá, motorista!</p>
            <p>Você solicitou a redefinição de senha para voltar a acessar as cargas disponíveis.</p>
            <p>Seu código de verificação é:</p>
            <h1 style="background: #f4f4f4; padding: 15px; text-align: center; letter-spacing: 8px; border-radius: 6px; font-size: 32px; color: #111;">${codigo}</h1>
            <p style="color: #777; font-size: 14px; text-align: center;">Este código expira em 15 minutos.</p>
        </div>
      `,
  };

  await getTransporter().sendMail(mailOptions);
  logger.info(`E-mail de recuperação enviado para: ${email}`);
}
