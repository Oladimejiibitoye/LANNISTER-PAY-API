const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const feeRoutes = require('./routes/fee');

const app = express();

//application.json
app.use(bodyParser.json());

//CORS errors
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Methodes', 'GET, POST');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     next();
// })

// routes
app.use('/', feeRoutes);

mongoose.connect(
    'mongodb+srv://Oladimx:bighead101DIMX@cluster0.9qrx1.mongodb.net/test'
).then(result => {
    app.listen(8080);
})
.catch(err => console.log(err));