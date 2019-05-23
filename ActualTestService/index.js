'use strict';

var SwaggerExpress = require('swagger-express-mw');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./api/swagger/swagger.yaml');
const jwt = require('jsonwebtoken');

const express = require('express'),
    bodyParser = require('body-parser'),
    cors = require('cors'),
    morgan = require('morgan');

    var fs = require("fs");
    
const configJWT = require('./configs/jwt');
    
const configServer = require('./configs/server');
require('dotenv').config();
// import generateTest from './models/generate_test';
import MongoConector from './middlewares/mongo_connector'
import Models from './models/index';
import _ from 'lodash';

let app = express();
app.use(bodyParser.urlencoded({
    extended: false,
    // limit: "50mb", extended: true, parameterLimit: 50000 ,
}));

app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


///connect to db
app.models = new Models(app);

new MongoConector().connectDB()
    .then(db=>{
        app.db = db;

        // check manage quantity of question to generate the test.
        app.db.collection('manage_question_quantity').find().toArray().then(res=>{
            if(_.isEmpty(res)){
                let object = {
                    part_1: false, 
                    part_2: false,
                    part_3: false,
                    part_4: false,
                    part_5: false,
                    part_6: false,
                    part_7_1: false,
                    part_7_2: false,
                }
                for(let i = 0; i < 3; i++){
                    let level = i+1;
                    app.db.collection('manage_question_quantity').insertOne({quantity_question: object, level: level})
                }
            }
        });
        //
        // app.models.testModels.generateTest();
        // let change_streams = app.db.collection('listening_question').watch({operationType: 'insert'});
        //     change_streams.on('change', next => {
        //         // process next document
        //         console.log(JSON.stringify(change));
        //     });
    })
    .catch(err=>{
        // console.log(err)
        throw err;
    })

module.exports = app; // for testing

var config = {
    appRoot: __dirname, // required config
    swaggerSecurityHandlers: {
        auth0: function (req, authOrSecDef, scopesOrApiKey, next) {
            if (scopesOrApiKey) {
                var token = "" + scopesOrApiKey;
                jwt.verify(token, configJWT.secret.accessToken, function (err, decode) {
                    if (err) {
                        req.email = undefined;
                        next();
                    } else {
                        if(decode.role !== 'user' && decode.role !== "admin") {
                            next(new Error('access denied!'));
                        } else {
                            req.email = decode.email;
                            req.role = decode.role;
                            next();
                        }
                    }
                });
            } else {
                next();
                // next(new Error('access denied!'));
            }
        }
    }
};

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

SwaggerExpress.create(config, function (err, swaggerExpress) {
    if (err) { throw err; }

    // install middleware
    swaggerExpress.register(app);

    var port = process.env.PORT || configServer.port;
    console.log("Server is started by port " + port);
    app.listen(port);


});

// https://dzone.com/articles/upload-files-or-images-to-server-using-nodejs
// https://kipalog.com/posts/Express---Upload-file---form---multipart-form-data