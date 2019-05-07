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
import generateTest from './models/generate_test';
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
        // app.db.collection('manage_question_quantity').find().toArray().then(res=>{
        //     if(_.isEmpty(res)){
        //         // console.log(res)
        //         let object = {}
        //         for(let i = 1; i <= 7; i++){
        //             object['part_'+i.toString()] = {
        //                 level_1: {
        //                     quantity: 0,
        //                     status: pending
        //                 },
        //                 level_2: {
        //                     quantity: 0,
        //                     status: pending
        //                 },
        //                 level_3: {
        //                     quantity: 0,
        //                     status: pending
        //                 },
        //                 level_4: {
        //                     quantity: 0,
        //                     status: pending
        //                 }
        //             }
        //         }
        //         app.db.collection('manage_question_quantity').insertOne(object).then(res=>{
        //             // console.log(res)
        //         })
        //         .catch(err=>{
        //             // console.log(err)
        //             throw err
        //         })
        //     }
            
        // });
        //generate the test
        app.models.generateTest.generateTestToLevel(1);
    })
    .catch(err=>{
        console.log(err)
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
    console.log(port);
    app.listen(port);


});

// https://dzone.com/articles/upload-files-or-images-to-server-using-nodejs
// https://kipalog.com/posts/Express---Upload-file---form---multipart-form-data