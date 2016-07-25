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


    KerrySuggestion.create({
      content: content,
      wechat_user_id: wechat_user_id
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

  //修改物业
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
    KerrySuggestion
    .findAll({
      where: {
        content: {
          $like: '%'+content+'%'
        }
      }
    })
    .then(function(suggestions) {
      return res.json({
        success: true,
        data: suggestions
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
