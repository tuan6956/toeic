'use strict';

var SwaggerExpress = require('swagger-express-mw');
var app = require('express')();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./api/swagger/swagger.yaml');
const jwt = require('jsonwebtoken');
const configJWT = require('./api/controllers/config');
require('dotenv').config();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
module.exports = app; // for testing

var config = {
  appRoot: __dirname, // required config
  swaggerSecurityHandlers: {
    auth0: function (req, authOrSecDef, scopesOrApiKey, next) {
      console.log(process.env.REQ_AUTH);
      if(process.env.REQ_AUTH === "false") {
        next();
      } else if(scopesOrApiKey) {
        var token = "" + scopesOrApiKey;
        jwt.verify(token, configJWT.secret.accessToken, function (err, decode) {
            if (err) {
                req.phone = undefined;
                next();
            } else {
                if(decode.role !== 'user' && decode.role !== "admin") {
                    next(new Error('access denied!'));
                } else if (decode.role !== "admin" && req.method !== 'GET'){
                    next(new Error('access denied!'));
                } else {
                    req.phone = decode.phone;
                    req.role = decode.role;
                    next();
                }
            }
        });
      } else {
        next(new Error('access denied!'));
      }
    }
  }
};

SwaggerExpress.create(config, function(err, swaggerExpress) {
  if (err) { throw err; }

  // install middleware
  swaggerExpress.register(app);

  var port = process.env.PORT || 8003;
  console.log(port);
  app.listen(port);
  
});
