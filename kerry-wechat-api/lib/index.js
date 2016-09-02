"use strict"
/**
 * 传入参数:
 * 	app - express app，需要从 app.config 获得配置参数
 * 	db - db 为 sequelize对象的容器, global全局的数据库访问入口
 * 	path - 绑定的路径
 * 	options - 其它配置参数，
 */

module.exports = function(app, path, db, options){
  var express = require("express");
  var subapp = express();
  var _ = require("lodash")

  var sequelize = db.sequelize,  //The sequelize instance
      Sequelize = db.Sequelize;

  require("../models")(db); //Merge localDB with global DB

  require("./controllers/SysController")(subapp, db, options);
  require("./controllers/AuthController")(subapp, db, options);
  require("./controllers/RoleController")(subapp, db, options);
  require("./controllers/KerryPropertyController")(subapp, db, options);
  require("./controllers/UserManagerController")(subapp, db, options);
  require("./controllers/SysUserController")(subapp, db, options);
  require("./controllers/UnitController")(subapp, db, options)
  require("./controllers/UserUnitBindController")(subapp, db, options)
  require("./controllers/SysPermissionController")(subapp, db, options)
  require("./controllers/DeliveryController")(subapp, db, options)
  require("./controllers/WeChatUserController")(subapp, db, options)
  require("./controllers/WeChatAssetController")(subapp, db, options)
  require("./controllers/PropertyBillController")(subapp, db, options)
  require("./controllers/PropertyBillLineController")(subapp, db, options)
  require("./controllers/KerrySuggestionController")(subapp, db, options)
  require("./controllers/BillboardController")(subapp, db, options)
  require("./controllers/PushMessageController")(subapp, db, options)
  require("./controllers/SysRoleMenuController")(subapp, db, options)
  require("./controllers/WechatPayController")(subapp, db, options)
  require("./controllers/WechatNewsController")(subapp, db, options)
  require("./controllers/BillManagerController")(subapp, db, options)
  require("./controllers/SysUserUnitController")(subapp, db, options)
  require("./controllers/KerryWorkOrderController")(subapp, db, options)
  require("./controllers/KerryPropertyCalendarController")(subapp, db, options)


  //当角色为物业管家时, 需要过滤查询用的unit
  app.use("/", function(req, res, next) {

    try {

      if (!req.identity) {
        return next();
      }
      var sys_user_name = req.identity.sub,
          ut = req.identity.ut,
          roles = req.identity.roles;

      if (ut != 'PROPERTY') {
        return next();
      }

      if (_.indexOf(roles, '物业管家') >= 0) {
        sequelize.model("SysUser").findOne({
          where: {
            username: sys_user_name
          },
          include: [{
            model: sequelize.model("Units"),
            as: 'unit'
          }]
        })
        .then(function(sysUser) {
          if (!sysUser) {
            return res.status(403).json({
              success: false,
              errMsg: 'forbidden'
            })
          }

          if (sysUser.userType == 'CORP') {
            return next();
          }
          var units = []
          if (sysUser.unit && sysUser.unit.length > 0) {
            for (var i = 0; i < sysUser.unit.length; i++) {
              var unit = sysUser.unit[i];
              units.push(unit.id)
            }
          }
          req.units = units;
          return next();

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
        return next();
      }



    } catch (e) {
      console.error(e)
      return res.status(500).json({
        success: false
        ,errMsg: err.message
        ,errors: err
      })
    } finally {

    }

  })

  app.use( path || "/api", subapp);

  return subapp
}
