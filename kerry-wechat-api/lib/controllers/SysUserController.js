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
     SysUser =  sequelize.model("SysUser"),
     SysRoleUser = sequelize.model("SysRoleUser"),
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
  *创建系统用户
  */



  function updateUnits(list, index, callback) {
    if (index >= list.length) {
      return callback()
    }

    var data = list[index]
    models.units.update(data)
    .then(function() {
      updateUnits(list, ++index, callback)
    })
    .catch(function() {
      updateUnits(list, ++index, callback)
    })
  }

  router.post("/create", function(req, res, next){
    var param = req.body;
    var id;

    if(param.userType == 'CORP' ){
      param.userType = SysUser.userTypes.CORP;
    }
    else{
      param.userType = SysUser.userTypes.PROPERTY;
    }

    SysUser.create({
      username:param.username,
      password:param.password,
      email:param.email,
      mobile:param.mobile,
      headimage:param.headimage,
      firstName:param.firstName,
      lastName:param.lastName,
      userType:param.userType,
      working_property_id: param.working_property_id
    })
    .then(function(sysUser){
      id = sysUser.id;
      if(param.SysRoleUsers){
        param.SysRoleUsers.forEach(function(data){
          data.username = sysUser.username;
        })
      }

      SysRoleUser.bulkCreate(param.SysRoleUsers)
      .then(function(){
        updateUnits(param.unit, 0, function(){
          return res.json({
            success:true,
            data:sysUser
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
  });

  //更新后台用户
  router.post("/update", function(req, res, next) {
    var param = req.body;

    SysUser.findOne({
      where:{
        id: param.id
      }
    })
    .then(function(sysUser){
      sysUser.update({
        email:param.email,
        mobile:param.mobile,
        headimage:param.headimage,
        firstName:param.firstName,
        lastName:param.lastName,
      })
      .then(function(sysUser){
        SysRoleUser.findAll({
          where:{
            username:sysUser.username
          }
        })
        .then(function(sysRoleUsers){
          if(sysRoleUsers){
            sysRoleUsers.forEach(function(data){
                 _.remove(param.sysRoleUsers,function(paramData){
                      console.log(data.role_id+'  '+ paramData.role_id);
                return data.role_id == paramData.role_id
              })
            })
          }

          if(param.sysRoleUsers){
            param.sysRoleUsers.forEach(function(data){
              data.username = sysUser.username;
            })
          }

          SysRoleUser.bulkCreate(param.sysRoleUsers)
          .then(function(){
            updateUnits(param.unit, 0, function(){
              return res.json({
                success:true,
                data:sysUser
              })
            })
          })
          .catch(function(err){
            return res.status(500).json({
              success:true,
              errMsg:err.message,
              errors:err
            })
          })
        })
        .catch(function(err){
          return res.status(500).json({
            success:true,
            errMsg:err.message,
            errors:err
          })
        })
      })
      .catch(function(err){
        return res.status(500).json({
          success:true,
          errMsg:err.message,
          errors:err
        })
      })
    })
    .catch(function(err){
      return res.status(500).json({
        success:false,
        errMsg:err.message,
        errors:err
      })
    })
  })


  //查询后台用户
  router.post("/querySysUsers", function(req, res, next) {
    var param = req.body;
    var username = param.username || "",
        offset = param.offset || 0,
        limit = param.limit || 20;

    SysUser.findAll({
      where :{
        username:{
          $like:"%"+username+"%"
        }
      },
      include:[{
        model: sequelize.model("KerryProperty"),
        as: 'WorkingProperty',
        where:{
          appId:param.appId
        }
      }],
      offset: offset,
      limit: limit,
      order: ' id desc'
    })
    .then(function(results){
      console.log(results);
      var count = results.count;
      return res.json({
        success: true,
        data: results.rows,
        count: count,
        offset: offset,
        limit: limit
      })
    })
    .catch(function(err){
      console.log(err);
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

    SysUser.destroy({
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


  app.use("/sysusers", router);
}
