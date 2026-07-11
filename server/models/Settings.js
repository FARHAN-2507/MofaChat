import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: 'default',
    unique: true,
  },
  selectedModel: {
    type: String,
    default: 'llama-3.3-70b-versatile',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Settings', settingsSchema);
