var express = require('express')
var app = express();
// var cookie = require('cookie-parser');
// var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var api = require('./api');
// var compress = require('compression');



// app.use(compress());
// app.use(cookie());
// app.use(session({
//     resave: true, // 是指每次请求都重新设置session cookie，假设你的cookie是6000毫秒过期，每次请求都会再设置6000毫秒
//     saveUninitialized: false, // 是指无论有没有session cookie，每次请求都设置个session cookie 
//     secret: '123456', //  加密
//     name: 'testapp', //这里的name值得是cookie的name，默认cookie的name是：connect.sid
//     cookie: {
//         maxAge: 18000000
//     }, //设置maxAge是80000ms，即80s后session和相应的cookie失效过期
// }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.set('view engine','jade');
app.use(express.static(path.join(__dirname, 'public')));
app.use(api);


app.listen(8888);