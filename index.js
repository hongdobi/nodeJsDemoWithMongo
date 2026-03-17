require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT;

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

app.get('/', (req, res) => res.send('Hello World My NodeJS Demo'));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));