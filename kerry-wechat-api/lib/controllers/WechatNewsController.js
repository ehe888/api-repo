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
  debug(param)
  var bearer = req.headers['authorization'];
  var config = req.x_app_config;

  for (var i = 0; i < news_item.length; i++) {
    var news = news_item[i];
    if (!news.content || news.content == '') {
      return res.status(400).json({
        success: false,
        errMsg: '"'+news.title+'" 内容为空!'
      })
    }
  }

  var url = config.apiLocal +'/wxapi/news/post_news?app_id='+appId
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

  var url = config.apiLocal +'/wxapi/news/post_single_news?app_id='+appId
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
    console.log(response)
    if (response.success) {
      var media_id = response.media_id,
          data = response.data
      var content;
      try {
        content = JSON.stringify(data)
      } catch (e) {
        console.error(e)
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
    console.error(error)
    console.error(JSON.stringify(error))
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

router.post("/queryThisMonth", function(req, res, next) {
  var now = new Date();
  var date = now.getFullYear() + "/"+(now.getMonth()+1)+"/1 08:00:00";
  var thisMonth = new Date(date);

  sequelize.model("KerryNews").findAndCountAll({
    where: {
      created_at: {
        $gt: thisMonth
      },
      app_id: req.body.appId
    }
  })
  .then(function(results) {
    return res.json({
      success: true,
      data: results.rows,
      count: results.count
    })
  })


})


app.use("/wechatNews", router);

}
