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
     KerrySuggestion =  sequelize.model("KerrySuggestion"),
     models = options.db;

  var router = express.Router();


  //创建物业
  router.post("/create", function(req, res, next) {
    var param = req.body;
    var content = param.content,
        wechat_user_id = param.wechat_user_id


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

      var app_id = user.app_id;
      sequelize.model("KerryProperty").findOne({
        where: {
          app_id: app_id
        }
      })
      .then(function(property) {
        if (!property) {
          return res.json({
            success: false,
            errMsg: '找不到物业!'
          })
        }
        var property_id = property.id;
        KerrySuggestion.create({
          content: content,
          wechat_user_id: wechat_user_id,
          property_id: property_id
        })
        .then(function(Suggestion) {
          return res.json({
            success: true,
            data: Suggestion
          });
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

    })

  })

  router.post("/update", function(req, res, next) {
    var param = req.body;
    var id = param.id,
        content = param.content,
        wechat_user_id = param.wechat_user_id


    KerrySuggestion.findOne({
      where: {
        id: id
      }
    })
    .then(function(suggestion) {
      if (suggestion) {
        suggestion.update({
          content : content,
          updated_at:new Date()
        })
        .then(function(suggestionupdate) {
          return res.json({
            success: true,
            data: suggestionupdate
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
          ,errMsg: '找不到该建议'
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
    KerrySuggestion.destroy({
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

  router.post('/query', function(req, res, next) {
    var content = req.body.content || '';
    var offset = req.body.offse || 0;
    var limit = req.body.limit || 20;
    var appId = req.body.appId;
    KerrySuggestion
    .findAndCountAll({
      where: {
        content: {
          $like: '%'+content+'%'
        }
      },
      include: [{
        model: sequelize.model("User"),
        as: "wechat_user"
      }, {
        model: sequelize.model("KerryProperty"),
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
        offset: offset,
        limit: limit,
        count: results.count,
        data: results.rows
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



  app.use("/suggestions", router);
}
