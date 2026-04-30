const mongoose = require('mongoose');
const Connection = require('./models/Connection');

mongoose.connect('mongodb://localhost:27017/sportconnect_sessions').then(async () => {
  const reqUid = 'Esg7dyNKuncP6wUvktcOPgb5rUA3'; // naji
  const conns = await Connection.find({
      status: 'accepted',
      $or: [{ senderId: reqUid }, { receiverId: reqUid }]
  });
  
  const friends = conns.map(c => {
      // NOTE: c is a Mongoose document. c.senderId might be evaluated correctly, but let's check its type
      console.log('c.senderId type:', typeof c.senderId, 'value:', c.senderId);
      console.log('reqUid type:', typeof reqUid, 'value:', reqUid);
      console.log('Is sender?', c.senderId === reqUid);
      
      const isSender = c.senderId === reqUid;
      return {
        uid:  isSender ? c.receiverId : c.senderId,
        name: isSender ? c.receiverName : c.senderName,
        connectedAt: c.updatedAt,
      };
  });
  console.log('Friends result for naji:', friends);
  process.exit(0);
});
