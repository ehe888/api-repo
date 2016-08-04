module.exports = function(app, db, options){
var _ = require("lodash"),
   debug = require('debug')('core-api'),
   express = require('express'),
   util = require('util'),
   path = require('path'),
   jwt = require('jsonwebtoken'),
   sequelize = db.sequelize,  //The sequelize instance
   Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
   WechatAssets =  sequelize.model("WechatAssets"),
   rp = require('request-promise'),
   models = options.db;

var router = express.Router();

router.post("/combineNews", function(req, res, next) {
  var param = req.body,
      news_item = param.news_item,
      appId = param.appId

  var bearer = req.headers['authorization'];
  var config = req.x_app_config;

  var url = config.apiHost +'/wxapi/news/post_news?app_id='+appId
  var option = {
    uri: url,
    method: 'POST',
    json: {
      articles: news_item
    },
    headers: {
      authorization: bearer
    }
  }
  rp(option)
  .then(function(response) {
    if (response.success) {
      var media_id = response.media_id,
          data = response.data
      var content;
      try {
        content = JSON.stringify(data)
      } catch (e) {
        return res.json({
          success: false,
          errMsg: e.message,
          error: e
        })
      }

      sequelize.model("KerryNews")
      .create({
        media_id: media_id,
        content: content,
        app_id: appId
      })
      .then(function(news) {
        return res.json({
          success: true,
          data: news
        })
      })
    }
    else {
      return res.json({
        success: false,
        errMsg: response.errMsg,
        error: response.error
      })
    }
  })
  .catch(function(error) {
    return res.json({
      success: false,
      errMsg: error.message,
      error: error
    })
  })

})


router.post("/singleNews", function(req, res, next) {
  var param = req.body,
      appId = param.appId

  var bearer = req.headers['authorization'];
  var config = req.x_app_config;

  var url = config.apiHost +'/wxapi/news/post_single_news?app_id='+appId
  var option = {
    uri: url,
    method: 'POST',
    json: param,
    headers: {
      authorization: bearer
    }
  }
  rp(option)
  .then(function(response) {
    if (response.success) {
      var media_id = response.media_id,
          data = response.data
      var content;
      try {
        content = JSON.stringify(data)
      } catch (e) {
        return res.json({
          success: false,
          errMsg: e.message,
          error: e
        })
      }

      sequelize.model("KerryNews")
      .create({
        media_id: media_id,
        content: content,
        app_id: appId
      })
      .then(function(news) {
        return res.json({
          success: true,
          data: news
        })
      })
    }
    else {
      return res.json({
        success: false,
        errMsg: response.errMsg,
        error: response.error
      })
    }
  })
  .catch(function(error) {
    return res.json({
      success: false,
      errMsg: error.message,
      error: error
    })
  })

})

router.post('/query', function(req, res, next) {
  var param = req.body,
      offset = param.offset || 0,
      limit = param.limit || 10,
      appId = param.appId;

  sequelize.model("KerryNews")
  .findAndCountAll({
    where: {
      app_id: appId
    },
    offset: offset,
    limit: limit
  })
  .then(function(results) {
    var count = results.count;
    var data =results.rows;
    return res.json({
      success: true,
      data: data,
      offset: offset,
      limit:limit,
      count: count
    })
  })
  .catch(function(err) {
    return res.status(500).json({
      success: false,
      errMsg: err.message,
      error: err
    })
  })

})


app.use("/wechatNews", router);

}
