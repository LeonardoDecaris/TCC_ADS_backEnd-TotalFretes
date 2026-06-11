import express from 'express';
import cors from 'cors';
import userImagesRoutes from './routes/userImages.routes';
import internalSeedRoutes from './routes/internalSeed.routes';
import {
  cargoImagesRoutes,
  companyImagesRoutes,
  cargoImagesUpload,
  companyImagesUpload,
  handleStoredImageUploadError,
} from './routes/catalogImages.routes';
import { apiDocs } from './api-docs';
import { requestIdMiddleware, requestLoggerMiddleware } from './config/logging';
import { ErrorHandlerMiddleware } from './middlewares/errors';
import { createStoredImageUpload } from './utils/storedImageUpload';
import { STORED_IMAGE_KINDS } from './config/storedImageKinds';

const app = express();
const userImagesUpload = createStoredImageUpload(STORED_IMAGE_KINDS.user.uploadSubdir);
const publicKinds = new Set(
  (process.env.PUBLIC_IMAGE_KINDS ?? 'user,company,cargo')
    .split(',')
    .map((kind) => kind.trim().toLowerCase())
    .filter(Boolean),
);

app.use(cors());
app.use(express.json());
app.use(requestIdMiddleware);
app.use(requestLoggerMiddleware);

app.get('/', (_req, res) => {
  res.send('Storage Service is running');
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'up' });
});

app.get('/api-docs', (_req, res) => {
  res.json(apiDocs);
});

if (publicKinds.has('user')) {
  app.use('/uploads/user-images', express.static(userImagesUpload.uploadDirPath));
}
if (publicKinds.has('company')) {
  app.use('/uploads/company-images', express.static(companyImagesUpload.uploadDirPath));
}
if (publicKinds.has('cargo')) {
  app.use('/uploads/cargo-images', express.static(cargoImagesUpload.uploadDirPath));
}

app.use('/user-images', userImagesRoutes);
app.use('/company-images', companyImagesRoutes);
app.use('/cargo-images', cargoImagesRoutes);
app.use('/internal/seed', internalSeedRoutes);

app.use(handleStoredImageUploadError);
app.use(ErrorHandlerMiddleware);

export default app;
