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
     Units = sequelize.model("Units"),
     models = options.db;

  var router = express.Router();

  var SendTemplateMessage = require('../Utils/SendTemplateMessage')


  //创建账单
  router.post("/create", function(req, res, next) {
    var param = req.body;
    var id;
    sequelize.model("KerryUserUnit").findAll({
      where: {
        unit_id: param.unit_id
      },
      include: [{
        model: sequelize.model("KerryUsers"),
        as: 'kerry_user'
      }]
    })
    .then(function(kerryUserUnits) {
      var username = "";
      if (kerryUserUnits && kerryUserUnits.length > 0) {
        for (var i = 0; i < kerryUserUnits.length; i++) {
          var user = kerryUserUnits[i].kerry_user;
          if (user) {
            if (username.length > 0) {
              username += ", "+(user.name)
            }else {
              username = user.name
            }
          }
        }
      }
      PropertyBill.create({
        bill_number:' ',
        year:param.year,
        month:param.month,
        is_push:false,
        unit_id:param.unit_id,
        username: username
      })
      .then(function(propertyBill) {
        id = propertyBill.id;
        if(param.property_bill_lines){
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
        }
        else{
          return res.json({
            success:true,
            data:propertyBill
          })
        }
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
        if(propertyBill.property_bill_lines){
          propertyBill.property_bill_lines.forEach(function(data){
               _.remove(param.property_bill_lines,function(paramData){
                    console.log(data.id+'  '+ paramData.id);
              return data.id == paramData.id
            })
          })
        }

        if(param.property_bill_lines){
          param.property_bill_lines.forEach(function(data){
            data.property_id = param.id;
          })
        }

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
    var param = req.body,
        // bill_number = param.bill_number || '',
        username = param.username || '',
        offset = param.offset || 0,
        limit = param.limit || 20,
        appId = param.appId;
    var unitOption = {};
    if (req.units) {
      unitOption = {
        id: {
          $in: req.units
        }
      }
    }
    var billOption = {};
    if (username && username.length > 0) {
      billOption = {
        username: {
          $like: '%'+username+'%'
        }
      }
    }
    PropertyBill.findAll({
      where: billOption,
      include:[{
        model: sequelize.model("Units"),
        as: 'unit',
        where: unitOption,
        include: [{
          model: sequelize.model("KerryProperty"),
          as: 'property',
          where: {
            appId: appId
          }
        }]
      },{
        model: sequelize.model("PropertyBillLine"),
        as: 'property_bill_lines'
      }],
      offset: offset,
      limit: limit,
      order: ' id desc'
    })
    .then(function(results) {
      PropertyBill.count({
        where:billOption,
        include: [{
          model: sequelize.model("Units"),
          as: 'unit',
          where: unitOption,
          include: [{
            model: sequelize.model("KerryProperty"),
            as: 'property',
            where: {
              appId: appId
            }
          }]
        }]
      }).then(function(count) {
        return res.json({
          success: true,
          data: results,
          count: count,
          offset: offset,
          limit: limit
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

  //根据wechat_username查询账单
  router.post("/queryUserBills", function(req, res, next) {
    var param = req.body;
    var wechat_user_id = param.wechat_user_id,
        unit_id = param.unit_id,
        year = param.year;

    sequelize.model("UserUnitBinding").findAll({
      where:{
        wechat_user_id:wechat_user_id,
        unit_id: unit_id
      }
    })
    .then(function(userUnitBindings){

      if (!userUnitBindings) {
        return res.json({
          success: false,
          errMsg: '请先绑定户号!'
        })
      }

      PropertyBill.findAll({
        where: {
          unit_id: unit_id,
          year: year
        },
        include:[{
          model: sequelize.model("Units"),
          as: 'unit'
        },{
          model: sequelize.model("PropertyBillLine"),
          as: 'property_bill_lines'
        }],
        order: ' year,month desc'
      })
      .then(function(bills) {
        return res.json({
          success: true,
          data: bills
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
    .catch(function(err){
      console.error(err)
      return res.status(500).json({
        success:false,
        errMsg:err.message,
        errors:err
      })
    })


  })

  //根据bill_id 发送Bill 模板消息
  router.post("/pushMessage", function(req, res, next) {
    var param = req.body,
        bill_id = param.bill_id,
        topcolor = param.topcolor
        app_id = param.appId;


    var port = req.app.settings.port
    var host = req.protocol+"://"+req.hostname + ( port == 80 || port == 443 ? '' : ':'+port );
    var config = req.x_app_config;

    PropertyBill.findOne({
      where: {
        id: bill_id
      },
      include:[{
        model: sequelize.model("Units"),
        as: 'unit',
        attributes: ['id', 'unit_number'],
        include: [{
          model: sequelize.model("UserUnitBinding"),
          as: 'user_unit_binding',
          attributes:['is_master', 'wechat_user_id'],
          include: [{
            model: sequelize.model("User"),
            as: 'wechat_user',
            attributes: ['wechatId']
          }]
        }, {
          model: sequelize.model("KerryProperty"),
          as: 'property',
          attributes: ['city', 'street', 'name']
        }]
      },{
        model: sequelize.model("PropertyBillLine"),
        as: 'property_bill_lines'
      }]

    })
    .then(function(bill) {
      if (bill) {
        var amount = 0;
        var date = bill.year + "年" + bill.month + "月";
        var billLines = bill.property_bill_lines;
        for (var i = 0; i < billLines.length; i++) {
          var billLine = billLines[i];
          amount += parseFloat(billLine.gross_amount);
        }
        amount = amount.toFixed(2);
        var url = config.wechatHost+"/wechat/my_bind";
        var address = "";
        if (bill.unit && bill.unit.property) {
          var property = bill.unit.property;
          address = property.city+property.street+bill.unit.unit_number;
          url = config.wechatHost+"/wechat/bill_history?unit_number="+bill.unit.unit_number
                + "&unit_id="+bill.unit.id
        }
        sequelize.model("Template").findOne({
          where: {
            template_type: 'bill',
            app_id: app_id
          }
        })
        .then(function(template) {
          if (!template) {
            return res.status(500).json({
              success: false,
              errMsg: '没有找到相应模板'
            })
          }

          var templateData = JSON.parse(template.data);
          var content = {
            first: templateData.first,
            keyword1: {
              value: "每月的01-10号",
              color: '#173177'
            },
            keyword2: {
              value: date,
              color: '#173177'
            },
            keyword3: {
              value: address,
              color: '#173177'
            },
            remark:{
              value: '当期总计费用: '+amount+"元, 请您在百忙中尽快安排时间到管理处缴纳。 谢谢您的配合！",
              color: '#173177'
            }
          }

          var contentStr = JSON.stringify(content)



          var openids = [];
          var logs = [];
          if (bill.unit && bill.unit.user_unit_binding && bill.unit.user_unit_binding.length > 0) {
            for (var i = 0; i < bill.unit.user_unit_binding.length; i++) {
              var bind = bill.unit.user_unit_binding[i];
              if (bind.wechat_user) {
                // console.log(bind.wechat_user.wechatId)
                openids.push(bind.wechat_user.wechatId)
                logs.push({
                  openid: bind.wechat_user.wechatId,
                  template_id: template.id,
                  content: contentStr,
                  template_type: 'bill',
                  unit_id: bill.unit.id
                })
              }
            }
          }
          // console.log(logs)
          if (openids.length > 0) {
            sequelize.model("PushMessageLog").bulkCreate(logs)
            .then(function(results) {
              // console.log(results)
              // return res.json({
              //   success: true,
              //   data: logs
              // })
              var bearer = req.headers['authorization'];
              var access_token = bearer.substring("Bearer".length).trim();
              SendTemplateMessage(openids, contentStr, template.template_id, url, topcolor, access_token, app_id, host,function() {
                bill.update({
                  is_push: true
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
            return res.json({
              success: false,
              errMsg: '现在没有微信用户与该户号绑定'
            })
          }


        })
        .catch(function(err) {
          console.error(err)
          return res.status(500).json({
            success:false,
            errMsg:err.message,
            errors:err
          })
        })
      }
      else {
        return res.json({
          success: false,
          errMsg: '找不到该账单'
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


  //上传CSV账单
  //field1: 费用类型,
  //field2: 账单开始日期,
  //field3: 账单结束日期,
  //field4: 本期金额,
  //field5: BU
  //field6: 建筑物,
  //field7: 户号,
  //field8: 租户地址号,
  //field9: 租户名称,
  //field10: 合同号
  router.post('/upload', function(req, res, next) {
    var param = req.body,
        rows = param.data;
    var bill_lines = {};

    sequelize.model("KerryProperty").findOne({
      where:{
        app_id: param.appId
      }
    })
    .then(function(property) {
      if (!property) {
        return res.json({
          success: false,
          errMsg: '找不到对应物业'
        })
      }

      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (row.field2 == '账单开始日期') {
          continue;
        }

        var start = row.field2+"",
            end = row.field3+"";
        var start_time = start.substring(0, 4)+"-"+start.substring(4, 6)+"-"+start.substring(6, 8),
            end_time = end.substring(0, 4)+"-"+end.substring(4, 6)+"-"+end.substring(6, 8)

        var description = row.field1,
            start_date = new Date(start_time),
            end_date = new Date(end_time),
            gross_amount = (row.field4+'').replace(',', ''),
            unit_number = row.field5 + row.field7,
            username = row.field9;
        if (!bill_lines[unit_number]) {
          bill_lines[unit_number] = [];
        }
        bill_lines[unit_number].push({
          description: description,
          start_date: start_date,
          end_date: end_date,
          gross_amount: gross_amount,
          unit_number: unit_number,
          is_pay: false,
          username: username,
          property_id: property.id
        })
      }

      if (rows.length > 0) {

        sequelize.model("Units").findAll({
          where: {
            property_id: property.id
          }
        }).then(function(units) {
          var unitIds = [];
          for (var i = 0; i < units.length; i++) {
            unitIds.push(units[i].id)
          }
          sequelize.model("PropertyBill").findAll({
            where: {
              unit_id: {
                $in: unitIds
              }
            }
          })
          .then(function(bills) {
            var billIds = [];
            for (var i = 0; i < bills.length; i++) {
              billIds.push(bills[i].id)
            }

            PropertyBillLine.destroy({
              where: {
                is_pay: false,
                property_bill_id:{
                  $in: billIds
                }
              }
            })
            .then(function() {

              //通过CSV中的建筑编号+户号, 查询系统里对应的户号id;
              searchUnitIdByUnitNumbers(bill_lines, 0, function(bill_lines) {

                var billLines = [];
                var unitKeys = Object.keys(bill_lines)
                for (var i = 0; i < unitKeys.length; i++) {
                  var lines = bill_lines[unitKeys[i]];
                  billLines = _.concat(lines, billLines);
                }
                debug(billLines)
                //查询系统是否有相应的账单和账单行, 根据description, 户号, 日期查询, 如果有的话update, 没有的话create
                searchAndUpdateBillLines(billLines, 0, function() {
                  return res.json({
                    success: true
                  })
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
        })
      }
      else {
        return res.json({
          success: false,
          errMsg: '没有有效的账单'
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

  //查询billLines中的户号, 找出unit_id, 添加到billLines中对应该unit_number的对象中
  function searchUnitIdByUnitNumbers(billLines, index, callback) {

    var unitNumbers = Object.keys(billLines);

    if (index >= unitNumbers.length) {
      return callback(billLines);
    }

    var unit_number = unitNumbers[index];
    var lines = billLines[unit_number];
    if (lines.length == 0) {
      return searchUnitIdByUnitNumbers(billLines, ++index, callback)
    }
    var property_id = lines[0].property_id;
    Units.findOne({
      where: {
        unit_number: unit_number,
        property_id: property_id
      }
    })
    .then(function(unit) {
      if (!unit) {
        console.error("unit did not find: "+unit_number);
        return searchUnitIdByUnitNumbers(billLines, ++index, callback)
      }
      var unit_id = unit.id;
      var lines = billLines[unit_number];
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        line.unit_id = unit_id
      }
      return searchUnitIdByUnitNumbers(billLines, ++index, callback)
    })
    .catch(function(error) {
      console.error("unit find error: " + unit_number)
      console.error(error);
      return searchUnitIdByUnitNumbers(billLines, ++index, callback)
    })

  }

  //先根据Unit_id, year, month查询是否有bill,
  //如果有的话,
  //  查询是否有相同订单号, 根据description, 户号
  //    如果有, 那么update
  //    如果没有, create
  //如果没有, 新建账单记录, 再create账单行
  function searchAndUpdateBillLines(billLines, index, callback) {
    if (index >= billLines.length) {
      return callback();
    }

    var billLine = billLines[index],
        unit_id = billLine.unit_id,
        year = billLine.start_date.getFullYear(),
        month = billLine.start_date.getMonth()+1,
        gross_amount = parseFloat(billLine.gross_amount),
        username = billLine.username,
        description = billLine.description;
    PropertyBill.findOne({
      where: {
        year: year,
        month: month,
        unit_id: unit_id
      }
    })
    .then(function(bill) {

      if (bill) {
        var billId = bill.id;
        PropertyBillLine.findOne({
          where: {
            description: description,
            property_bill_id: billId
          }
        })
        .then(function(line) {

          if (line) {
            line.update({
              gross_amount: gross_amount
            })
            .then(function(line) {
              return searchAndUpdateBillLines(billLines, ++index, callback);
            })
            .catch(function(error) {
              console.log("update billLine error: " + error);
              console.error({
                id: line.id,
                gross_amount: gross_amount,
                description: description,
                property_bill_id: billId
              })
              return searchAndUpdateBillLines(billLines, ++index, callback)
            })
          }
          else {
            PropertyBillLine.create({
              gross_amount: gross_amount,
              description: description,
              is_pay: false,
              property_bill_id: billId
            })
            .then(function(line) {
              return searchAndUpdateBillLines(billLines, ++index, callback)
            })
            .catch(function(error) {
              console.log("create billLine error: " + error);
              console.error({
                gross_amount: gross_amount,
                description: description,
                property_bill_id: billId
              })
              return searchAndUpdateBillLines(billLines, ++index, callback)
            })
          }

        })
        .catch(function(error) {
          console.log("find billLine error: " + error);
          console.error({
            description: description,
            property_bill_id: billId
          })
          return searchAndUpdateBillLines(billLines, ++index, callback)
        })

      }
      else {
        PropertyBill.create({
          bill_number: ' ',
          year: year,
          month: month,
          unit_id: unit_id,
          username: username
        })
        .then(function(bill) {
          var billId = bill.id;
          PropertyBillLine.create({
            gross_amount: gross_amount,
            description: description,
            is_pay: false,
            property_bill_id: billId
          })
          .then(function(line) {
            return searchAndUpdateBillLines(billLines, ++index, callback)
          })
          .catch(function(error) {
            console.log("create billLine error: " + error);
            console.error({
              gross_amount: gross_amount,
              description: description,
              property_bill_id: billId
            })
            return searchAndUpdateBillLines(billLines, ++index, callback)
          })
        })
        .catch(function(error) {
          console.error("create bill error: " + error)
          console.error({
            year: year,
            month: month,
            unit_id: unit_id
          })
          return searchAndUpdateBillLines(billLines, ++index, callback)
        })

      }

    })
    .catch(function(error) {
      console.error("find bill error: " + error)
      console.error({
        year: year,
        month: month,
        unit_id: unit_id
      })
      return searchAndUpdateBillLines(billLines, ++index, callback)
    })


  }

  app.use("/propertyBills", router);
}
