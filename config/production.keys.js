const keys = {
  mongoUri: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@generic-free-87m2x.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`,
  sessionSecret: process.env.SESSION_SECRET,
  sendGridApiKey: process.env.SENDGRIP_API_KEY,
  stripe: process.env.STRIPE_KEY
};

module.exports = keys;