
module.exports = function(app, db, options){
  var _ = require("lodash"),
     debug = require('debug')('core-api'),
     express = require('express'),
     util = require('util'),
     path = require('path'),
     sequelize = db.sequelize,  //The sequelize instance
     Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
     models = options.db,
     KerryWorkOrder = sequelize.model("KerryWorkOrder"),
     KerryWorkOrderLine = sequelize.model("KerryWorkOrderLine"),
     WechatAssets = sequelize.model("WechatAssets")

  var router = express.Router();
  var env = process.env.NODE_ENV

  router.post("/create", function(req, res, next) {
    var param = req.body,
        unit_id = param.unit_id,
        title = param.title,
        assetIds = param.assetIds,
        owner = param.owner,
        mobile = param.mobile

    if (!unit_id) {
      return res.status(400).json({
        success: false,
        errMsg: '无效的户号'
      })
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        errMsg: '请输入内容'
      })
    }

    if (!owner) {
      return res.status(400).json({
        success: false,
        errMsg: '请输入联系人'
      })
    }

    if (!mobile) {
      return res.status(400).json({
        success: false,
        errMsg: '请输入手机号'
      })
    }

    KerryWorkOrder.create({
      unit_id: unit_id,
      owner: owner,
      mobile: mobile
    })
    .then(function(order) {
      return KerryWorkOrderLine.create({
        kerry_work_order_id: order.id,
        title: title,
        count: 1
      })
    })
    .then(function(orderLine) {
      WechatAssets.update({
        kerry_work_order_id: orderLine.kerry_work_order_id
      }, {
        where: {
          id:{
            $in: assetIds
          }
        }
      })
    })
    .then(function() {
      return res.json({
        success: true
      })
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

  router.post("/query", function(req, res, next) {
    return res.json({
      success: true,
      data: 'to do'
    })
  })


  app.use("/workOrder", router);

}
