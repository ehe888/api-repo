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
 var username = param.username || "",
     offset = param.offset || 0,
     limit = param.limit || 20,
     appId = param.appId;

 var propertyOption = {};
 if (appId && appId.length > 0) {
   propertyOption.appId = appId;
 }

 UserUnitBinding.findAndCountAll({
   where :
   {
       username: {
         $like: "%"+username+"%"
       }
   },
   include:[{
     model: sequelize.model("User"),
     as: 'wechat_user'
   },{
     model:sequelize.model("Units"),
     as: 'unit',
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

console.log("11111");
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


app.use("/wechatUsers", router);

}
