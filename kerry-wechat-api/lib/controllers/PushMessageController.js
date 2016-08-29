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

  router.post('/getTemplate', function(req, res, next) {
    var param = req.body,
        appId = param.appId,
        template_type = param.template_type;
    Template.findOne({
      where: {
        app_id: appId,
        template_type: template_type
      }
    })
    .then(function(template) {
      return res.json({
        success: true,
        data: template
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

  router.post("/updateTemplate", function(req, res, next) {
    var param = req.body,
        appId = param.appId,
        template_type = param.template_type,
        data = param.data;
    Template.findOne({
      where: {
        app_id: appId,
        template_type: template_type
      }
    })
    .then(function(template) {
      if (!template) {
        return res.status(404).json({
          success: false,
          errMsg: '找不到对应模板'
        })
      }
      return template.update({
        data: data
      })
    })
    .then(function(template) {
      return res.json({
        success: true,
        data: template
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

  router.post("/queryTemplatesByProperty", function(req, res, next) {
    var appId = req.body.appId;
    Template.findAll({
      where: {
        app_id: appId
      }
    })
    .then(function(templates) {
      return res.json({
        success: true,
        data: templates
      })
    })
  })

  //更新模板Id, 查询是否有模板Id
  router.post("/updateTemplatesByProperty", function(req, res, next) {
    var param = req.body,
        appId = param.appId,
        deliveryId = param.deliveryId,
        replyId = param.replyId,
        workId = param.workId,
        billId = param.billId;

    if (!deliveryId || !billId || !replyId) {
      return res.status(400).json({
        success: false,
        errMsg: '请输入完整信息'
      })
    }

    Template.findOne({
      where: {
        template_type: 'delivery',
        app_id: appId
      }
    })
    .then(function(template) {
      if (!template) {
        return Template.create({
          template_id: deliveryId,
          template_type: 'delivery',
          data: '{"first":"欢迎123","remark":"如有疑问，请联系物业服务中心，联系电话：023"}',
          app_id: appId
        })
      }else {
        return template.update({
          template_id: deliveryId
        })
      }
    })
    .then(function() {
      return Template.findOne({
        where: {
          template_type: 'bill',
          app_id: appId
        }
      })
    })
    .then(function(template) {
      if (!template) {
        return Template.create({
          template_id: billId,
          template_type: 'bill',
          data: '{"first":"尊敬的业主", "keyword1":"每月的01-30号","keyword2":"","keyword3":"","remark":""}',
          app_id: appId
        })
      }else {
        return template.update({
          template_id: billId
        })
      }
    })
    .then(function() {
      return Template.findOne({
        where: {
          template_type: 'suggestion_reply',
          app_id: appId
        }
      })
    })
    .then(function(template) {
      if (!template) {
        return Template.create({
          template_id: replyId,
          template_type: 'suggestion_reply',
          data: '{"first":"您好，您有新的物业反馈提醒：", "keyword1":"","keyword2":"投诉反馈","keyword3":"已受理",'+
                  '"keyword4":"您的投诉我们已经受理，目前正在处理中，请您耐心等待。","keyword5":"","remark":"感谢您对我们提出宝贵建议，若在处理过程中有任何疑问请随时与物业中心联系。"}',
          app_id: appId
        })
      }else {
        return template.update({
          template_id: replyId
        })
      }
    })
    .then(function() {
      return Template.findOne({
        where: {
          template_type: 'work_order',
          app_id: appId
        }
      })
    })
    .then(function(template) {
      if (!template) {
        return Template.create({
          template_id: workId,
          template_type: 'work_order',
          data: '{}',
          app_id: appId
        })
      }else {
        return template.update({
          template_id: workId
        })
      }
    })
    .then(function() {
      return res.json({
        success: true
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
