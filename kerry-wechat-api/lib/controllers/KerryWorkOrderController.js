
module.exports = function(app, db, options){
  var _ = require("lodash"),
     debug = require('debug')('core-api'),
     express = require('express'),
     util = require('util'),
     path = require('path'),
     sequelize = db.sequelize,  //The sequelize instance
     Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
     models = options.db;

  var router = express.Router();
  var env = process.env.NODE_ENV

  router.post("/create", function(req, res, next) {
    return res.json({
      success: true,
      data: 'to do'
    })
  })

  router.post("/update", function(req, res, next) {
    return res.json({
      success: true,
      data: 'to do'
    })
  })

  router.post("/delete", function(req, res, next) {
    return res.json({
      success: true,
      data: 'to do'
    })
  })


  app.use("/workOrder", router);

}
