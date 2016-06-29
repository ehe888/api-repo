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
     sequelize = db.sequelize,  //The sequelize instance
     Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
     SysRole =  sequelize.model("SysRole"),
     models = options.db;

  var router = express.Router();



  /**
  * PATH: /roles
  * return system roles
  */
  router.get("/", function(req, res, next){
    return res.json({
     success: true
     ,data: [{
       name: "SUPER_USER",
       permission: [{
         method: "*",
         path: "*"
       }]
     }]
    });
  });

  //创建后台角色
  router.post("/create", function(req, res, next) {
    var param = req.body;
    var name = param.name;

    SysRole.create({
      name: name
    })
    .then(function(sysRole) {
      return res.json({
        success: true,
        sysRole: sysRole
      });
    })
    .catch(function(err) {
      return res.status(500).json({
        success: false
        ,errMsg: err.message
        ,errors: err
      })
    })

  })

  //更新后台角色
  router.post("/update", function(req, res, next) {
    var param = req.body;
    var name = param.name;
    var id = param.id;

    SysRole.findOne({
      where:{
         id : id
       }
    })
    .then(function(sysRole){
      sysRole.update({
        name:name
      })
      .then(function(sysRole){
        return res.json({
          success:true,
          sysRole:sysRole
        });
      })
      .catch(function(err){
        return res.status(500).json({
          success:false,
          errMsg:err.message,
          errors:err
        })
      })
    })
    .catch(function(err) {
      return res.status(500).json({
        success: false
        ,errMsg: err.message
        ,errors: err
      })
    })
  })

 //查询角色
 router.post("/queryRoles", function(req, res, next) {
   var param = req.body;
   var name = param.name;

   SysRole.findAll({
     where :{
       name:{
         $like:"%"+name+"%"
       }
     }
   })
   .then(function(sysRoles){
     return res.json({
       success:true,
       data:sysRoles
     });
   })
   .catch(function(err){
     return res.status(500).json({
       success:false,
       errMsg:err.message,
       errors:err
     })
   })
 })

 //删除角色
 router.get("/delete", function(req, res, next) {
   var param = req.query;
   var id = param.id;
   
   SysRole.destroy({
     where:{
       id:id
     }
   })
   .then(function(rows){
     return res.json({
       success:true,
       rows:rows
     });
   })
   .catch(function(err){
     return res.status(500).json({
       success:false,
       errMsg:err.message,
       errors:err
     })
   })
 })


  app.use("/roles", router);
}
