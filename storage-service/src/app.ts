import cors from 'cors';
import express from 'express';
import userImagesRoutes from './routes/userImages.routes';
import { uploadDirPath } from './utils/upload';
import { apiDocs } from './api-docs';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Storage Service is running');
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'up' });
});

app.get('/api-docs', (_req, res) => {
  res.json(apiDocs);
});

/** Servir arquivos de imagem em GET /uploads/user-images/:filename */
app.use('/uploads/user-images', express.static(uploadDirPath));

app.use('/user-images', userImagesRoutes);

export default app;

