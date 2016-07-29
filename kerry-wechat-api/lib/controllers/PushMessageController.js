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
     Units = sequelize.model("Units"),
     models = options.db;

  var SendTemplateMessage = require('../Utils/SendTemplateMessage')

  var router = express.Router();

  router.post("/", function(req, res, next) {

    var param = req.body,
        offset = param.offset || 0,
        limit = param.limit || 20,
        template_type = param.template_type;

    var unitOption = {};
    if (req.units) {
      unitOption = {
        id: {
          $in: req.units
        }
      }
    }

    var messageOption = {};
    if (template_type && template_type.length > 0) {
      messageOption = {
        template_type: {
          $in: template_type
        }
      }
    }
    PushMessageLog.findAndCountAll({
      where: messageOption,
      include: [{
        model: sequelize.model("Units"),
        as: 'unit',
        where: unitOption,
        include: [{
          model: sequelize.model("KerryProperty"),
          as: 'property',
          where: {
            appId: param.appId
          }
        }]
      }],
      offset: offset,
      limit: limit,
      order: 'id desc'
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

  app.use("/pushMessage", router);
}
