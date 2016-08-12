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
     SysRole = sequelize.model("SysRole"),
     SysRoleUser = sequelize.model("SysRoleUser"),
     Units = sequelize.model("Units"),
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
      if(param.sys_role_user && param.sys_role_user.length > 0){
        param.sys_role_user.forEach(function(data){
          data.username = sysUser.username;
          data.sys_user_id = sysUser.id;

        })
      }
      else {
        return res.json({
          success: true,
          data: sysUser
        })
      }

      SysRoleUser.bulkCreate(param.sys_role_user)
      .then(function(){
        return res.json({
          success:true,
          data:sysUser
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


  //更新用户基本信息
  router.post("/update", function(req, res, next) {
    var param = req.body;

    SysUser.findOne({
      where:{
        id: param.id
      }
    })
    .then(function(sysUser){
      var updateOption = {};
      if (param.email) {
        updateOption.email = param.email
      }
      if (param.mobile) {
        updateOption.mobile = param.mobile
      }
      if (param.headimage) {
        updateOption.headimage = param.headimage
      }
      if (param.firstName) {
        updateOption.firstName = param.firstName
      }
      if (param.lastName) {
        updateOption.lastName = param.lastName
      }
      if (param.working_property_id) {
        updateOption.working_property_id = param.working_property_id
      }
      sysUser.update(updateOption)
      .then(function(sysUser){

        return res.json({
          success: true,
          data: sysUser
        })

      })
      .catch(function(err){
        console.error(err)
        return res.status(500).json({
          success:true,
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


  //更新用户户号
  router.post("/updateUnits", function(req, res, next) {
    var param = req.body,
        unit_id = param.unit_id,
        sys_user_id = param.sys_user_id;
    SysUser.findOne({
      where: {
        id: sys_user_id
      }
    })
    .then(function(sysUser) {
      if (!sysUser) {
        return res.json({
          success: false,
          errMsg: '找不到用户!'
        })
      }
      else {
        sequelize.model("Units").findOne({
          where: {
            id: unit_id
          }
        })
        .then(function(unit) {
          if (!unit) {
            return res.json({
              success: false,
              errMsg: '找不到该户号'
            })
          }
          else {
            console.log(unit.sys_user_id)
            if (unit.sys_user_id != null && unit.sys_user_id != '') {
              return res.json({
                success: false,
                errMsg: '该户号已经被绑定了!'
              })
            }
            unit.update({
              sys_user_id: sys_user_id
            })
            .then(function(unit) {

              return res.json({
                success: true,
                data: unit
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
          }
        })
        .catch(function(err){
          console.log(err);
          return res.status(500).json({
            success:false,
            errMsg:err.message,
            errors:err
          })
        })
      }

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

  //更新用户角色
  router.post("/updateRoles", function(req, res, next) {
    var param = req.body,
        sys_user_id = param.sys_user_id,
        role_id = param.role_id;

    SysUser.findOne({
      where: {
        id: sys_user_id
      }
    })
    .then(function(sysUser) {

      SysRoleUser.findOne({
        where: {
          sys_user_id: sys_user_id,
          role_id: role_id
        }
      })
      .then(function(roleUser) {
        if (roleUser) {
          return res.json({
            success: true,
            data: roleUser
          })
        }
        else {
          SysRoleUser.create({
            username: sysUser.username,
            sys_user_id: sys_user_id,
            role_id: role_id
          })
          .then(function(roleUser) {
            return res.json({
              success: true,
              data: roleUser
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
        }

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
    .catch(function(err){
      console.log(err);
      return res.status(500).json({
        success:false,
        errMsg:err.message,
        errors:err
      })
    })


  })

  //删除用户角色
  router.post("/deleteRoles", function(req, res, next) {
    var param = req.body,
        sys_user_id = param.sys_user_id,
        role_id = param.role_id;
    SysRoleUser.findOne({
      where: {
        sys_user_id: sys_user_id,
        role_id: role_id
      }
    })
    .then(function(roleUser) {
      if (!roleUser) {
        return res.json({
          success: false,
          errMsg: '找不到角色!'
        })
      }
      else {
        sequelize.query("DELETE FROM sys_role_users WHERE id = ?", {replacements: [roleUser.id]})
        .then(function() {
          return res.json({
            success: true
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
      }
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

  //删除用户绑定户号
  router.post("/deleteUnit", function(req, res, next) {
    var param = req.body,
        sys_user_id = param.sys_user_id,
        unit_id = param.unit_id;
    Units.findOne({
      where: {
        id: unit_id,
        sys_user_id: sys_user_id
      }
    })
    .then(function(unit) {
      if (!unit) {
        return res.json({
          success: false,
          errMsg: '用户未与该户号绑定'
        })
      }

      unit.update({
        sys_user_id: null
      })
      .then(function(unit) {
        return res.json({
          success: true,
          data: unit
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
    .catch(function(err){
      console.log(err);
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

    SysUser.findAndCountAll({
      where :{
        username:{
          $like:"%"+username+"%"
        }
      },
      include:[{
        model: sequelize.model("KerryProperty"),
        as: 'WorkingProperty'
      }],
      offset: offset,
      limit: limit,
      order: 'id desc'
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

  router.post("/query", function(req, res, next) {
    var param = req.body;
    var username = param.username || "",
        userType = param.userType,
        property = param.property || "",
        offset = param.offset || 0,
        limit = param.limit || 20;

    var propertyOption = {
      model: sequelize.model("KerryProperty"),
      as: 'WorkingProperty'
    }

    if (property && property.length > 0) {
      if (userType == 'PROPERTY') {
        propertyOption.where = {
          name: property
        }
      }
    }
    debug(propertyOption)
    SysUser.findAll({
      where: {
        username: {
          $like: "%"+username+"%"
        },
        userType: userType
      },
      include: [{
        model: SysRoleUser,
        as: 'sys_role_user',
        include: [{
          model: SysRole,
          as: 'role'
        }]
      }, propertyOption],
      offset: offset,
      limit: limit,
      order: 'id desc'
    })
    .then(function(results) {
      debug("count")
      SysUser.count({
        where: {
          username: {
            $like: "%"+username+"%"
          },
          userType: userType
        },
        include: [propertyOption]

      })
      .then(function(count) {

        return res.json({
          success: true,
          data: results,
          count: count,
          offset: offset,
          limit: limit
        })

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
  router.post("/delete", function(req, res, next) {
    var param = req.body;
    var id = param.id;

    SysRoleUser.destroy({
      where: {
        sys_user_id: id
      }
    })
    .then(function() {

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
        console.error(err)
        return res.status(500).json({
          success:false,
          errMsg:err.message,
          errors:err
        })
      })

    })
    .catch(function(err){
      console.error(err);
      return res.status(500).json({
        success:false,
        errMsg:err.message,
        errors:err
      })
    })
  })

  //启用, 关闭用户
  router.post("/active", function(req, res, next) {
    var param = req.body,
        sys_user_id = param.sys_user_id,
        active = param.active;

    SysUser.update({
      active: active
    }, {
      where: {
        id: sys_user_id
      }
    })
    .then(function(sysUser) {
      return res.json({
        success: true,
        data: sysUser
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

  //查询该物业下所有系统用户
  router.post("/querySysUsersByProperty", function(req, res, next) {
    var param = req.body;
    var appId = param.appId;

    SysUser.findAll({
      include:[{
        model: sequelize.model("KerryProperty"),
        as: 'WorkingProperty',
        where: {
          appId: appId
        }
      }],
      order: 'id desc'
    })
    .then(function(results){
      console.log(results);
      return res.json({
        success: true,
        data: results
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

  router.post("/changePassword", function(req, res, next) {
    var param = req.body,
        password = param.password,
        sys_user_id = param.sys_user_id;

    SysUser.findOne({
      where: {
        id: sys_user_id
      }
    })
    .then(function(sysUser) {
      if (!sysUser) {
        return res.json({
          success: false,
          errMsg: '找不到账号'
        })
      }

      sysUser.update({
        password: password
      })
      .then(function(sysUser) {
        return res.json({
          success: true,
          data: sysUser
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
    .catch(function(err){
      console.log(err);
      return res.status(500).json({
        success:false,
        errMsg:err.message,
        errors:err
      })
    })


  })

  app.use("/sysusers", router);
}
