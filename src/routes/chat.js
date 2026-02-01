import { Router } from 'express';
import { z } from 'zod';

import { llmChat } from '../services/llm.js';
import {
  buildStudentChat,
  buildAssessmentChat
} from '../services/prompts.js';

import { screenRisk } from '../services/safety.js';
import {
  getCrisisResponse,
  getViolenceResponse
} from '../services/crisisResponse.js';

import { getAssessment } from '../services/assessments.js';
import {
  scoreAssessment,
  categorizeScore
} from '../services/scoring.js';

const router = Router();

/**
 * Request schema
 * - text → normal chat
 * - action=start_assessment → send questionnaire
 * - action=submit_assessment → score + AI response
 */
const schema = z.object({
  text: z.string().min(1).max(2000).optional(),
  action: z.enum(['start_assessment', 'submit_assessment']).optional(),
  type: z.string().optional(),
  answers: z.record(z.number()).optional()
});

router.post('/', async (req, res, next) => {
  try {
    const body = schema.parse(req.body);

    // ===============================
    // 1️⃣ START ASSESSMENT
    // ===============================
    if (body.action === 'start_assessment') {
      const { type } = body;

      if (!type) {
        return res.status(400).json({ error: 'Assessment type is required' });
      }

      const questions = getAssessment(type);

      return res.json({
        assessment: true,
        type,
        message: 'Please answer the following questions honestly.',
        questions
      });
    }

    // ===============================
    // 2️⃣ SUBMIT ASSESSMENT
    // ===============================
    if (body.action === 'submit_assessment') {
      const { type, answers } = body;

      if (!type || !answers) {
        return res
          .status(400)
          .json({ error: 'Assessment type and answers are required' });
      }

      const score = scoreAssessment(type, answers);
      const severity = categorizeScore(type, score);

      const messages = buildAssessmentChat(type, score, severity);

      const content = await llmChat(messages, {
        temperature: 0.4,
        maxTokens: 500
      });

      return res.json({
        assessmentComplete: true,
        type,
        score,
        severity,
        reply: content
      });
    }

    // ===============================
    // 3️⃣ NORMAL CHAT FLOW
    // ===============================
    const { text } = body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const { crisis, flags } = screenRisk(text);

    // 🚨 HIGH-RISK MODE — STOP AI COMPLETELY
    if (crisis) {
      console.warn('[CRISIS] High-risk message detected:', flags);

      router.stats = router.stats || { total: 0, crisisCount: 0, tags: {} };
      router.stats.total++;
      router.stats.crisisCount++;
      flags.forEach(f => (router.stats.tags[f] = (router.stats.tags[f] || 0) + 1));

      if (flags.includes('self_harm')) {
        return res.status(200).json(getCrisisResponse());
      }

      if (flags.includes('harm_to_others')) {
        return res.status(200).json(getViolenceResponse());
      }

      return res.status(200).json(getCrisisResponse());
    }

    // ✅ NON-CRISIS CHAT → AI
    const messages = buildStudentChat(text, flags);

    const content = await llmChat(messages, {
      temperature: 0.5,
      maxTokens: 500
    });

    // analytics
    router.stats = router.stats || { total: 0, crisisCount: 0, tags: {} };
    router.stats.total++;
    flags.forEach(f => (router.stats.tags[f] = (router.stats.tags[f] || 0) + 1));

    // 🔹 Suggest assessment (frontend button trigger)
    const suggestAssessment = flags.includes('stress') || flags.includes('anxiety');

    res.json({
      reply: content,
      crisis: false,
      flags,
      ...(suggestAssessment
        ? {
            suggestion: {
              message:
                'Would you like to take a short assessment to understand this better?',
              options: [
                { label: 'Stress Test', type: 'pss10' },
                { label: 'Anxiety Test', type: 'gad7' },
                { label: 'Depression Test', type: 'phq9' }
              ]
            }
          }
        : {})
    });
  } catch (e) {
    next(e);
  }
});

router.get('/stats', (_req, res) => {
  res.json(router.stats || { total: 0, crisisCount: 0, tags: {} });
});

export default router;
