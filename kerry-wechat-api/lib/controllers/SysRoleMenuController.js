

module.exports = function(app, db, options){
  var _ = require("lodash"),
     debug = require('debug')('kerry-api'),
     express = require('express'),
     util = require('util'),
     path = require('path'),
     sequelize = db.sequelize,  //The sequelize instance
     Sequelize = db.Sequelize;  //The Sequelize Class via require("sequelize")
     SysRoleMenu = sequelize.model("SysRoleMenu")

  const _menu = require("../menu")

  var router = express.Router();



  /**
  * 返回系统的全部菜单
  */
  router.get("/", function(req, res, next){
    return res.json(_menu);
  });

  router.post("/addMenu", function(req, res, next) {
    var param = req.body,
        name = param.name,
        icon = param.icon,
        link = param.link,
        role_id = param.role_id;

    SysRoleMenu.create({
      name: name,
      icon: icon,
      link: link,
      role_id: role_id
    })
    .then(function(sysRoleMenu) {
      return res.json({
        success: true,
        data: sysRoleMenu
      })
    })
    .catch(function(err){
      console.error(err)
      return res.status(500).json({
        success:false,
        errMsg:err.message,
        errors:err
      })
    })
  })

  router.post("/deleteMenu", function(req, res, next) {
    var param = req.body,
        id = param.id;

    SysRoleMenu.findOne({
      where: {
        id: id
      }
    })
    .then(function(sysRoleMenu) {
      if (!sysRoleMenu) {
        return res.json({
          success: false,
          errMsg: '找不到该角色菜单绑定'
        })
      }
      sysRoleMenu.update({
        name: sysRoleMenu.name+"__"+(new Date()).getTime()
      })
      .then(function(sysRoleMenu) {
        SysRoleMenu.destroy({
          where: {
            id: sysRoleMenu.id
          }
        })
        .then(function() {
          return res.json({
            success: true
          })
        })
        .catch(function(err){
          console.error(err)
          return res.status(500).json({
            success:false,
            errMsg:err.message,
            errors:err
          })
        })
      })
      .catch(function(err){
        console.error(err)
        return res.status(500).json({
          success:false,
          errMsg:err.message,
          errors:err
        })
      })

    })
    .catch(function(err){
      console.error(err)
      return res.status(500).json({
        success:false,
        errMsg:err.message,
        errors:err
      })
    })

  })

  router.post("/queryByRole", function(req, res, next) {
    var param = req.body,
        role_id = param.role_id;
    SysRoleMenu.findAll({
      where: {
        role_id: role_id
      }
    })
    .then(function(sysRoleMenu) {
      return res.json({
        success: true,
        data: sysRoleMenu
      })
    })
    .catch(function(err){
      console.error(err)
      return res.status(500).json({
        success:false,
        errMsg:err.message,
        errors:err
      })
    })
  })

  router.post("/queryBySysUser", function(req, res, next) {
    
  })

  app.use("/sysRoleMenu", router);
}
