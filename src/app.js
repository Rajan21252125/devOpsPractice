import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello, from my app!');
});

export default app;
