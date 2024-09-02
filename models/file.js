const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) { 
    console.log("Express",file);
    console.log("testproject: ", req.body.data);
    const id = (file.originalname).slice(0,6);
    const path = 'uploads/'+id;
    fs.mkdirSync(path, { recursive: true });
    cb(null, path);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)              // 원래 파일이름으로 저장
  }
})

const upload = multer({storage: storage })     // storage를 호출

module.exports = upload;