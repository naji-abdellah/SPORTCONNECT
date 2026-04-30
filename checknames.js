const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI || 'mongodb://sportconnect-mongodb:27017/sportconnect').then(async () => {
  const S = mongoose.model('Session', new mongoose.Schema({}, { strict: false }));
  const sessions = await S.find({}).lean();
  sessions.forEach(s => console.log(String(s._id), '| createdBy:', s.createdBy, '| creatorName:', s.creatorName, '| title:', s.title));
  process.exit();
});