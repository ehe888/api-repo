/**
 * System User Authentication controller
 */

module.exports = function(app, db, options){
  var _ = require("lodash"),
     debug = require('debug')('kerry-api'),
     express = require('express'),
     util = require('util'),
     path = require('path'),
     sequelize = db.sequelize,  //The sequelize instance
     Sequelize = db.Sequelize;  //The Sequelize Class via require("sequelize")

  var router = express.Router();

  /**
  * PATH: /system/init - 初始化系统，当系统新安装时，通过特定参数初始化系统
  * 	1. 创建一个 ALL PERMISSION 的超级用户权限
  * 	2. 创建一个 超级用户 的角色
  * 	3. 创建一个超级用户 su
  */
  router.post("/init", function(req, res, next){

    var SysRole = db.SysRole,
        SysRolePermission = db.SysRolePermission,
        SysUser = db.SysUser;


    /**
     * 初始账号和密码，用户一旦完成初始化，需要马上登陆系统修改密码
     */
    var username = "su",
        password = "Abc123456";

    SysUser.create({
      username: username,
      password: password,
      email: "eric.leihe@gmail.com",
      userType: SysUser.userTypes.CORP,
      activated: true
    })
    .then(function(user){
      SysRole.create({
        name: "超级用户"
      })
      .then(function(role){
        return role.createPermission({
          name: "ALL",
          httpMethod: "*",  //Special Case, ONLY SU can have * defined
          httpPath: "*"
        })
        .then(function(instance){
          role.grantToUser(username);
        })
        .then(function(userRole){
          return res.json({
           success: true
           ,data: {
             username: username,
             password: password
           }
          });
        })
        .catch(function(err){
          throw err;
        })
      })
      .catch(function(err){
        throw err;
      })
    })
    .catch(function(err){
      console.error(err);
      return res.status(500).json({
       success: false
       ,errMsg: err.message
       ,errors: err
      });
    })
  });


  app.use("/system", router);
}
