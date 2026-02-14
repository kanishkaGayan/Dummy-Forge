import { Router } from 'express';
import { DataGenerator } from '../lib/dataGenerator';
import { GenerationConfig } from '../types';

const router = Router();

router.post('/', (req, res) => {
  const config = req.body as GenerationConfig;

  if (!config || !Array.isArray(config.fields)) {
    return res.status(400).json({ error: 'Invalid config' });
  }

  if (config.count < 1 || config.count > 10000) {
    return res.status(400).json({ error: 'Count must be between 1 and 10,000' });
  }

  const generator = new DataGenerator();
  const data = generator.generateRecords(config);
  return res.json({ data });
});

export default router;
