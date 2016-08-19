
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
        assetIds = param.assetIds || [],
        wechat_user_id = param.wechat_user_id

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

    if (!wechat_user_id) {
      return res.status(400).json({
        success: false,
        errMsg: '无效的微信号'
      })
    }

    sequelize.model("UserUnitBinding").findOne({
      where: {
        wechat_user_id: wechat_user_id,
        unit_id: unit_id
      }
    })
    .then(function(userUnit) {
      if (!userUnit) {
        return res.status(400).json({
          success: false,
          errMsg: '微信号没有与该单元绑定!'
        })
      }

      KerryWorkOrder.create({
        unit_id: unit_id,
        owner: userUnit.username,
        mobile: userUnit.mobile
      })
      .then(function(order) {
        return KerryWorkOrderLine.create({
          kerry_work_order_id: order.id,
          title: title,
          count: 1
        })
      })
      .then(function(orderLine) {
        return WechatAssets.update({
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
      .catch(function(err) {
        console.log(err)
        return res.status(500).json({
          success: false,
          errMsg: err.message,
          errors: err
        })
      })
    })
    .catch(function(err) {
      console.log(err)
      return res.status(500).json({
        success: false,
        errMsg: err.message,
        errors: err
      })
    })


  })

  router.post("/update", function(req, res, next) {
    var param = req.body,
        id = param.id;
    
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
    var param = req.body,
        offset = param.offset || 0,
        limit = param.limit || 20,
        unit_desc = param.unit_desc || '',
        appId = param.appId

    KerryWorkOrder.findAndCountAll({
      subQuery: false,
      include: [{
        model: KerryWorkOrderLine,
        as: 'kerry_work_order_lines',
        attributes: ['id', 'title', 'price', 'count', 'amount']
      }, {
        model: sequelize.model("WechatAssets"),
        attributes: ['id', 'media_id', 'url', 'type'],
        as: 'wechat_assets'
      }, {
        model: sequelize.model("SysUser"),
        as: "sys_user",
        attributes: ["id", "firstName", "lastName"]
      },  {
        model: sequelize.model("User"),
        as: "wechat_user",
        attributes: ["username", "wechatId", "wechatNickname", "wechatSex", "wechatProvince", "wechatCity", "wechatHeadimage"]
      }, {
        model: sequelize.model("Units"),
        as: 'unit',
        attributes: ["id", "unit_number", "unit_desc"],
        where: {
          unit_desc: {
            $like: '%'+unit_desc+'%'
          }
        },
        include: [{
          model: sequelize.model("KerryProperty"),
          as: 'property',
          where: {
            appId: appId
          }
        }]
      }],
      offset: offset,
      limit: limit,
      order: 'id desc'
    })
    .then(function(results) {
      return res.json({
        success: true,
        data: results.rows,
        count: results.count,
        offset: offset,
        limit: limit
      })
    })


  })


  app.use("/workOrder", router);

}
