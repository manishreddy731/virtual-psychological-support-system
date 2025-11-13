import { Router } from 'express';
import { llmChat } from '../services/llm.js';
import { buildStudentChat, crisisMessages } from '../services/prompts.js';
import { screenRisk } from '../services/safety.js';
import { z } from 'zod';

const router = Router();

const schema = z.object({
  text: z.string().min(1).max(2000)
});

router.post('/', async (req, res, next) => {
  try {
    const { text } = schema.parse(req.body);

    const { crisis, flags } = screenRisk(text);
    const messages = crisis ? crisisMessages(text) : buildStudentChat(text, flags);

    const content = await llmChat(messages, {
      temperature: crisis ? 0.2 : 0.5,
      maxTokens: crisis ? 350 : 500
    });

    // minimal analytics in-memory (can be swapped for DB later)
    router.stats = router.stats || { total: 0, crisisCount: 0, tags: {} };
    router.stats.total++;
    if (crisis) router.stats.crisisCount++;
    flags.forEach(f => (router.stats.tags[f] = (router.stats.tags[f] || 0) + 1));

    res.json({ reply: content, crisis, flags });
  } catch (e) {
    next(e);
  }
});

router.get('/stats', (_req, res) => {
  res.json(router.stats || { total: 0, crisisCount: 0, tags: {} });
});

export default router;
