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

  var router = express.Router();

  router.post("/", function(req, res, next) {

    var param = req.body,
        offset = param.offset,
        limit = param.limit

    PushMessageLog.findAndCountAll({
      where: {
        template_type: 'delivery'
      },
      include: [{
        model: sequelize.model("Units"),
        as: 'unit'
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
        unit_number = param.unit_number;

    //TODO, 推送模板消息
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
        var logs = [];
        for (var i = 0; i < unit.user_unit_binding.length; i++) {
          var user_unit_binding = unit.user_unit_binding[i];

          if (user_unit_binding.wechat_user) {
            var wechat_user = user_unit_binding.wechat_user;
            var openid = wechat_user.wechatId;
            logs.push({
              openid: openid,
              template_id: 1,
              content: content,
              template_type: 'delivery',
              unit_id: unit.id
            })
          }
        }

        PushMessageLog.bulkCreate(logs)
        .then(function(results) {
          console.log(results)
          return res.json({
            success: true,
            data: logs
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
