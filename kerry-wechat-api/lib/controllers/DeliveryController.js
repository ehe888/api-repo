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
        offset = param.offset,
        limit = param.limit

    var unitOption = {};
    if (req.units) {
      unitOption = {
        id: {
          $in: req.units
        }
      }
    }

    PushMessageLog.findAndCountAll({
      where: {
        template_type: 'delivery'
      },
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

  router.post("/create", function(req, res, next) {
    var param = req.body,
        content = param.content,
        unit_number = param.unit_number,
        topcolor = param.topcolor,
        url = param.url,
        app_id = req.query.app_id

    var port = req.app.settings.port
    var host = req.protocol+"://"+req.hostname + ( port == 80 || port == 443 ? '' : ':'+port );
    Units.findOne({
      where: {
        unit_number: unit_number
      },
      include: [{
        model: sequelize.model("UserUnitBinding"),
        as: 'user_unit_binding',
        include: [{
          model: sequelize.model("User"),
          as: 'wechat_user'
        }]
      }]
    })
    .then(function(unit) {

      if (!unit) {
        return res.json({
          success: false,
          errMsg: '找不到该房屋'
        })
      }
      else if (unit.user_unit_binding) {

        Template.findOne({
          where: {
            template_type: 'delivery',
            app_id: app_id
          }
        })
        .then(function(template) {

          if (!template) {
            return res.status(500).json({
              success: false,
              errMsg: '没有找到相应模板'
            })
          }

          var logs = [],
              openids = [];
          for (var i = 0; i < unit.user_unit_binding.length; i++) {
            var user_unit_binding = unit.user_unit_binding[i];

            if (user_unit_binding.wechat_user) {
              var wechat_user = user_unit_binding.wechat_user;
              var openid = wechat_user.wechatId;
              logs.push({
                openid: openid,
                template_id: template.id,
                content: content,
                template_type: 'delivery',
                unit_id: unit.id
              })
              openids.push(openid)
            }
          }

          PushMessageLog.bulkCreate(logs)
          .then(function(results) {
            console.log(results)

            var bearer = req.headers['authorization'];
            var access_token = bearer.substring("Bearer".length).trim();
            console.log(access_token)
            SendTemplateMessage(openids, content, template.template_id, url, topcolor, access_token, app_id, host, function() {
              return res.json({
                success: true,
                data: logs
              })
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
      }
      else {
        return res.json({
          success: false,
          errMsg: '该房屋没有绑定用户!'
        })
      }

    })


  })


  app.use("/delivery", router);
}
