import cors from 'cors';
import express from 'express';
import userImagesRoutes from './routes/userImages.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Storage Service is running');
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'up' });
});

app.use('/user-images', userImagesRoutes);

export default app;
