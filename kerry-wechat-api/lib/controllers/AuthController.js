/**
 * System User Authentication controller
 */

module.exports = function(app, db, options){
  var _ = require("lodash"),
     debug = require('debug')('kerry-api'),
     express = require('express'),
     util = require('util'),
     path = require('path'),
     jwt = require('jsonwebtoken'),
     sequelize = db.sequelize,  //The sequelize instance
     Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
     SysUser = sequelize.model("SysUser"),
     SysRoleUser = sequelize.model("SysRoleUser");

  var router = express.Router();

  /**
  * PATH: /auth/login
  * System User Logined in with username + password
  */
  router.post("/login", function(req, res, next){
    var config = req.x_app_config;
    var accessTokenSecret = config.accessToken.secret
      ,accessTokenExpiresIn = config.accessToken.expiresIn
      ,accessTokenAlgorithm = config.accessToken.algorithm;

    var username = req.body.username,
        password = req.body.password;

    SysUser.getAuthenticated(username, password, function(err, user){
      if(err){
        console.error("auth error: ", err);
        return res.status(403).json({
                                     success: false
                                     ,errMsg: err.message
                                     ,errors: err
                                    });
      }

      if(!user){
        var err = new Error("invalid_username_and_password")
        return res.status(403).json({
                                     success: false
                                     ,errMsg: '请输入正确的用户名和密码'
                                     ,errors: err
                                    });
      }

      SysRoleUser.getUserRoles(user.username)
        .then(function(roleUsers){
          var roles = [];
          console.log(roleUsers)
          if(!_.isEmpty(roleUsers)){
            for(var i=0; i < roleUsers.length; i++ ){
              roles.push(roleUsers[i].role.name);
            }
          }
          var claims = {
           sub: user.username,
           roles: roles,
           ut: user.userType        //后台管理用户，一律为 admin
          };
          var accessToken = jwt.sign(claims, accessTokenSecret
                         ,{
                             algorithm: accessTokenAlgorithm
                             ,expiresIn: accessTokenExpiresIn
                         });
          return res.json({
            success: true
            ,access_token: accessToken
          });
      })
      .catch(function(err){
        console.error(err);
        return res.status(403).json({
                                     success: false
                                     ,errMsg: err.message
                                     ,errors: err
                                    });
      })
    });
  });

  router.post("/", function(req, res, next) {
    var config = req.x_app_config;
    var decoded = req.identity;
    var name = decoded.sub;
    SysUser.findOne({
      where: {
        username: name
      },
      include: [{
        model: sequelize.model("KerryProperty"),
        as: 'WorkingProperty'
      },{
        model: sequelize.model("Units"),
        as: 'unit'
      }, {
        model: sequelize.model("SysRoleUser"),
        as: 'sys_role_user',
        include: [{
          model: sequelize.model("SysRole"),
          as: 'role',
          include: [{
            model: sequelize.model("SysRoleMenu"),
            as: 'sys_role_menu'
          }]
        }]
      }]
    })
    .then(function(sysuser) {
      if (!sysuser) {
        return res.json({
          success: false,
          errMsg: 'SYS USER NOT FOUND'
        })
      }
      return res.json({
        success: true,
        data: sysuser
      })

    })
    .catch(function(err) {
      console.error(err);
      return res.status(403).json({
                                   success: false
                                   ,errMsg: err.message
                                   ,errors: err
                                  });
    })
  })

  router.post("/changePassword", function(req, res, next) {
    var param = req.body,
        oldPassword = param.oldPassword+"",
        newPassword = param.newPassword+"",
        username = param.username

    SysUser.getAuthenticated(username, oldPassword, function(err, user) {
      if(err){
        console.error("auth error: ", err);
        return res.status(403).json({
                                     success: false
                                     ,errMsg: err.message
                                     ,errors: err
                                    });
      }

      if(!user){
        var err = new Error("invalid_username_and_password")
        return res.status(403).json({
                                     success: false
                                     ,errMsg: '请输入正确的用户名和密码'
                                     ,errors: err
                                    });
      }

      user.update({
        password: newPassword
      })
      .then(function(user) {
        return res.json({
          success: true
        })
      })
      .catch(function(err) {
        return res.status(403).json({
                                     success: false
                                     ,errMsg: err.message
                                     ,errors: err
                                    });
      })
    })

  })

  /**
  * PATH: /auth/logout
  * Remove or Disable previously retrived accessToken
  */
  router.get("/logout", function(req, res, next){
   //TODO: Implement token invalid opertion based on DB
   return res.json({
     success: true,
     msg: "success to void access token"
   });
  });

  app.use("/auth", router);
}
