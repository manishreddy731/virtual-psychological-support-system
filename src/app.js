import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import chatRouter from './routes/chat.js';
import assessmentsRouter from './routes/assessments.js';
import suggestionsRouter from './routes/suggestions.js';

const app = express();

// minimal privacy-first logging (no bodies)
app.use(morgan('tiny', { skip: () => process.env.NODE_ENV === 'test' }));
app.use(cors());
app.use(express.json({ limit: '200kb' }));

// never log sensitive payloads
app.use((req, _res, next) => {
  req.context = { requestId: crypto.randomUUID?.() ?? String(Date.now()) };
  next();
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/chat', chatRouter);
app.use('/assessments', assessmentsRouter);
app.use('/suggestions', suggestionsRouter);

// global error handler (redacts)
app.use((err, _req, res, _next) => {
  console.error('[error]', err?.message);
  res.status(err?.status || 500).json({ error: 'internal_error' });
});

export default app;
