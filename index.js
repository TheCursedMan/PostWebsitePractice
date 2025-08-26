const express = require('express');
const hbs = require('hbs');
const path = require("path");
const generalrouter = require('./router/general')
const postrouter = require('./router/post')

const app = express();

app.set('view engine' , 'hbs');
hbs.registerPartials(__dirname + '/views/partials')

app.use(express.urlencoded({extended: true}));
//tailwind css path
app.use(express.static(path.join(__dirname, "src")));
app.use('/static' , express.static('static'))
app.use('/', generalrouter)
app.use('/p', postrouter)


app.listen(3000, ()=>{
    console.log('Website is running... on ' + 'http://localhost:3000' )
})