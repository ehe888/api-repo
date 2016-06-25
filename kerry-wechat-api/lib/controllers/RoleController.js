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
  * PATH: /roles
  * return system roles
  */
  router.get("/", function(req, res, next){
    return res.json({
     success: true
     ,data: [{
       name: "SUPER_USER",
       permission: [{
         method: "*",
         path: "*"
       }]
     }]
    });
  });

  app.use("/roles", router);
}
