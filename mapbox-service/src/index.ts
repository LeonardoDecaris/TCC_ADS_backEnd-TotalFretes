import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mapBox from './routes/mapBox.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3004;

// Middleware
app.use(cors());
app.use(express.json());

app.use(mapBox);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});