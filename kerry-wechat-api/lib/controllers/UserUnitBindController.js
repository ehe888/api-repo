module.exports = function(app, db, options){
  var _ = require("lodash"),
     debug = require('debug')('core-api'),
     express = require('express'),
     util = require('util'),
     path = require('path'),
     sequelize = db.sequelize,  //The sequelize instance
     Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
     Units =  sequelize.model("Units"),
     Users = sequelize.model("Users"),
     UserUnit = sequelize.model("UserUnit"),
     UserUnitBinding = sequelize.model("UserUnitBinding")

  var router = express.Router();

  router.post('/bind', function(req, res, next) {

    var param = req.body,
        unit_number = param.unit_number,
        reg_code = param.reg_code,
        name = param.name,
        mobile = param.mobile,
        username = param.username;

    //先查询用户是否存在
    Users.findOne({
      where: {
        name: name,
        reg_code: reg_code,
        mobile: mobile
      }
    })
    .then(function(user) {
      if (!user) {
        return res.status(403).json({
          success: false,
          errMsg: '找不到该用户!'
        })
      }
      else {
        //有用户, 查询unit是否存在
        var user_id = user.id;
        Units.findOne({
          where: {
            unit_number: unit_number
          }
        })
        .then(function(unit) {

          if (!unit) {
            return res.status(403).json({
              success: false,
              errMsg: '找不到该房屋号!'
            })
          }
          else {
            //找得到unit, 查询user_unit是否有对应关系
            var unit_id = unit.id
            UserUnit.findOne({
              where: {
                user_id: user_id,
                unit_id: unit.id
              }
            })
            .then(function(user_unit) {

              if (!user_unit) {
                return res.status(403).json({
                  success: false,
                  errMsg: '该用户和房屋号没有关系!'
                })
              }
              else {
                //条件全部满足, 讲该用户绑定到微信Openid, 插入一条记录到user_property_bind


                UserUnitBinding.create({
                  username: username,
                  user_id: user_id,
                  unit_id: unit_id
                })
                .then(function(bind) {
                  return res.json({
                    success: true
                  })
                })
                .catch(function(err) {
                  console.error(err)
                  return res.status(500).json({
                    success: false
                    ,errMsg: err.message
                    ,errors: err
                  })
                })

              }

            })
            .catch(function(err) {
              console.error(err)
              return res.status(500).json({
                success: false
                ,errMsg: err.message
                ,errors: err
              })
            })
          }
        })
        .catch(function(err) {
          console.error(err)
          return res.status(500).json({
            success: false
            ,errMsg: err.message
            ,errors: err
          })
        })
      }
    })
    .catch(function(err) {
      console.error(err)
      return res.status(500).json({
        success: false
        ,errMsg: err.message
        ,errors: err
      })
    })

  })


  app.use("/bind", router);
}
