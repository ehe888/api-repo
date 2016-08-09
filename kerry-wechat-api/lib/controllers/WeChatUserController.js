module.exports = function(app, db, options){
var _ = require("lodash"),
   debug = require('debug')('core-api'),
   express = require('express'),
   util = require('util'),
   path = require('path'),
   jwt = require('jsonwebtoken'),
   sequelize = db.sequelize,  //The sequelize instance
   Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
   WechatUsers =  sequelize.model("User"),
   UserUnitBinding =  sequelize.model("UserUnitBinding"),
   models = options.db;

var router = express.Router();


//查询角色
router.post("/queryWechatUsers", function(req, res, next) {
 var param = req.body;
 var unit_desc = param.unit_desc || "",
     offset = param.offset || 0,
     limit = param.limit || 20,
     appId = param.appId;

 var propertyOption = {};
 if (appId && appId.length > 0) {
   propertyOption.appId = appId;
 }

 var unitOption = {};
 if (req.units) {
   unitOption = {
     id: {
       $in: req.units
     }
   }
 }

 if (unit_desc && unit_desc.length > 0) {
   unitOption.unit_desc = {
     $like: '%'+unit_desc+'%'
   }
 }

 UserUnitBinding.findAndCountAll({
   include:[{
     model: sequelize.model("User"),
     as: 'wechat_user'
   },{
     model:sequelize.model("Units"),
     as: 'unit',
     where: unitOption,
     include: [{
       model: sequelize.model("SysUser"),
       as: 'sys_user'
     }, {
       model: sequelize.model("KerryProperty"),
       as: 'property',
       where: propertyOption
     }]
   }],
   offset: offset,
   limit: limit,
   order: ' id desc'
 })
 .then(function(results){
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
   return res.status(500).json({
     success:false,
     errMsg:err.message,
     errors:err
   })
 })
})



//查询角色
router.post("/queryWechatUsersByView", function(req, res, next) {
 var param = req.body;
 var username = param.username || "",
     offset = param.offset || 0,
     limit = param.limit || 20,
     appId = param.appId;

     sequelize.query('select * from vw_user_unit_bind where (wechat_nickname like :username or username like :username or unit_number like :username) and appid=:appid order by id desc  limit :limit offset :offset',
       { replacements: {limit:limit,offset:offset,username:"%"+username+"%",appid:appId}, type: sequelize.QueryTypes.SELECT }
     ).then(function(results){



        sequelize.query('select count(*)  from vw_user_unit_bind where (wechat_nickname like :username or username like :username or unit_number like :username) and appid=:appid',
          { replacements: {username:"%"+username+"%",appid:appId} ,type: sequelize.QueryTypes.SELECT }
        ).then(function(countresults){
          console.log(countresults);


          var count = countresults.count;
          // return res.status(200).json({
          //   success:true
          // })

          return res.json({
            success: true,
            data: results,
            count: count,
            offset: offset,
            limit: limit
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
      .catch(function(err){
          console.error(err);
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

 UserUnitBinding.destroy({
   where:{
     id:id
   }
 })
 .then(function(row){
   return res.json({
     success:true
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

//判断业主是否已经过期, 以及是否绑定
//如果过期, 解除业主/户号绑定, 同时解除所有微信用户绑定
//return hasBinded bool
router.post("/checkExpire", function(req, res, next) {
  var param = req.body,
      wechat_user_id = param.wechat_user_id;

  UserUnitBinding.findAll({
    where: {
      wechat_user_id: wechat_user_id
    }
  })
  .then(function(results) {
    var now = new Date().getTime();
    var units = [];
    for (var i = 0; i < results.length; i++) {
      var userUnit = results[i];
      if (userUnit.unit_id) {
        units.push(userUnit.unit_id);
      }
    }

    if (units.length > 0) {
      console.log("has binded")
      sequelize.model("KerryUserUnit").findAll({
        where: {
          unit_id: {
            $in: units
          }
        },
        include: [{
          model: sequelize.model("KerryUsers"),
          as: 'kerry_user'
        }]
      })
      .then(function(results) {

        if (results.length > 0) {
          checkAndDeleteUserUnit(results, 0, function() {
            return res.json({
              success: true,
              hasBinded: true
            })
          })
        }
        else {
          return res.json({
            success: true,
            hasBinded: true
          })
        }

      })
      .catch(function(err){
        console.error(err)
        return res.status(500).json({
          success:false,
          errMsg:err.message,
          errors:err
        })
      })
    }
    else {
      console.log("not binded")
      return res.json({
        success: true,
        hasBinded: false
      })
    }

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

function checkAndDeleteUserUnit(array, index, callback) {
  if (index >= array.length) {
    return callback();
  }
  var now = new Date().getTime();
  var userUnit = array[index];
  var unit_id = userUnit.unit_id,
      kerry_user = userUnit.kerry_user;

  if (kerry_user) {
    sequelize.model("KerryUsers").findOne({
      where: {
        id: kerry_user.id
      }
    })
    .then(function(user) {
      if (user) {
        var expire_date = user.expire_date;
        console.log("user id is ", user.id)
        if (expire_date) {
          var expire_time = expire_date.getTime();
          if (now > expire_time) {
            //解除绑定
            sequelize.model("KerryUserUnit").destroy({
              where: {
                unit_id: unit_id,
                kerry_user_id: kerry_user.id
              }
            })
            .then(function() {

              sequelize.model("UserUnitBinding").destroy({
                where: {
                  unit_id: unit_id
                }
              })
              .then(function() {
                return checkAndDeleteUserUnit(array, ++index, callback);
              })
              .catch(function(error) {
                console.error("unbind UserUnitBinding error: ", error)
                return checkAndDeleteUserUnit(array, ++index, callback);
              })

            })
            .catch(function(error) {
              console.error("unbind UserUnitBinding error: ", error)
              return checkAndDeleteUserUnit(array, ++index, callback);
            })

          }
          else {
            return checkAndDeleteUserUnit(array, ++index, callback);
          }

        }else {
          return checkAndDeleteUserUnit(array, ++index, callback);
        }
      }
      else {
        return checkAndDeleteUserUnit(array, ++index, callback);
      }
    })
  }
  else {
    return checkAndDeleteUserUnit(array, ++index, callback);
  }


}



app.use("/wechatUsers", router);

}
