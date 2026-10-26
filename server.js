const { openDb } = require('./src/db');
const { createApp } = require('./src/app');

const PORT = process.env.PORT || 3001;
createApp(openDb()).listen(PORT, () => {
  console.log(`Food Menu API running at http://localhost:${PORT}/api/food-items`);
});
