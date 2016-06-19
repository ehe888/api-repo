"use strict"
/**
 * 传入参数:
 * 	bindingPath - 绑定的路径
 * 	app - express app，需要从 app.config 获得配置参数
 * 	options - 其它配置参数，主要是需要 options.db 为 sequelize对象
 */

module.exports = function(options){
  var express = require("express");
  var app = express();
  var db = require("../models")(options.db);

  require("./controllers/AuthController")(app, {
    db: db
  });

  return app;
}
