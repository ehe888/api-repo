/**
 * System User Authentication controller
 */

module.exports = function(app, options){
  var _ = require("lodash"),
     debug = require('debug')('core-api'),
     express = require('express'),
     util = require('util'),
     path = require('path'),
     jwt = require('jsonwebtoken'),
     models = options.db;

  var router = express.Router();

  /**
  * PATH: /auth/login
  * System User Logined in with username + password
  */
  router.post("/login", function(req, res, next){
    var config = req.x_app_config;
    var accessTokenSecret = config.accessToken.secret
      ,accessTokenExpiresIn = config.accessToken.expiresIn
      ,accessTokenAlgorithm = config.accessToken.algorithm;

    //TODO: Save the token into DB for invalidate operation
    var claims = {
     sub: "su9527",
     ut: "admin"
    };
    var accessToken = jwt.sign(claims, accessTokenSecret
                   ,{
                       algorithm: accessTokenAlgorithm
                       ,expiresIn: accessTokenExpiresIn
                   });


    return res.json({
     success: true
     ,access_token: accessToken
    });
  });

  /**
  * PATH: /auth/logout
  * Remove or Disable previously retrived accessToken
  */
  router.get("/logout", function(req, res, next){
   //TODO: Implement token invalid opertion based on DB
   return res.json({
     success: true,
     msg: "success to void access token"
   });
  });

  app.use("/auth", router);
}
