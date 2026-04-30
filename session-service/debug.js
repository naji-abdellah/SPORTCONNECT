const mongoose = require('mongoose');
const Connection = require('./models/Connection');

mongoose.connect('mongodb://localhost:27017/sportconnect_sessions').then(async () => {
  const conns = await Connection.find({});
  console.log('Raw DB conns:', conns);
  process.exit(0);
});
