const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const module2Routes = require('./routes/module2Routes');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/v1/module2', module2Routes);

app.get('/health', (req, res) => {
  res.status(200).json({ module: 'Module 2: Inventory & Manufacturing Operations', status: 'Healthy' });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Module 2 Server running standalone on port ${PORT}`));