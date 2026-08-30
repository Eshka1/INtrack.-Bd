const express = require('express');
const cors = require('cors');

const financeRoutes = require('./modules/finance/routes/financeRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/finance', financeRoutes);

module.exports = app;
