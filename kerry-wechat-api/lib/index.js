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
  
  app.use( path || "/api", subapp);

  return subapp
}
