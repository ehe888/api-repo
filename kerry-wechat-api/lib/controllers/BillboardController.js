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
     KerryBillboard = sequelize.model("KerryBillboard"),
     models = options.db;

  var router = express.Router();


  //创建公告
  router.post("/create", function(req, res, next) {
    var param = req.body,
        title = param.title,
        description = param.description || null,
        img_url = param.img_url || null,
        url = param.url,
        content = param.content,
        type = param.type,
        appId = param.appId

    var port = req.app.settings.port
    var host = req.protocol+"://"+req.hostname + ( port == 80 || port == 443 ? '' : ':'+port );

    KerryProperty.findOne({
      where: {
        app_id: appId
      }
    })
    .then(function(property) {
      if (!property) {
        return res.json({
          success: false,
          errMsg: '找不到物业'
        })
      }

      sequelize.model("WechatAssets").findOne({
        where: {
          media_id: img_url
        }
      })
      .then(function(asset) {
        img_url = host+asset.url;
        console.log(img_url);
        KerryBillboard.create({
          title: title,
          description: description,
          img_url: img_url,
          url: url,
          content: content,
          type: type,
          status: 5,
          property_id: property.id
        })
        .then(function(billboard) {
          return res.json({
            success: true,
            data: billboard
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

  //更新公告状态
  router.post("/updateStatus", function(req, res, next) {
    var param = req.body;
    var id = param.id,
        status = param.status;

    KerryBillboard.findOne({
      where: {
        id: id
      }
    })
    .then(function(billboard) {
      if (!billboard) {
        return res.json({
          success: false,
          errMsg: '找不到该公告!'
        })
      }

      billboard.update({
        status: status
      })
      .then(function(billboard) {
        return res.json({
          success: true,
          data: billboard
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

  //更新公告
  router.post("/update", function(req, res, next) {
    var param = req.body;
    var id = param.id,
        title = param.title,
        description = param.description || null,
        img_url = param.img_url || null,
        url = param.url,
        type = param.type,
        content = param.content;

    KerryBillboard.findOne({
      where: {
        id: id
      }
    })
    .then(function(billboard) {
      if (!billboard) {
        return res.json({
          success: false,
          errMsg: '找不到该公告!'
        })
      }

      billboard.update({
        title: title,
        description: description,
        img_url: img_url,
        url: url,
        content: content,
        type: type
      })
      .then(function(billboard) {
        return res.json({
          success: true,
          data: billboard
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


  //删除公告
  router.post('/delete', function(req, res, next) {
    var id = req.body.id;
    KerryBillboard.destroy({
      where: {
        id: id
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

  //后台管理界面查询
  router.post('/query', function(req, res, next) {
    var param = req.body,
        offset = param.offset || 0,
        limit = param.limit || 20,
        title = param.title || "",
        type = param.type,
        appId = param.appId;
    KerryBillboard.findAndCountAll({
      where: {
        title: {
          $like: '%'+title+'%'
        },
        type: type
      },
      include:[{
        model: KerryProperty,
        as: 'property',
        where: {
          app_id: appId
        }
      }],
      offset: offset,
      limit: limit,
      order: 'id desc'
    })
    .then(function(results) {
      return res.json({
        success: true,
        data: results.rows,
        offset: offset,
        limit: limit,
        count: results.count
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

  //微信端查询
  router.post('/queryByWechat', function(req, res, next) {
    var param = req.body,
        offset = param.offset || 0,
        limit = param.limit || 10,
        type = param.type,
        wechat_user_id = param.wechat_user_id;

    sequelize.model("User").findOne({
      where: {
        username: wechat_user_id
      }
    })
    .then(function(user) {

      if (!user) {
        return res.json({
          success: false,
          errMsg: '找不到用户!'
        })
      }

      var appId = user.app_id;
      KerryBillboard.findAndCountAll({
        attributes: ['title', 'description', 'img_url', 'url', 'type','created_at', 'updated_at'],
        where: {
          status: KerryBillboard.Status.PUBLISHED,
          type: type
        },
        include:[{
          model: KerryProperty,
          as: 'property',
          where: {
            app_id: appId
          }
        }],
        offset: offset,
        limit: limit,
        order: 'id desc'
      })
      .then(function(results) {
        return res.json({
          success: true,
          data: results.rows,
          offset: offset,
          limit: limit,
          count: results.count
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

  app.use("/billboards", router);
}
