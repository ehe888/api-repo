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

router.post("/", function(req, res, next) {
  var param = req.body,
      media_id = param.media_id,
      appId = param.appId

  var bearer = req.headers['authorization'];
  var port = req.app.settings.port
  var host = req.protocol+"://"+req.hostname + + ( port == 80 || port == 443 ? '' : ':'+port );
  WechatAssets.findOne({
    where: {
      media_id: media_id,
      app_id: appId
    }
  })
  .then(function(asset) {

    if (!asset) {

      var url = host +'/wxapi/asset/get_media_asset?app_id='+appId
      var option = {
        uri: url,
        method: 'POST',
        json: {
          media_id: media_id,
          type: param.type
        },
        headers: {
          authorization: bearer
        }
      }

      rp(option)
        .then(function(data) {
          if (data.success) {
            var filename = data.data;
            WechatAssets.create({
              media_id: media_id,
              url: '/upload/'+filename,
              app_id: appId
            })
            .then(function(asset) {
              return res.json({
                success: true,
                data: host+asset.url
              })
            })
            .catch(function(err) {
              console.error(err);
              return res.status(500).json({
                success: false
                ,errMsg: err.message
                ,errors: err
              })
            })

          }else {
            return res.json(data)
          }

        })
        .catch(function(err) {
          console.error(err);
          return res.status(500).json({
            success: false
            ,errMsg: err.message
            ,errors: err
          })
        })
    }
    else {
      return res.json({
        success: true,
        data: host+asset.url
      })
    }


  })
  .catch(function(err) {
    console.error(err);
    return res.status(500).json({
      success: false
      ,errMsg: err.message
      ,errors: err
    })
  })

})


app.use("/wechatAssets", router);

}
