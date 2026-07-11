import { Router } from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const userId = String(req.user._id);
    const conversations = await Conversation.find({ userId })
      .sort({ updatedAt: -1 })
      .lean();
    res.json(conversations);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId,
    }).lean();
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    const messages = await Message.find({ conversationId: req.params.id })
      .sort({ createdAt: 1 })
      .lean();
    res.json({ conversation, messages });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title } = req.body;
    const userId = req.user._id.toString();
    const conversation = await Conversation.create({
      title: title || 'New conversation',
      userId,
    });
    res.status(201).json(conversation);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { title } = req.body;
    const userId = req.user._id.toString();
    const conversation = await Conversation.findOneAndUpdate(
      { _id: req.params.id, userId },
      { title },
      { new: true }
    ).lean();
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    res.json(conversation);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const conversation = await Conversation.findOneAndDelete({
      _id: req.params.id,
      userId,
    });
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }
    await Message.deleteMany({ conversationId: req.params.id });
    res.json({ message: 'Conversation deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;
