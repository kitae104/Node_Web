// express 모듈 추가 
const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const dotenv = require('dotenv');               // .env 파일을 읽어서 process.env 로 만듦
const path = require('path');                   // 경로 설정 
const multer = require('multer');               // 파일 업로드 처리 
const fs = require('fs');

dotenv.config();

const app = express();                          // app 객체 생성 

// 서버 포트 설정 
app.set('port', process.env.PORT || 3000);      

// 요청과 응답에 대한 정보를 콘솔에 기록 
app.use(morgan('dev'));                         // 인수 (dev, combined, common, short, tiny)

// static : 정적인 파일들을 제공하는 라우터 역할(css, js 관리)
app.use('/', express.static(path.join(__dirname, 'public')));   

// body-parser 미들웨어 - 최근에는 express에 포함 
app.use(express.json());                            // 데이터 전달 방식 
app.use(express.urlencoded({extended : false}));    // 주소형식으로 데이터 전달 - 폼전송을 위해 사용 

// cookie-parser - 쿠키 관리용 미들웨어 
app.use(cookieParser(process.env.COOKIE_SECRET));   // 비밀키 

// express-session - 세션 관리용 미들웨어 
app.use(session({
    resave: false,                                  // 세션을 다시 저장할지 여부 
    saveUninitialized: false,                       // 처음에 세션을 생성할지 여부 확인 
    secret: process.env.COOKIE_SECRET,              // secret 값 사용 
    cookie: {
        httpOnly: true,                             // 클라이언트에서 쿠기 확인 불가 
        secure : false,                             // https가 아닌 환경에서도 사용 가능 
    },
    name: 'session-cookie',                         // 세션 쿠기 이름 
}));

// 미들웨어는 req, res, next를 매개변수로 가지는 함수 
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

// 에러 처리 미들웨어 (err를 포함해서 4개의 매개변수)
app.use((err, req, res, next) => {
    console.log(err);
    res.status(500).send(err.message);
});

app.listen(app.get('port'), () => {
    console.log(app.get('port'), '번 포트에서 대기 중');
});

try{
    fs.readdirSync('uploads');    
} catch(error){
    console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다. ');
    fs.mkdirSync('uploads');
}

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, done) {      // 어디에 
            done(null, 'uploads/');
        },
        filename(req, file, done){          // 어떤 이름으로 저장 
            const ext = path.extname(file.originalname);
            done(null, path.basename(file.originalname, ext) + Date.now() + ext);
        },
    }),
    limits: {fileSize: 5 * 1024 * 1024},    // 5MB
});

app.get('/upload', (req, res) => {
    res.sendFile(path.join(__dirname, "multipart.html"));
});

app.post('/upload', upload.single('image'), (req, res) => {
    console.log(req.file, req.body);
    res.send('OK!');
});