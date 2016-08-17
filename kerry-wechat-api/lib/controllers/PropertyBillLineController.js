/**
 * System User Authentication controller
 */
module.exports = function(app, db, options){
  var _ = require("lodash"),
     debug = require('debug')('core-api'),
     express = require('express'),
     util = require('util'),
     path = require('path'),
     sequelize = db.sequelize,  //The sequelize instance
     Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
     PropertyBill =  sequelize.model("PropertyBill"),
     PropertyBillLine = sequelize.model("PropertyBillLine"),
     models = options.db;

  var router = express.Router();


  //创建账单行
  router.post("/create", function(req, res, next) {
    var param = req.body;
    var id;
    PropertyBillLine.create({
      description:param.description,
      taxable_amount:param.taxable_amount,
      tax:param.tax,
      property_bill_id:param.property_bill_id,
      gross_amount:param.gross_amount,
      expire_date:param.expire_date
    })
    .then(function(line){
      return res.json({
        success:true,
        data:line
      })
    })
    .catch(function(err){
      console.log(err)
      return res.status(500).json({
        success: false,
        errMsg: err.message,
        errors: err
      })
    })
  })

  //修改账单行
  router.post("/update", function(req, res, next) {
    var param = req.body;

    PropertyBillLine.findOne({
      where: {
        id: param.id
      }
    })
    .then(function(line) {
      line.update({
        description:param.description,
        taxable_amount:param.taxable_amount,
        tax:param.tax,
        gross_amount:param.gross_amount,
        expire_date:param.expire_date
      })
      .then(function(line){
        return res.json({
          success:true,
          data:line
        })
      })
      .catch(function(err){
        console.log(err)
        return res.status(500).json({
          success: false,
          errMsg: err.message,
          errors: err
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

  router.post("/updatePay", function(req, res, next) {
    var param = req.body,
        id = param.id,
        remark = param.remark || "";

    PropertyBillLine.findOne({
      where: {
        id: param.id
      }
    })
    .then(function(line) {
      if (!line) {
        return res.json({
          success: false,
          errMsg: '找不到该账单行'
        })
      }

      line.update({
        is_pay: true,
        remark: remark,
        pay_date: (new Date())
      })
      .then(function(line) {
        return res.json({
          success: true,
          data: line
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

  //删除账单
  router.get("/delete", function(req, res, next) {
   var param = req.query;
   var id = param.id;

   PropertyBillLine.destroy({
     where:{
       id:id
     }
   })
   .then(function(rows){
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

  //微信用户查询某年未付款账单
  router.post("/queryWechatUnpaid", function(req, res, next) {
    var param = req.body,
        wechat_user_id = param.wechat_user_id,
        unit_id = param.unit_id,
        year = param.year;
    sequelize.model("UserUnitBinding").findOne({
      where: {
        wechat_user_id: wechat_user_id,
        unit_id: unit_id
      }
    })
    .then(function(userUnit) {
      if (!userUnit) {
        return res.json({
          success: false,
          errMsg: '用户没有和该户号绑定!'
        })
      }
      return PropertyBill.findAll({
        where: {
          year: year,
          unit_id: unit_id
        },
        include: [{
          model: PropertyBillLine,
          as: 'property_bill_lines',
          where: {
            is_pay: false
          }
        }]
      })
    })
    .then(function(bills) {
      return res.json({
        success: true,
        data: bills,
        year: year
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

  app.use("/propertyBillLines", router);
}
