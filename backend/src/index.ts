import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { partsRouter, scanRouter, inventoryRouter, invoicesRouter } from './routes';

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/parts-platform';

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

mongoose.connect(MONGODB_URI).then(() => console.log('MongoDB connected')).catch((e) => console.error(e));

app.use('/api/parts', partsRouter);
app.use('/api/scan', scanRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/invoices', invoicesRouter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
