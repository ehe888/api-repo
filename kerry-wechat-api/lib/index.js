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

  app.use("/", function(req, res, next) {
    var sys_user_name = req.identity.sub,
        ut = req.identity.ut,
        roles = req.identity.roles;
    if (ut == 'CORP') {
      return next();
    }
    if (_.indexOf(roles, '小区物业') > 0) {
      return next();
    }
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
      console.log(units)
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

  })

  app.use( path || "/api", subapp);

  return subapp
}
