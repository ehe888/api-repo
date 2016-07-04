/**
 * System User Permissions Controller
 * 获取当前系统的所有可访问权限
 */

module.exports = function(app, db, options){
  var _ = require("lodash"),
     debug = require('debug')('kerry-api'),
     express = require('express'),
     util = require('util'),
     path = require('path'),
     sequelize = db.sequelize,  //The sequelize instance
     Sequelize = db.Sequelize;  //The Sequelize Class via require("sequelize")

  const _permissions = require("../permissions")

  var router = express.Router();



  /**
  * 返回系统的全部权限列表
  */
  router.get("/", function(req, res, next){
    return res.json(_permissions);
  });


  app.use("/permissions", router);
}
