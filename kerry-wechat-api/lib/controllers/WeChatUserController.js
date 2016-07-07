module.exports = function(app, db, options){
var _ = require("lodash"),
   debug = require('debug')('core-api'),
   express = require('express'),
   util = require('util'),
   path = require('path'),
   jwt = require('jsonwebtoken'),
   sequelize = db.sequelize,  //The sequelize instance
   Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
   WechatUsers =  sequelize.model("WechatUsers"),
   UserUnitBinding =  sequelize.model("UserUnitBinding"),
   models = options.db;

var router = express.Router();


//查询角色
router.post("/queryWechatUsers", function(req, res, next) {
 var param = req.body;
 var username = param.username;

 UserUnitBinding.findAll({
   where :{
     username:{
       $like:"%"+username+"%"
     }
   },
   include:[{
     model: sequelize.model("WechatUsers"),
     as: 'wechat_user'
   },{
     model:sequelize.model("Units"),
     as: 'unit'
   }]
 })
 .then(function(UserUnitBindings){
   return res.json({
     success:true,
     data:UserUnitBindings
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

 UserUnitBinding.findOne({
   where:{
     id:id
   }
 })
 .then(function(userUnitBinding){
   console.log(userUnitBinding)

   WechatUsers.destroy({
     where:{
       username:userUnitBinding.wechat_user_id
     }
   })
   .then(function(rows){
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
   .catch(function(err){
     return res.status(500).json({
       success:false,
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


app.use("/wechatUsers", router);

}
