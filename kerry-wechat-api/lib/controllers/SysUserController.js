/**
 * System User Authentication controller
 */

module.exports = function(app, db, options){
  var _ = require("lodash"),
     debug = require('debug')('core-api'),
     express = require('express'),
     util = require('util'),
     path = require('path'),
     jwt = require('jsonwebtoken'),
     models = options.db;

  var router = express.Router();


  /**
   * Grant roles to user
   */
  router.post("/:username/grant", function(req, res, next){

  })

  /**
   * Revoke roles from user
   */
  router.post("/:username/revoke", function(req, res, next){

  })



  /**
   * GET user profile - Only SUPER_USER should be allowed to do this
   */
  router.get("/:username", function(req, res, next){
    return res.json({
     success: true
     ,data: {
       username: "su9527",
       headimage: "http://www.xxx.xxx/a.jpg",
       roles: ['SUPER_USER']
     }
    });
  })

  /**
  * 查询系统用户 - Only SUPER_USER should be allowed to do this
  * PATH: /sysusers
  * return system roles
  * TODO：filter and pagination
  */
  router.get("/", function(req, res, next){
    return res.json({
     success: true
     ,data: [{
       username: "su9527",
       roles: ['SUPER_USER']
     }]
    });
  });


  /**
  *查询系统用户
  */
  router.post("/create", function(req, res, next){
    var param = req.body;
    

    SysUser.create({
      username:param.username,
      password:param.password,
      email:param.email,
      mobile:param.mobile,
      headimage:param.headimage,
      firstName:param.firstName,
      lastName:param.lastName,
      userType:param.userType
    })
    .then(function(sysUser){

    })
    .catch(function(err){

    })
  });


  app.use("/sysusers", router);
}
