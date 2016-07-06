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

    PushMessageLog.findAndCountAll({
      where: {
        template_type: 'delivery'
      },
      offset: offset,
      limit: limit
    })
    .then(function(results) {
      var count = results.count;
      return res.json({
        success: true,
        data: results.rows,
        offset: offset,
        limit: limit,
        count: count
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

  router.post("/create", function(req, res, next) {
    var param = req.body,
        openid = param.openid,
        content = param.content,
        unit_id = param.unit_id;

    //TODO, 推送模板消息
    PushMessageLog.create({
      openid: openid,
      template_id: 1,
      content: content,
      template_type: 'delivery',
      unit_id: unit_id
    })
    .then(function(log) {
      return res.json({
        success: true,
        data: log
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
