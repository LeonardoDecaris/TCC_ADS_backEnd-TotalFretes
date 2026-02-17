import cors from "cors";
import express from 'express';

import userRoutes from './routes/user.routes';
import cnhRoutes from './routes/cnh.routes';


const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => { res.send("Hello World!"); });

app.use('/user', userRoutes);
app.use('/cnh', cnhRoutes);

export default app;