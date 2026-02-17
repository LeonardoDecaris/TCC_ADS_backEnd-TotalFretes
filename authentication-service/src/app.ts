import cors from "cors";
import express from 'express';
import authRoutes from './routes/authentication.Routes';


const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => { res.send("Hello World!"); });
app.use('/auth', authRoutes);
export default app;