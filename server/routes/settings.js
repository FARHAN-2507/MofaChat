import { Router } from 'express';
import Settings from '../models/Settings.js';
import provider from '../config/provider.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    let settings = await Settings.findOne({ userId }).lean();

    if (!settings) {
      settings = { userId, selectedModel: provider.defaultModel };
    }

    res.json(settings);
  } catch (err) {
    next(err);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const { selectedModel } = req.body;
    const model = selectedModel || provider.defaultModel;

    const settings = await Settings.findOneAndUpdate(
      { userId },
      { selectedModel: model },
      { upsert: true, new: true }
    ).lean();

    res.json(settings);
  } catch (err) {
    next(err);
  }
});

export default router;
