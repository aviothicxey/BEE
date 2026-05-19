require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🍽️  CampusBites (EJS) running on http://localhost:${PORT}`);
  });
}

startServer();
