const express = require('express');

const router = express.Router();

// Get - / 라우터 
router.get('/', (req, res, next) => {
    //res.send('Hello, Express');
    res.render('index', {title:'Express'});     // views에 있는 index.html을 호출한다. 
});

module.exports = router;