/**
 * System User Authentication controller
 */
module.exports = function(app, db, options){
  var _ = require("lodash"),
     debug = require('debug')('core-api'),
     express = require('express'),
     util = require('util'),
     path = require('path'),
     sequelize = db.sequelize,  //The sequelize instance
     Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
     WechatLink =  sequelize.model("WechatLink"),
     models = options.db

  var router = express.Router();

  // 修改微信菜单
  router.post("/update", (req, res, next) => {
    var param = req.body,
        is_open = param.is_open,
        need_bind = param.need_bind || false,
        id = param.id

    WechatLink.update({
      is_open: is_open,
      need_bind: need_bind
    }, {
      where: {
        id: id
      }
    })
    .then(() => {
      return res.json({
        success: true
      })
    })
    .catch((err) => {
      console.error(err)
      var status = err.status || 500
      return res.status(status).json({
        success: false
        ,errMsg: err.message
        ,errors: err
      })
    })
  })

  // 查询
  router.post("/query", (req, res, next) => {
    var param = req.body,
        appId = param.appId
    sequelize.model("KerryProperty").findOne({
      where: {
        appId: appId
      }
    })
    .then((property) => {
      if (!property) {
        var error = new Error("找不到物业!")
        error.status = 400
        throw error
      }
      return WechatLink.findAll({
        where: {
          property_id: property.id
        },
        order: sequelize.col("id")
      })
    })
    .then((links) => {
      return res.json({
        success: true,
        data: links
      })
    })
    .catch((err) => {
      console.error(err)
      var status = err.status || 500
      return res.status(status).json({
        success: false
        ,errMsg: err.message
        ,errors: err
      })
    })

  })

  app.use("/wechatLink", router);
}
