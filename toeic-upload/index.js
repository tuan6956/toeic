var express = require('express')
var multer  = require('multer')
var fs  = require('fs')
var bodyParser   = require('body-parser');

let app = express();
app.use(bodyParser.urlencoded({
    extended: false,
    limit: "50mb", extended: true, parameterLimit: 50000 ,
}));
app.use('/public/audio/uploads',express.static(__dirname + '/public/audio/uploads'));
app.use('/public/image/uploads',express.static(__dirname + '/public/image/uploads'));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var storageImage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './public/image/uploads/')
    },
    filename: function (req, file, cb) {
        // console.log(file);
        console.log('file')
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});
var storageAudio = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {

        cb(null, './public/audio/uploads/')
    },
    filename: function (req, file, cb) {
        // console.log(file);
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1])
    }
});
var uploadMultipleImage = multer({ //multer settings
    storage: storageImage
}).array('file',20);

var uploadSingleImage = multer({ //multer settings
    storage: storageImage
}).single('file');

var uploadMultipleAudio = multer({ //multer settings
    storage: storageAudio
}).array('file',20);

var uploadSingleAudio = multer({ //multer settings
    storage: storageAudio
}).single('file');


/** API for single file image upload */
app.post('/api/uploadPhoto', function(req, res) {
    console.log("here", req.file)
    uploadSingleImage(req,res,function(err){
        if(err){
             res.json({status:-1,message:err});
             return;
        }
        console.log(req.file)
        res.json({'status': 1, 'message': req.file});
    })
});

/** API for multi file image upload */
app.post('/api/uploadPhotos', function(req, res) {
    uploadMultipleImage(req,res,function(err){
        if(err){
            console.log(err);
             res.json({status:-1,message:err});
             return;
        }
        res.json({'status': 1, 'message': req.files});
    })

});

/** API for single file audio upload */
app.post('/api/uploadAudio', function(req, res) {
    uploadSingleAudio(req,res,function(err){
        if(err){
             res.json({status:-1,message:err});
             return;
        }
        res.json({'status': 1, 'message': req.file});
    })
});

/** API for multi file audio upload */
app.post('/api/uploadAudios', function(req, res) {
    uploadMultipleAudio(req,res,function(err){
        if(err){
             res.json({status:-1,message:err});
             return;
        }

        res.json({'status': 1, 'message': req.files});
    })

});

app.listen(8001, function () {
    console.log('listening on port 8001!');
});