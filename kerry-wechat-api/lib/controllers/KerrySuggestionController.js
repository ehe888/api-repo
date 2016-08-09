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

  //通过视图查询
  router.post("/queryByView", function(req, res, next) {
    var offset = req.body.offse || 0;
    var limit = req.body.limit || 20;
    var appId = req.body.appId;

    var returnData = {
      success: true,
      offset: offset,
      limit: limit
    }
    sequelize.query('SELECT * FROM vw_suggestion WHERE app_id = ? ORDER BY id DESC OFFSET ? LIMIT ?',
                    {
                      replacements: [appId, offset, limit],
                       type: sequelize.QueryTypes.SELECT
                    })
    .then(function(results) {

      var data = [];
      for (var i = 0; i < results.length; i++) {
        var row = results[i];
        var sameIdData = _.find(data, function(o) {
          return o.id == row.id
        })
        if (sameIdData) {
          sameIdData.units.push({
            unit_id: row.unit_id,
            unit_number: row.unit_number,
            unit_desc: row.unit_desc
          })
          sameIdData.users.push({
            username: row.username,
            mobile: row.mobile
          })
        }
        else {
          data.push({
            id: row.id,
            content: row.content,
            created_at: row.created_at,
            wechat_id: row.wechat_id,
            wechat_nickname: row.wechat_nickname,
            property_name: row.property_name,
            units: [{
              unit_id: row.unit_id,
              unit_number: row.unit_number,
              unit_desc: row.unit_desc
            }],
            users: [{
              username: row.username,
              mobile: row.mobile
            }]
          })
        }
      }
      returnData.data = data;
      return sequelize.query('SELECT count(1) FROM vw_suggestion WHERE app_id = ?',
                       {
                         replacements: [appId],
                         type: sequelize.QueryTypes.SELECT
                       })

    })
    .then(function(count) {
      returnData.count = parseInt(count.length>0?count[0].count:0);
      return res.json(returnData)
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

  router.post("/queryByWechatUser", function(req, res, next) {
    var offset = req.body.offset || 0;
    var limit = req.body.limit || 10;
    var wechat_user_id = req.body.wechat_user_id;
    KerrySuggestion
    .findAndCountAll({
      where: {
        wechat_user_id: wechat_user_id
      },
      include: [{
        model: sequelize.model("User"),
        as: "wechat_user"
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
