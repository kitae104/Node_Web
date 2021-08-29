// express 모듈 추가 
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');               // .env 파일을 읽어서 process.env 로 만듦
const path = require('path');                   // 경로 설정 

dotenv.config();

const app = express();                          // app 객체 생성 
app.set('port', process.env.PORT || 3000);      // 서버 포트 

app.use(morgan('dev'));
app.use('/', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET, 
    cookie: {
        httpOnly: true, 
        secure : false,
    },
    name: 'session-cookie',
}));

app.use((req, res, next) => {
    console.log("모든 요청에 다 실행됩니다.");
    next();
});

app.get('/', (req, res, next) => {
    //res.send("Hello, Express");               // 문자열 출력 
    res.sendFile(path.join(__dirname, '/index.html'));  // 페이지 이동 
    console.log("GET / 요청에만 실행합니다.");
    //next();
}, (req, res) => {
    throw new Error("에러는 에러 처리 미들웨어로 전달");
});

app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send(err.message);
});

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');
});