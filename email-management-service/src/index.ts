import express, { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// Rota de Healthcheck (O Docker Compose usa isso para saber se o serviço subiu bem)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

// Configuração do disparador de e-mail do Google
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Rota POST para enviar o código
app.post('/enviar-codigo', async (req: Request, res: Response): Promise<any> => {
  const { email, codigo } = req.body;

  if (!email || !codigo) {
    return res.status(400).json({ erro: 'Os campos "email" e "codigo" são obrigatórios.' });
  }

  try {
    const mailOptions = {
      from: `"Suporte do Aplicativo" <${process.env.SMTP_USER}>`,
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

    await transporter.sendMail(mailOptions);
    console.log(`✅ E-mail de recuperação enviado para: ${email}`);
    
    return res.status(200).json({ sucesso: true, mensagem: 'E-mail enviado com sucesso!' });
    
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail pelo Nodemailer:', error);
    return res.status(500).json({ erro: 'Falha interna ao tentar enviar o e-mail.' });
  }
});

// Inicia o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Microsserviço de e-mail rodando na porta ${PORT}`);
});