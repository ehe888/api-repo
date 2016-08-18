module.exports = function(app, db, options){
  var _ = require("lodash"),
     debug = require('debug')('core-api'),
     express = require('express'),
     util = require('util'),
     path = require('path'),
     sequelize = db.sequelize,  //The sequelize instance
     Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
     Units =  sequelize.model("Units"),
     SysUser = sequelize.model("SysUser")

  var router = express.Router();

  router.post("/querySysUser", function(req, res, next) {
    var param = req.body,
        appId = param.appId

    SysUser.findAll({
      attributes: ["id", "username", "firstName", "lastName"],
      include: [{
        model: sequelize.model("KerryProperty"),
        as: "WorkingProperty",
        attributes: ["appId"],
        where: {
          appId: appId
        }
      }, {
        model: sequelize.model("SysRoleUser"),
        as: "sys_role_user",
        attributes: ["role_id"],
        include: [{
          model: sequelize.model("SysRole"),
          as: "role",
          attributes: ["name"],
          where: {
            name: "物业管家"
          }
        }]
      }, {
        model: Units,
        as: "unit",
        attributes: ["unit_number", "unit_desc", "id"]
      }]
    })
    .then(function(sysUsers) {
      return res.json({
        success: true,
        data: sysUsers
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

  router.post("/bind", function(req, res, next) {
    var param = req.body,
        unit_ids = param.unit_ids,
        sys_user_id = param.sys_user_id;
    Units.update({
      sys_user_id: sys_user_id
    }, {
      where: {
        id: {
          $in: unit_ids
        }
      }
    })
    .then(function() {

      return Units.update({
        sys_user_id: null
      }, {
        where: {
          id: {
            $notIn: unit_ids
          },
          sys_user_id: sys_user_id
        }
      })
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

  app.use("/sysUserUnit", router);
}
