import { Router } from 'express';
import fetch from 'node-fetch';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import Settings from '../models/Settings.js';
import provider from '../config/provider.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/stream', async (req, res, next) => {
  try {
    const { conversationId, message } = req.body;
    if (!conversationId || !message) {
      return res.status(400).json({ error: 'conversationId and message are required' });
    }

    const userId = req.user._id.toString();
    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId,
    });
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    const settings = await Settings.findOne({ userId: req.user._id }).lean();
    const apiKey = process.env[provider.keyEnvVar];
    if (!apiKey) {
      return res.status(400).json({
        error: 'No API key configured.',
        fix: `${provider.keyNote} at ${provider.keyLink}, then add ${provider.keyEnvVar}=your_key to your .env file.`,
      });
    }

    const modelId = settings?.selectedModel || provider.defaultModel;

    const previousMessages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .lean();

    const systemPrompt = 'You are a ruthless senior expert in every field. Give direct, concise, no-babysitting answers — assume I know my stuff. Be witty and inject humor to keep it engaging. Never explain basic concepts unless I explicitly ask. Get straight to the point.';

    const MAX_HISTORY_TOKENS = 800;
    const estimateTokens = (s) => Math.ceil((s || '').length / 4);

    const trimmed = [];
    let budget = MAX_HISTORY_TOKENS;
    for (let i = previousMessages.length - 1; i >= 0; i--) {
      const t = estimateTokens(previousMessages[i].content);
      if (t <= budget) {
        trimmed.unshift(previousMessages[i]);
        budget -= t;
      } else break;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...trimmed.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    await Message.create({ conversationId, role: 'user', content: message });
    await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

    if (conversation.title === 'New conversation') {
      const title = message.length > 60 ? message.slice(0, 57) + '...' : message;
      await Conversation.findByIdAndUpdate(conversationId, { title });
    }

    const response = await fetch(provider.chatEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `${provider.name} error (${response.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMsg = errorJson.error?.message || errorJson.error || errorMsg;
      } catch {
        errorMsg = errorText || errorMsg;
      }
      return res.status(response.status).json({ error: errorMsg });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    let fullContent = '';

    for await (const chunk of response.body) {
      const text = chunk.toString('utf-8');
      const lines = text.split('\n').filter(l => l.startsWith('data: '));

      for (const line of lines) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content || '';
          if (delta) {
            fullContent += delta;
            res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
          }
        } catch {
          // skip malformed chunks
        }
      }
    }

    if (fullContent) {
      await Message.create({
        conversationId,
        role: 'assistant',
        content: fullContent,
        model: modelId,
      });
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    if (!res.headersSent) {
      next(err);
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.end();
    }
  }
});

export default router;
