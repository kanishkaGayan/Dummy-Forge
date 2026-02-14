import express from 'express';
import generateRouter from './routes/generate';
import exportRouter from './routes/export';
import './database/init';

const app = express();
const port = Number(process.env.PORT ?? 5191);

app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/generate', generateRouter);
app.use('/api/export', exportRouter);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Dummy Forge API running on http://localhost:${port}`);
});
