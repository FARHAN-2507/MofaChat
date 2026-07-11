import { Router } from 'express';
import mongoose from 'mongoose';
import fetch from 'node-fetch';
import Settings from '../models/Settings.js';
import provider from '../config/provider.js';

const router = Router();

router.post('/test', async (req, res, next) => {
  try {
    const { modelId, apiKey } = req.body;
    const key = apiKey || process.env[provider.keyEnvVar];
    const model = modelId || provider.defaultModel;

    if (!key) {
      return res.json({
        success: false,
        error: `No API key configured. Set ${provider.keyEnvVar} in .env`,
        fix: `${provider.keyNote} at ${provider.keyLink}`,
      });
    }

    const response = await fetch(provider.chatEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        ...provider.headers,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Reply with exactly: API_OK' }],
        max_tokens: 20,
      }),
    });

    const data = await response.text();

    if (!response.ok) {
      return res.json({
        success: false,
        status: response.status,
        error: data.slice(0, 500),
      });
    }

    return res.json({
      success: true,
      status: response.status,
      model,
      data: JSON.parse(data),
    });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

router.get('/status', async (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const settings = await Settings.findOne({ userId: 'default' }).lean();

  res.json({
    provider: provider.name,
    db: {
      status: dbStatus[dbState] || 'unknown',
      readyState: dbState,
    },
    apiKey: {
      configured: !!process.env[provider.keyEnvVar],
      hasOverride: !!(settings?.apiKeyOverride),
    },
    model: settings?.selectedModel || provider.defaultModel,
    environment: {
      node: process.version,
      platform: process.platform,
    },
  });
});

export default router;
