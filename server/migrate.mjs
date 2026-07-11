import mongoose from 'mongoose';
import 'dotenv/config';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/claude-chat';

try {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  // Find conversations with missing or default userId
  const orphaned = await db.collection('conversations').find({
    $or: [
      { userId: { $exists: false } },
      { userId: null },
      { userId: 'default' },
    ]
  }).toArray();

  if (orphaned.length === 0) {
    console.log('No orphaned conversations found. All conversations have valid userIds.');
  } else {
    console.log(`Found ${orphaned.length} orphaned conversation(s). Deleting...`);
    const result = await db.collection('conversations').deleteMany({
      $or: [
        { userId: { $exists: false } },
        { userId: null },
        { userId: 'default' },
      ]
    });
    console.log(`Deleted ${result.deletedCount} conversation(s).`);

    // Also delete their messages
    const orphanedIds = orphaned.map(c => c._id);
    if (orphanedIds.length > 0) {
      const msgResult = await db.collection('messages').deleteMany({
        conversationId: { $in: orphanedIds }
      });
      console.log(`Deleted ${msgResult.deletedCount} orphaned message(s).`);
    }
  }

  await mongoose.disconnect();
  console.log('Migration complete.');
} catch (e) {
  console.error('Migration Error:', e.message);
}
