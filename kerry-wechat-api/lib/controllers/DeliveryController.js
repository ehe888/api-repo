/**
 * System User Authentication controller
 */
module.exports = function(app, db, options){
  var _ = require("lodash"),
     debug = require('debug')('core-api'),
     express = require('express'),
     util = require('util'),
     path = require('path'),
     jwt = require('jsonwebtoken'),
     sequelize = db.sequelize,  //The sequelize instance
     Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
     Template =  sequelize.model("Template"),
     PushMessageLog = sequelize.model("PushMessageLog"),
     models = options.db;

  var router = express.Router();

  router.post("/", function(req, res, next) {

    var param = req.body,
        offset = param.offset,
        limit = param.limit

    PushMessageLog.findAll({
      where: {
        template_type: 'delivery'
      },
      offset: offset,
      limit: limit
    })
    .then(function(logs) {
      // console.log(logs)
      return res.json({
        success: true,
        data: logs,
        offset: offset,
        limit: limit
      })
    })
    .catch(function(err) {
      console.error(err)
      return res.status(500).json({
        success: false
        ,errMsg: err.message
        ,errors: err
      })
    })

  })


  app.use("/delivery", router);
}
