module.exports = function(app, db, options){
  var _ = require("lodash"),
     debug = require('debug')('core-api'),
     express = require('express'),
     util = require('util'),
     path = require('path'),
     sequelize = db.sequelize,  //The sequelize instance
     Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
     KerryUsers =  sequelize.model("KerryUsers"),
     Units = sequelize.model("Units"),
     KerryUserUnit = sequelize.model("KerryUserUnit");

  var router = express.Router();

  router.post("/query", function(req, res, next) {
    var param = req.body,
        name = param.name || '',
        offset = param.offset || 0,
        limit = param.limit || 20;

    KerryUserUnit.findAndCountAll({
      offset: offset,
      limit: limit,
      include: [{
        model: sequelize.model("Units"),
        as: 'unit',
        include: [{
          model: sequelize.model("SysUser"),
          as: 'sys_user',
          attributes: ['first_name', 'last_name', 'email']
        },
        {
          model: sequelize.model("KerryProperty"),
          as: 'property',
          attributes:['name'],
          where: {
            appId: param.appId
          }
        }]
      }, {
        model: KerryUsers,
        as: 'kerry_user',
        where: {
          name: {
            $like: '%'+name+'%'
          }
        }
      }]
    })
    .then(function(results) {
      var count = results.count;
      return res.json({
        success: true,
        data: results.rows,
        count: count,
        offset: offset,
        limit: limit
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

    // Users.findAndCountAll({
    //   where: {
    //     name: {
    //       $like: '%'+name+'%'
    //     }
    //   },
    //   offset: offset,
    //   limit: limit,
    //   include: [{
    //     model: sequelize.model("UserUnit"),
    //     as: 'user_unit',
    //     include: [{
    //       model: sequelize.model("Units"),
    //       as: 'unit',
    //       include: [{
    //         model: sequelize.model("SysUser"),
    //         as: 'sys_user',
    //         attributes: ['first_name', 'last_name', 'email']
    //       },
    //       {
    //         model: sequelize.model("KerryProperty"),
    //         as: 'property',
    //         attributes:['name']
    //       }]
    //     }]
    //   }]
    // })
    // .then(function(results) {
    //   var count = results.count;
    //   return res.json({
    //     success: true,
    //     data: results.rows,
    //     count: count,
    //     offset: offset,
    //     limit: limit
    //   })
    // })
    // .catch(function(err) {
    //
    //   console.error(err)
    //   return res.status(500).json({
    //     success: false
    //     ,errMsg: err.message
    //     ,errors: err
    //   })
    // })

  })

  router.post('/update', function(req, res, next) {
    var param = req.body,
        expire_date = param.expire_date || '',
        name = param.name || '',
        reg_code = param.reg_code || '',
        mobile = param.mobile || '',
        unit_id = param.unit_id,
        unit_number = param.unit_number || '',
        id = param.id;
    KerryUserUnit.findOne({
      where: {
        id: id
      },
      include: [{
        model: sequelize.model("Units"),
        as: 'unit',
        include: [{
          model: sequelize.model("SysUser"),
          as: 'sys_user',
          attributes: ['first_name', 'last_name', 'email']
        },
        {
          model: sequelize.model("KerryProperty"),
          as: 'property',
          attributes:['name']
        }]
      }, {
        model: KerryUsers,
        as: 'kerry_user'
      }]
    })
    .then(function(userUnit) {
      if (!userUnit) {
        return res.status(404).json({
          success: false,
          errMsg: '找不到绑定信息!'
        })
      }

      KerryUsers.findOne({
        where: {
          id: userUnit.kerry_user_id
        }
      })
      .then(function(user){

        if (!user) {
          return res.status(404).json({
            success: false,
            errMsg: '用户不存在'
          })
        }else {
          var updateOptioin = {};
          if (expire_date && expire_date.length > 0) {
            updateOptioin.expire_date = expire_date
          }
          if (name && name.length > 0) {
            updateOptioin.name = name
          }
          if (reg_code && reg_code.length > 0) {
            updateOptioin.reg_code = reg_code
          }
          if (mobile && mobile.length > 0) {
            updateOptioin.mobile = mobile
          }

          user.update(updateOptioin)
          .then(function(user) {
            if (unit_number && unit_number.length > 0) {

              Units.findOne({
                where: {
                  unit_number: unit_number
                }
              })
              .then(function(unit) {
                if (unit) {
                  userUnit.update({
                    unit_id: unit.id
                  })
                  .then(function(userUnit) {
                    return res.json({
                      success: true,
                      data: userUnit
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
                }else {
                  return res.json({
                    success: true,
                    data: userUnit
                  })
                }

              })

            }
            else {
              return res.json({
                success: true,
                data: userUnit
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



  })

  router.post('/delete_bind', function(req, res, next) {
    var param = req.body,
        id = param.id;

    KerryUserUnit.findOne({
      where: {
        id: id
      }
    })
    .then(function(userUnit) {
      if (userUnit) {
        var user_id = userUnit.kerry_user_id;
        KerryUserUnit.destroy({
          where: {
            id: id
          }
        })
        .then(function() {
          KerryUsers.destroy({
            where: {
              id: user_id
            }
          })
          .then(function() {
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
      else {
        return res.status(404).json({
          success: false,
          errMsg: '未绑定!'
        })
      }
    })
  })

  router.post("/create", function(req, res, next) {
    var param = req.body,
        name = param.name,
        mobile = param.mobile,
        reg_code = param.reg_code,
        expire_date = param.expire_date,
        unit_number = param.unit_number;

    Units.findOne({
      where: {
        unit_number: unit_number
      }
    })
    .then(function(unit) {
      if (!unit) {
        return res.json({
          success: false,
          errMsg: '找不到改户号!'
        })
      }

      var unit_id = unit.id;
      KerryUsers.findOne({
        where: {
          mobile: mobile,
          reg_code: reg_code
        }
      })
      .then(function(user) {

        if (user) {
          return res.json({
            success: false,
            errMsg: '已经创建过改用户!'
          })
        }

        KerryUsers.create({
          name: name,
          mobile: mobile,
          reg_code: reg_code,
          is_master: true,
          expire_date: expire_date
        })
        .then(function(user) {

          KerryUserUnit.create({
            unit_id: unit_id,
            kerry_user_id: user.id
          })
          .then(function(userUnit) {
            return res.json({
              success: true,
              data: userUnit
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



  app.use("/user_settings", router);
}
