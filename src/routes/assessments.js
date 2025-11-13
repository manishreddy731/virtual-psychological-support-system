import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scoreLikert, interpretPHQ9, interpretGAD7 } from '../services/scoring.js';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');

function load(name){
  return JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8'));
}

const router = Router();

router.get('/', (_req, res) => {
  const ids = ['phq9','gad7','pss10','cbi_burnout'];
  const payload = ids.map(id => load(`${id}.json`));
  res.json(payload);
});

const scoreSchema = z.object({
  id: z.enum(['phq9','gad7','pss10','cbi_burnout']),
  answers: z.array(z.number())
});

router.post('/score', (req, res, next) => {
  try {
    const { id, answers } = scoreSchema.parse(req.body);
    const meta = load(`${id}.json`);
    const { total } = scoreLikert(answers, meta.range[0], meta.range[1]);
    let interpretation = 'raw';
    if (id === 'phq9') interpretation = interpretPHQ9(total);
    if (id === 'gad7') interpretation = interpretGAD7(total);
    res.json({ id, total, interpretation });
  } catch (e) { next(e); }
});

export default router;
