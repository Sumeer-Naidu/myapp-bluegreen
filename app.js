const express = require('express');
const app = express();
const PORT = 3000;
const COLOR = (process.env.APP_COLOR || 'unknown').toUpperCase();

app.get('/', (req, res) => {
  res.send(`Hello from the ${COLOR} environment! (Blue-Green deployment with Jenkins + Kubernetes)`);
});

app.listen(PORT, () => console.log(`${COLOR} app running on port ${PORT}`));
