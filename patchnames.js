const mongoose = require('mongoose');
mongoose.connect('mongodb://sportconnect-mongodb:27017/sportconnect_sessions').then(async () => {
  const col = mongoose.connection.db.collection('sessions');
  await col.updateMany(
    { createdBy: '9mrav1JZgRhhZJfzZE5VnoIyEr83' },
    { $set: { creatorName: 'naji' } }
  );
  console.log('done');
  const all = await col.find({}).toArray();
  all.forEach(s => console.log(s.title, '| by:', s.creatorName));
  process.exit();
});