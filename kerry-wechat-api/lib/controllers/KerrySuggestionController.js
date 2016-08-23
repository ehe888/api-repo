/**
 * System User Authentication controller
 */
module.exports = function(app, db, options){
  var _ = require("lodash"),
     debug = require('debug')('core-api'),
     express = require('express'),
     util = require('util'),
     path = require('path'),
     env = process.env.NODE_ENV,
     sequelize = db.sequelize,  //The sequelize instance
     Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
     KerrySuggestion =  sequelize.model("KerrySuggestion"),
     models = options.db;

  var router = express.Router();

  var SendTemplateMessage = require('../Utils/SendTemplateMessage')


  //创建反馈
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
    var offset = req.body.offset || 0;
    var limit = req.body.limit || 20;
    var appId = req.body.appId;

    debug(req.body)
    debug(offset)
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
    var offset = req.body.offset || 0;
    var limit = req.body.limit || 20;
    var appId = req.body.appId;

    var returnData = {
      success: true,
      offset: offset,
      limit: limit
    }

    var query = "SELECT * FROM vw_suggestion WHERE app_id = ? "
    if (req.units) {
      var unitsStr = "null"
      if (req.units.length > 0) {
        unitsStr = req.units.join(",")
      }
      query += " AND unit_id in (" + unitsStr + ") "
    }
    query += " ORDER BY id DESC OFFSET ? LIMIT ?";

    sequelize.query(query,
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
            has_reply: row.has_reply,
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
      var countQuery = 'SELECT count(1) FROM vw_suggestion WHERE app_id = ? '
      if (req.units) {
        var unitsStr = "null"
        if (req.units.length > 0) {
          unitsStr = req.units.join(",")
        }
        countQuery += " AND unit_id in (" + unitsStr + ") "
      }
      return sequelize.query(countQuery,
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

  //某个微信用户查询
  router.post("/queryByWechatUser", function(req, res, next) {
    var offset = req.body.offset || 0;
    var limit = req.body.limit || 10;
    var wechat_user_id = req.body.wechat_user_id;
    KerrySuggestion
    .findAndCountAll({
      subQuery: false,
      where: {
        wechat_user_id: wechat_user_id
      },
      include: [{
        model: sequelize.model("KerryProperty"),
        as: "property",
        attributes: ["name"]
      }, {
        model: sequelize.model("KerrySuggestionReply"),
        as: 'suggestion_reply',
        include: [{
          model: sequelize.model("SysUser"),
          as: 'sys_user',
          attributes: ["firstName", "lastName"]
        }]
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

  //新增回复
  router.post("/reply", function(req, res, next) {
    var param = req.body,
        content = param.content,
        suggestion_id = param.suggestion_id,
        appId = param.appId,
        from = param.from || 'SYS_USER';

    var port = req.app.settings.port
    var host = req.protocol+"://"+req.hostname + ( port == 80 || port == 443 ? '' : ':'+port );
    var config = req.x_app_config;

    var option = {
      content: content,
      from: from,
      kerry_suggestion_id: suggestion_id
    }
    if (from == 'SYS_USER') {
      option.sys_user_id = param.sys_user_id
    }
    else {
      option.wechat_user_id = param.wechat_user_id
    }

    sequelize.model("KerrySuggestionReply")
    .create(option)
    .then((reply) => {

      //创建成功, 物业用户回复的话, 推送模板消息
      if (from == 'SYS_USER') {
        sequelize.query('SELECT * FROM vw_suggestion WHERE id = ? limit 1',
          {replacements: [suggestion_id], type: sequelize.QueryTypes.SELECT})
        .then(function(results) {
          if (results.length > 0) {
            var suggestion = results[0]
            var wechat_user_id = 'wechat_'+suggestion.wechat_id

            var units = "";
            var unit_id;
            sequelize.model("UserUnitBinding")
            .findAll({
              where: {
                wechat_user_id: wechat_user_id
              },
              include: [{
                model: sequelize.model("Units"),
                as: "unit"
              }]
            })
            .then(function(userUnits) {

              userUnits.forEach(function(userUnit) {
                if (userUnit.unit) {
                  if (units.length > 0) {
                    units += "," + userUnit.unit.unit_desc
                  }else {
                    units += userUnit.unit.unit_desc
                  }
                  unit_id = userUnit.unit.id
                }
              })

              return sequelize.model("SysUser")
              .findOne({
                where: {
                  id: param.sys_user_id
                },
                include: [{
                  model: sequelize.model("KerryProperty"),
                  as: 'WorkingProperty'
                }]
              })
            })
            .then(function(sysUser) {
              if (!unit_id) {
                return res.status(500).json({
                  success: false,
                  errMsg: '回复成功, 推送用户失败: 该用户没有绑定单元!',
                  error: err
                })
              }
              sequelize.model("Template").findOne({
                where: {
                  template_type: 'suggestion_reply',
                  app_id:appId
                }
              })
              .then(function(template) {
                if (!template) {
                  return res.status(500).json({
                    success: false,
                    errMsg: '回复成功, 推送用户失败: 物业没有配置模板',
                  })
                }

                try {
                  var templateData = JSON.parse(template.data);
                  console.log(template.data)
                  var content = {
                    first: templateData.first,
                    keyword1: {
                      value: units,
                      color: '#173177'
                    },
                    keyword2: {
                      value: templateData.keyword2,
                      color: '#173177'
                    },
                    keyword3: {
                      value: templateData.keyword3,
                      color: '#173177'
                    },
                    keyword4: {
                      value: reply.content,
                      color: '#173177'
                    },
                    keyword5: {
                      value: sysUser.firstName+sysUser.lastName,
                      color: '#173177'
                    },
                    remark:{
                      value: templateData.remark,
                      color: '#000000'
                    }
                  }
                  var contentStr = JSON.stringify(content)
                  sequelize.model("PushMessageLog").create({
                    openid: suggestion.wechat_id,
                    template_id: template.id,
                    content: contentStr,
                    template_type: 'suggestion_reply',
                    unit_id: unit_id
                  })
                  .then((log)=> {
                    if (env == 'development') {
                      return res.json({
                        success: true,
                        data: log
                      })
                    }
                    var url = config.wechatHost+"/wechat/see_suggestion?appId="+appId
                    var topcolor = '#173177';
                    var bearer = req.headers['authorization'];
                    var access_token = bearer.substring("Bearer".length).trim();
                    SendTemplateMessage([suggestion.wechat_id], contentStr, template.template_id, url, topcolor, access_token, appId, host, function() {
                      return res.json({
                        success: true,
                        data: reply
                      })
                    })
                  })
                  .catch((err) => {
                    console.error(err)
                    return res.status(500).json({
                      success: false,
                      errMsg: '回复成功, 推送用户失败: 物业没有配置模板',
                      error: err
                    })
                  })

                } catch (e) {
                  return res.status(500).json({
                    success: false,
                    errMsg: '回复成功, 推送用户失败: 物业模板错误',
                    error: err
                  })
                }

              })
              .catch(function(err) {
                console.error(err)
                return res.status(500).json({
                  success: false,
                  errMsg: '回复成功, 推送用户失败: 系统用户错误',
                  error: err
                })
              })

            })
            .catch(function(err) {
              console.error(err)
              return res.status(500).json({
                success: false,
                errMsg: '回复成功, 推送用户失败: 找不到该用户',
                error: err
              })
            })

          }
          else {
            return res.status(500).json({
              success: false,
              errMsg: '回复成功, 推送用户失败: 找不到该用户'
            })
          }
        })
      }
      else {
        return res.json({
          success: true,
          data: reply
        })
      }
    })
    .catch((err) => {
      console.error(err)
      return res.status(500).json({
        success: false
        ,errMsg: err.message
        ,errors: err
      })
    })
  })

  //查询回复
  router.post("/queryReply", function(req, res, next) {
    var param = req.body,
        suggestion_id = param.suggestion_id;

    sequelize.model("KerrySuggestionReply").findAll({
      where: {
        kerry_suggestion_id: suggestion_id
      }
    })
    .then((replies) => {
      return res.json({
        success: true,
        data: replies
      })
    })
    .catch((err) => {
      console.error(err)
      return res.status(500).json({
        success: false
        ,errMsg: err.message
        ,errors: err
      })
    })
  })

  //修改回复
  router.post("/updateReply", function(req, res, next) {
    var param = req.body,
        reply_id = param.reply_id,
        content = param.content
    sequelize.model("KerrySuggestionReply").findOne({
      where: {
        id: reply_id
      }
    })
    .then((reply) => {
      if (!reply) {
        return res.status(404).json({
          success: false,
          errMsg: '找不到该回复!'
        })
      }
      else if (reply.from != 'SYS_USER') {
        return res.status(403).json({
          success: false,
          errMsg: '不能修改用户回复!'
        })
      }
      reply.update({
        content: content
      })
      .then((reply) => {
        return res.json({
          success: true,
          data: reply
        })
      })
      .catch((err) => {
        console.error(err)
        return res.status(500).json({
          success: false
          ,errMsg: err.message
          ,errors: err
        })
      })
    })
    .catch((err) => {
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
