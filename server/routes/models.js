import { Router } from 'express';
import availableModels from '../config/models.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(availableModels);
});

export default router;
