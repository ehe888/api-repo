module.exports = function(app, db, options){
  var _ = require("lodash"),
     debug = require('debug')('core-api'),
     express = require('express'),
     util = require('util'),
     path = require('path'),
     sequelize = db.sequelize,  //The sequelize instance
     Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
     Units =  sequelize.model("Units"),
     Users = sequelize.model("User"),
     KerryUsers = sequelize.model("KerryUsers"),
     KerryUserUnit = sequelize.model("KerryUserUnit"),
     KerryProperty = sequelize.model("KerryProperty"),
     UserUnitBinding = sequelize.model("UserUnitBinding")

  var router = express.Router();

  router.post('/bind', function(req, res, next) {

    var param = req.body,
        unit_number = param.unit_number,
        reg_code = param.reg_code,
        username = param.username,
        mobile = param.mobile,
        appId = param.appId,
        wechat_user_id = param.wechat_user_id;

    KerryProperty.findOne({
      where:{
        app_id:appId
      }
    })
    .then(function(property){
      if(property){
        Units.findOne({   //根据单元号查询单元对象
          where:{
            unit_number:unit_number,
            property_id: property.id
          }
        })
        .then(function(unit){
          if(unit){
            KerryUsers.findOne({  //根据注册码查询业主数据
              where:{
                reg_code:reg_code,
                mobile: mobile
              }
            })
            .then(function(kerryUser){
              if(kerryUser){
                KerryUserUnit.findOne({ //根据单元ID以及业主ID 查询是否已经绑定两者
                  where:{
                    kerry_user_id:kerryUser.id,
                    unit_id:unit.id
                  }
                })
                .then(function(kerryUserUnit){
                  if(kerryUserUnit){
                    Users.findOne({ //根据微信用户username查询信息 判断该微信用户是否已经授权登陆
                      username:wechat_user_id
                    })
                    .then(function(user){
                      var is_master = kerryUser.name == username?true:false;
                      if(user){
                        UserUnitBinding.create({  //创建微信与单元绑定关系
                          username:username,
                          mobile:mobile,
                          wechat_user_id:wechat_user_id,
                          unit_id:unit.id,
                          master_username:kerryUser.name,
                          expire_date:kerryUser.expire_date,
                          is_master:is_master
                        })
                        .then(function(UserUnitBinding){
                          return res.json({
                            success:true
                          })
                        })
                        .catch(function(err){
                          return res.status(500).json({
                            success: false
                            ,errMsg: err.message
                            ,errors: err
                          })
                        })
                      }
                      else{
                        return res.json({
                          success:false,
                          errMsg:'该微信号未登陆！'
                        })
                      }
                    })
                    .catch(function(err){
                      throw err;
                      return res.status(500).json({
                        success: false
                        ,errMsg: err.message
                        ,errors: err
                      })
                    })
                  }
                  else{
                    return res.json({
                      success:false,
                      errMsg:'该注册码不存在！'
                    })
                  }
                })
                .catch(function(err){
                  throw err;
                  return res.status(500).json({
                    success: false
                    ,errMsg: err.message
                    ,errors: err
                  })
                })
              }
              else{
                return res.json({
                  success:false,
                  errMsg:'该注册码与房屋没有绑定！'
                })
              }
            })
            .catch(function(err){
              throw err;
              return res.status(500).json({
                success: false
                ,errMsg: err.message
                ,errors: err
              })
            })
          }
          else{
            return res.json({
              success:false,
              errMsg:'该单元号不存在！'
            })
          }
        })
        .catch(function(err){
          throw err;
          return res.status(500).json({
            success: false
            ,errMsg: err.message
            ,errors: err
          })
        })
      }
      else{
        return res.json({
          success:false,
          errMsg:'该物业小区不存在！'
        })
      }
    })
    .catch(function(err){
      return res.status(500).json({
        success: false
        ,errMsg: err.message
        ,errors: err
      })
    })
  })


  //查询已经绑定的数据
  router.post("/queryUserUnitBind", function(req, res, next) {
   var param = req.body;
   var wechat_user_id = param.wechat_user_id;

   UserUnitBinding.findAll({
     where:{
       wechat_user_id:wechat_user_id
     },
     include: [{
       model: Units,
       as: 'unit'
     }]
   })
   .then(function(userUnitBindings){
     return res.json({
       success:true,
       data:userUnitBindings
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


  app.use("/bind", router);
}
