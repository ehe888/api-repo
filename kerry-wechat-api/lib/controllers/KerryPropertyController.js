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
     KerryProperty =  sequelize.model("KerryProperty"),
     models = options.db,
     exec = require("child_process").exec;

  var router = express.Router();


  //创建物业
  // 2016.09.05新增功能, 创建物业后, 插入wechat link model
  router.post("/create", function(req, res, next) {
    var param = req.body;
    var name = param.name,
        app_id = param.appId,
        telephone = param.telephone,
        province = param.province,
        city = param.city,
        street = param.street,
        start_time = param.start_time,
        end_time = param.end_time,
        zipcode = param.zipcode,
        isjde = param.isjde,
        bill_sync_day = param.bill_sync_day,
        mch_id = param.mchId,
        partner_key = param.partnerKey

    var _property;
    KerryProperty.create({
      name: name,
      appId: app_id,
      telephone: telephone,
      province: province,
      city: city,
      street: street,
      start_time: start_time,
      end_time: end_time,
      zipcode: zipcode,
      isjde: isjde,
      bill_sync_day: bill_sync_day,
      mchId: mch_id,
      partnerKey: partner_key
    })
    .then(function(property) {
      _property = property
      var wechatLinks = [{
        name: "我的单元",
        link: "/wechat/my_bind",
        need_bind: true,
        property_id: property.id
      },{
        name: "物业缴费",
        link: "/wechat/unpaid_bill",
        need_bind: true,
        property_id: property.id
      },{
        name: "缴费历史",
        link: "/wechat/bill_history",
        need_bind: true,
        property_id: property.id
      }, {
        name: "意见反馈",
        link: "/wechat/see_suggestion",
        need_bind: true,
        property_id: property.id
      }, {
        name: "写反馈",
        link: "/wechat/suggestion",
        need_bind: true,
        property_id: property.id
      }, {
        name: "小区公告",
        link: "/wechat/billboard",
        property_id: property.id
      }, {
        name: "小区活动",
        link: "/wechat/activity",
        property_id: property.id
      }, {
        name: "办事指南",
        link: "/wechat/guide",
        property_id: property.id
      }, {
        name: "周边生活",
        link: "/wechat/surroundings",
        property_id: property.id
      }, {
        name: "享生活",
        link: "/wechat/life_style",
        property_id: property.id
      }, {
        name: "我要报修",
        link: "/wechat/work",
        need_bind: true,
        property_id: property.id
      }, {
        name: "报修查询",
        link: "/wechat/work_history",
        need_bind: true,
        property_id: property.id
      }]

      return sequelize.model("WechatLink").bulkCreate(wechatLinks)
    })
    .then(function() {
      return res.json({
        success: true,
        data: _property
      })
    })
    .catch(function(err) {
      console.log(err)
      return res.status(500).json({
        success: false
        ,errMsg: err.message
        ,errors: err
      })
    })
  })

  //修改物业
  router.post("/update", function(req, res, next) {
    var param = req.body;
    var id = param.id,
        name = param.name,
        app_id = param.appId,
        telephone = param.telephone,
        province = param.province,
        city = param.city,
        street = param.street,
        start_time = param.start_time,
        end_time = param.end_time,
        zipcode = param.zipcode,
        isjde = param.isjde,
        bill_sync_day = param.bill_sync_day,
        mch_id = param.mchId,
        partner_key = param.partnerKey


    KerryProperty.findOne({
      where: {
        id: id
      }
    })
    .then(function(property) {
      if (property) {
        property.update({
          name: name,
          appId: app_id,
          telephone: telephone,
          province: province,
          city: city,
          street: street,
          start_time: start_time,
          end_time: end_time,
          zipcode: zipcode,
          isjde: isjde,
          bill_sync_day: bill_sync_day,
          mchId: mch_id,
          partnerKey: partner_key
        })
        .then(function(property) {
          return res.json({
            success: true,
            data: property
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
        return res.status(404).json({
          success: false
          ,errMsg: '找不到该物业'
        })
      }
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

  router.post('/delete', function(req, res, next) {
    var id = req.body.id;

    KerryProperty.findOne({
      where: {
        id: id
      }
    })
    .then(function(property) {
      if (!property) {
        return res.json({
          success: false,
          errMsg: '找不到物业'
        })
      }
      var now = new Date(),
          nowTime = now.getTime();
      var name = property.name+"__"+nowTime;
      var appId = property.appId + "__"+nowTime;
      var telephone = property.telephone + "__"+nowTime;

      property.update({
        name: name,
        appId: appId,
        telephone: telephone
      })
      .then(function(property) {
        KerryProperty.destroy({
          where: {
            id: id
          }
        })
        .then(function(affectedRows) {
          return res.json({
            success: true,
            affectedRows: affectedRows
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
      .catch(function(err) {
        console.error(err)
        return res.status(500).json({
          success: false
          ,errMsg: err.message
          ,errors: err
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

  router.post('/query', function(req, res, next) {
    var name = req.body.name || '';
    KerryProperty
    .findAll({
      where: {
        name: {
          $like: '%'+name+'%'
        }
      }
    })
    .then(function(properties) {
      return res.json({
        success: true,
        data: properties
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

  router.post('/sync', function(req, res, next) {
    var now = new Date()
    var syncExec = req.x_app_config.syncExec + "sync_"+now.getFullYear()+(now.getMonth()+1)+now.getDate()+".log"
    console.log("exec: "+syncExec)
    exec(syncExec, {maxBuffer: 1024 * 2000}, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).json({
          success: false,
          error: error,
          errMsg: error.message
        })
      }
      return res.json({
        success: true
      })
    })
  })

  router.post("/getByAppId", function(req, res, next) {
    var param = req.body,
        appId = param.appId;
    KerryProperty.findOne({
      where: {
        appId: appId
      },
      attributes: ["name", "appId", "telephone", "start_time", "end_time", "bill_sync_day"]
    })
    .then(function(property) {
      return res.json({
        success: true,
        data: property
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
  })

  app.use("/properties", router);
}
