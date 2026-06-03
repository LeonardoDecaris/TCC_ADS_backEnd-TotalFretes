import dotenv from 'dotenv';
import app, { logger } from './app';

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3004;

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});
