import express from 'express';
const app = express();
const port = 5001;
app.get('/', (req, res) => res.send('Test OK'));
app.listen(port, '0.0.0.0', () => {
  console.log(`Test server listening on port ${port}`);
});
