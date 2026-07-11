import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'New conversation',
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Conversation', conversationSchema);
