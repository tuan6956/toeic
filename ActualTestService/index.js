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

let app = express();
app.use(bodyParser.urlencoded({
    extended: false,
    // limit: "50mb", extended: true, parameterLimit: 50000 ,
}));

app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
