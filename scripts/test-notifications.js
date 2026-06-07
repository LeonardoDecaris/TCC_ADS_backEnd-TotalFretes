/**
 * Teste manual ponta a ponta: RabbitMQ -> notification-service -> MySQL
 *
 * Uso:
 *   node scripts/test-notifications.js [userId]
 *
 * Variáveis (opcionais):
 *   RABBITMQ_URL, DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME, TEST_USER_ID
 */

const amqp = require('amqplib');
const mysql = require('mysql2/promise');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const userId = Number(process.argv[2] || process.env.TEST_USER_ID || 2);
  const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
  const queue = process.env.NOTIFICATIONS_QUEUE || 'notifications.queue';

  const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3311),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '123456',
    database: process.env.DB_NAME || 'notification_service',
  };

  console.log('--- Teste de notificações ---');
  console.log('userId:', userId);
  console.log('RabbitMQ:', rabbitUrl);
  console.log('MySQL:', `${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);

  let connection;
  let db;

  try {
    connection = await amqp.connect(rabbitUrl);
    const channel = await connection.createChannel();

    const payload = {
      userId,
      type: 'TEST',
      title: 'Teste E2E',
      body: 'Notificação de teste publicada via script',
      metadata: { source: 'scripts/test-notifications.js' },
    };

    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
      contentType: 'application/json',
    });

    console.log('Mensagem publicada na fila', queue);
    await channel.close();
    await connection.close();

    console.log('Aguardando 2s para o consumer processar...');
    await sleep(2000);

    db = await mysql.createConnection(dbConfig);
    const [rows] = await db.execute(
      'SELECT id, user_id, type, title, body, created_at FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 1',
      [userId],
    );

    const row = rows[0];
    if (row && row.type === 'TEST') {
      console.log('Status: OK');
      console.log('Registro encontrado:', row);
      process.exitCode = 0;
    } else {
      console.log('Status: FALHOU');
      console.log('Nenhum registro TEST encontrado para userId', userId);
      console.log('Último registro:', row || null);
      process.exitCode = 1;
    }
  } catch (error) {
    console.log('Status: FALHOU');
    console.error(error);
    process.exitCode = 1;
  } finally {
    if (db) await db.close().catch(() => {});
    if (connection) await connection.close().catch(() => {});
  }
}

main();
