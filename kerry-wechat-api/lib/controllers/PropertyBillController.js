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


  //创建账单
  router.post("/create", function(req, res, next) {
    var param = req.body;
    var id;
    PropertyBill.create({
      bill_number:' ',
      year:param.year,
      month:param.month,
      is_push:false,
      unit_id:param.unit_id
    })
    .then(function(propertyBill) {
      id = propertyBill.id;
      param.property_bill_lines.forEach(function(data){
        data.property_bill_id = id;
      })

      PropertyBillLine.bulkCreate(param.property_bill_lines)
      .then(function(){
        PropertyBill.findOne({
          where:{
            id:id
          },
          include:[{
            model: sequelize.model("PropertyBillLine"),
            as: 'property_bill_lines'
          }]
        })
        .then(function(propertyBill){
          return res.json({
            success:true,
            data:propertyBill
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
      console.log(err)
      return res.status(500).json({
        success: false,
        errMsg: err.message,
        errors: err
      })
    })
  })

  //修改账单
  router.post("/update", function(req, res, next) {
    var param = req.body;

    PropertyBill.findOne({
      where: {
        id: param.id
      },
      include:[{
        model: sequelize.model("PropertyBillLine"),
        as: 'property_bill_lines'
      }]
    })
    .then(function(propertyBill) {
      if (propertyBill) {
        propertyBill.property_bill_lines.forEach(function(data){
             _.remove(param.property_bill_lines,function(paramData){
                  console.log(data.id+'  '+ paramData.id);
            return data.id == paramData.id
          })
        })

        param.property_bill_lines.forEach(function(data){
          data.property_id = param.id;
        })

        PropertyBillLine.bulkCreate(param.property_bill_lines)
        .then(function(){
          return res.json({
            success:true
          })
        })
        .catch(function(err){
          console.error(err)
          return res.status(500).json({
            success: false,
            errMsg: err.message,
            errors: err
          })
        })
      }
      else {
        return res.status(404).json({
          success: false,
          errMsg: '找不到该账单！'
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

  //删除账单
  router.get("/delete", function(req, res, next) {
   var param = req.query;
   var id = param.id;

   PropertyBill.destroy({
     where:{
       id:id
     }
   })
   .then(function(rows){
     PropertyBillLine.destroy({
       where:{
         property_bill_id:id
       }
     })
     .then(function(rows){
       return res.json({
         success:true,
         data:rows
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

  //查询账单
  router.post('/queryPropertyBills', function(req, res, next) {
    var bill_number = req.body.bill_number || '';
    PropertyBill.findAll({
      where: {
        bill_number: {
          $like: '%'+bill_number+'%'
        }
      },
      include:[{
        model: sequelize.model("PropertyBillLine"),
        as: 'property_bill_lines'
      }]
    })
    .then(function(propertyBills) {
      return res.json({
        success: true,
        data: propertyBills
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

  //上传CSV账单
  router.post('/upload', function(req, res, next) {
    var param = req.body,
        lines = param.data;
    console.log(lines);

    return res.json({
      success: true
    })

  })



  app.use("/propertyBills", router);
}
