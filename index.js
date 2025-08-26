const express = require('express');
const hbs = require('hbs');
const path = require("path");
const generalrouter = require('./router/general')
const postrouter = require('./router/post')

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine' , 'hbs');
hbs.registerPartials(__dirname + '/views/partials')

app.use(express.urlencoded({extended: true}));
//tailwind css path
app.use(express.static(path.join(__dirname, "src")));
app.use(express.static(path.join(__dirname, "public")));
app.use('/static' , express.static('static'))
app.use('/', generalrouter)
app.use('/p', postrouter)
module.exports = app;