
module.exports = function(app, db, options){
  var _ = require("lodash"),
     debug = require('debug')('core-api'),
     express = require('express'),
     util = require('util'),
     path = require('path'),
     sequelize = db.sequelize,  //The sequelize instance
     Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
     models = options.db,
     fs = require('fs'),
     env = process.env.NODE_ENV,
     xml2js = require('xml2js'),
     Payment = require('../wechatPay/payment').Payment,
     Paymentmiddleware = require('../wechatPay/middleware'),
     KerryWorkOrder = sequelize.model("KerryWorkOrder"),
     KerryWorkOrderLine = sequelize.model("KerryWorkOrderLine"),
     KerryWorkOrderComment = sequelize.model("KerryWorkOrderComment")
     WechatAssets = sequelize.model("WechatAssets")

  var router = express.Router();
  var env = process.env.NODE_ENV

  var SendTemplateMessage = require('../Utils/SendTemplateMessage')

  //创建维修
  router.post("/create", function(req, res, next) {
    var param = req.body,
        unit_id = param.unit_id,
        assetIds = param.assetIds,
        wechat_user_id = param.wechat_user_id,
        content = param.content
    if (assetIds && assetIds.length > 0) {
      assetIds = assetIds.split(",")
    }
    else {
      assetIds = []
    }
    debug(assetIds)
    if (!unit_id) {
      return res.status(400).json({
        success: false,
        errMsg: '无效的户号',
        errors: new Error('无效的户号!')
      })
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        errMsg: '请输入内容',
        errors: new Error('请输入内容!')
      })
    }

    if (!wechat_user_id) {
      return res.status(400).json({
        success: false,
        errMsg: '无效的微信号',
        errors: new Error('无效的微信号!')
      })
    }

    var order
    sequelize.model("UserUnitBinding").findOne({
      where: {
        wechat_user_id: wechat_user_id,
        unit_id: unit_id
      }
    })
    .then(function(userUnit) {
      if (!userUnit) {
        return res.status(400).json({
          success: false,
          errMsg: '微信号没有与该单元绑定!',
          errors: new Error('微信号没有与该单元绑定!')
        })
      }

      KerryWorkOrder.create({
        unit_id: unit_id,
        owner: userUnit.username,
        mobile: userUnit.mobile,
        wechat_user_id: wechat_user_id,
        content: content
      })
      .then(function(_order) {
        order = _order
        return WechatAssets.update({
          kerry_work_order_id: order.id
        }, {
          where: {
            id:{
              $in: assetIds
            }
          }
        })
      })
      .then(function() {
        return res.json({
          success: true,
          data: order
        })
      })
      .catch(function(err) {
        console.error(err)
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
        success: false,
        errMsg: err.message,
        errors: err
      })
    })
  })

  //后台添加维修工单行
  router.post("/addOrderLine", function(req, res, next) {
    var param = req.body,
        id = param.id,
        price = parseFloat(param.price),
        count = parseInt(param.count),
        title = param.title;

    if (isNaN(price) || isNaN(count)) {
      return res.status(400).json({
        success: false,
        errMsg: '请输入正确的价格和数量',
        errors: new Error('请输入正确的价格和数量!')
      })
    }

    // 声明 Global
    var orderLine;

    // 先查询是否存在workOrder
    KerryWorkOrder.findOne({
      where: {
        id: id
      }
    })
    .then(function(order) {
      if (!order) {
        return res.status(400).json({
          success: false,
          errMsg: '找不到该维修单!',
          errors: new Error('找不到该维修单!')
        })
      }
      var amount = price * count;
      KerryWorkOrderLine.create({
        title: title,
        price: price,
        count: count,
        amount: amount,
        kerry_work_order_id: id
      })
      .then(function(_orderLine) {
        orderLine = _orderLine
        var gross_amount = order.gross_amount?parseFloat(order.gross_amount):0;
        gross_amount += amount;
        return order.update({
          gross_amount: gross_amount
        })
      })
      .then(function() {
        return res.json({
          success: true,
          data: orderLine
        })
      })
      .catch(function(err) {
        console.error(err)
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
        success: false,
        errMsg: err.message,
        errors: err
      })
    })

  })

  //后台添加维修人员信息
  router.post("/addWorker", function(req, res, next) {
    var param = req.body,
        id = param.id,
        worker_name = param.worker_name,
        worker_phone = param.worker_phone,
        appId = param.appId

    var port = req.app.settings.port
    var host = req.protocol+"://"+req.hostname + ( port == 80 || port == 443 ? '' : ':'+port )
    var config = req.x_app_config

    KerryWorkOrder.findOne({
      where: {
        id: id
      },
      include: [{
        model: sequelize.model("Units"),
        as: "unit",
        attributes: ["unit_number", "unit_desc"]
      }]
    })
    .then(function(order) {
      if (!order) {
        return res.status(400).json({
          success: false,
          errMsg: '找不到该维修单',
          errors: new Error('找不到该维修单!')
        })
      }

      order.update({
        worker_name: worker_name,
        worker_phone: worker_phone,
        status: 'WORKING'
      })
      .then(function() {
        //todo 发送模板消息
        sequelize.model("Template").findOne({
          where: {
            template_type: 'work_order'
          }
        })
        .then(function(template) {
          if (!template) {
            return res.json({
              success: true
            })
          }
          else {

            var openid = order.wechat_user_id.replace("wechat_", "")
            var template_id = template.id
            var title = order.content
            if (title.length > 20) {
              title = title.substr(0, 20) + "..."
            }
            var created_at = new Date(order.created_at)
            var create_time = ""
            if (created_at != 'Invalid Date') {
              create_time = created_at.getFullYear()+"年"+(created_at.getMonth()+1)
                            +"月"+created_at.getDate()+"日 " + created_at.getHours()
                            +":"+created_at.getMinutes()
            }
            var now = new Date(),
                nowTime = now.getFullYear()+"年"+(now.getMonth()+1)
                              +"月"+now.getDate()+"日"
            var content = {
              first: "尊敬的业主, 您的报修有新的进展",
              keyword1: {
                value: order.unit.unit_desc,
                color: '#173177'
              },
              keyword2: {
                value: title,
                color: '#173177'
              },
              keyword3: {
                value: create_time,
                color: '#173177'
              },
              keyword4: {
                value: "已指派给维修人员"+worker_name+", 联系电话:"+worker_phone,
                color: '#173177'
              },
              keyword5: {
                value: nowTime,
                color: '#173177'
              },
              remark: {
                value: '上门前工作人员将提前与您预约，请保持电话畅通，谢谢。',
                color: '#000000'
              }
            },
                contentStr = JSON.stringify(content)
            var unit_id = order.unit_id

            sequelize.model("PushMessageLog").create({
              openid: openid,
              template_id: template_id,
              content: contentStr,
              template_type: 'work_order',
              unit_id: unit_id
            })
            .then((log)=> {
              if (env == 'development') {
                return res.json({
                  success: true,
                  data: log
                })
              }
              var url = config.wechatHost+"/wechat/work_history?appId="+appId
              var topcolor = '#173177';
              var bearer = req.headers['authorization'];
              var access_token = bearer.substring("Bearer".length).trim();
              SendTemplateMessage([openid], contentStr, template.template_id, url, topcolor, access_token, appId, host, function() {
                return res.json({
                  success: true,
                  data: log
                })
              })
            })
          }
        })
      })
      .catch(function(err) {
        console.error(err)
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
        success: false,
        errMsg: err.message,
        errors: err
      })
    })
  })

  //后台更新状态为已处理
  router.post("/updateComplete", function(req, res, next) {
    var param = req.body,
        id = param.id;
    KerryWorkOrder.findOne({
      where: {
        id: id
      }
    })
    .then(function(order) {
      if (!order) {
        return res.status(400).json({
          success: false,
          errMsg: '找不到该维修单',
          errors: new Error('找不到该维修单!')
        })
      }
      order.update({
        status: 'UNPAY'
      })
      .then(function() {
        return res.json({
          success: true
        })
      })
      .catch(function(err) {
        console.error(err)
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
        success: false,
        errMsg: err.message,
        errors: err
      })
    })
  })

  //删除维修单
  router.post("/delete", function(req, res, next) {
    var param = req.body,
        id = param.id;
    KerryWorkOrderComment.destroy({
      where: {
        kerry_work_order_id: id
      }
    })
    .then(function() {
      return KerryWorkOrderLine.destroy({
        where: {
          kerry_work_order_id: id
        }
      })
    })
    .then(function() {
      return KerryWorkOrder.destroy({
        where: {
          id: id
        }
      })
    })
    .then(function() {
      return res.json({
        success: true
      })
    })
    .catch(function(err) {
      console.error(err)
      return res.status(500).json({
        success: false,
        errMsg: err.message,
        errors: err
      })
    })
  })

  //删除维修行
  router.post("/deleteLine", function(req, res, next) {
    var param = req.body,
        order_line_id = param.order_line_id

    KerryWorkOrderLine.findOne({
      where: {
        id: order_line_id
      }
    })
    .then(function(orderLine) {
      if (!orderLine) {
        return res.status(400).json({
          success: false,
          errMsg: '找不到该维修项目',
          errors: new Error('找不到该维修单!')
        })
      }

      var amount = orderLine.amount?parseFloat(orderLine.amount):0
      KerryWorkOrder.findOne({
        where: {
          id: orderLine.kerry_work_order_id
        }
      })
      .then(function(order) {
        if (!order) {
          return res.status(400).json({
            success: false,
            errMsg: '找不到该维修单',
            errors: new Error('找不到该维修单!')
          })
        }
        var gross_amount = order.gross_amount?parseFloat(order.gross_amount):0
        if (!isNaN(gross_amount) && !isNaN(amount)) {
          gross_amount -= amount
          gross_amount = gross_amount < 0?0:gross_amount

          order.update({
            gross_amount: gross_amount
          })
          .then(function() {
            KerryWorkOrderLine.destroy({
              where: {
                id: order_line_id
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
                success: false,
                errMsg: err.message,
                errors: err
              })
            })
          })
          .catch(function(err) {
            console.error(err)
            return res.status(500).json({
              success: false,
              errMsg: err.message,
              errors: err
            })
          })

        }
        else {
          console.error(order.gross_amount, orderLine.amount)
          return res.status(500).json({
            success: false,
            errMsg: '更新价格时出错'
          })
        }

      })
      .catch(function(err) {
        console.error(err)
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
        success: false,
        errMsg: err.message,
        errors: err
      })
    })

  })

  //后台查询维修单
  router.post("/query", function(req, res, next) {
    var param = req.body,
        offset = param.offset || 0,
        limit = param.limit || 20,
        unit_desc = param.unit_desc || '',
        appId = param.appId

    var unitOption = {};
    if (req.units) {
      unitOption.id = {
        $in: req.units
      }
    }
    if (unit_desc && unit_desc.length > 0) {
      unitOption.unit_desc =  {
        $like: '%'+unit_desc+'%'
      }
    }

    KerryWorkOrder.findAndCountAll({
      // subQuery: false,
      include: [{
        model: KerryWorkOrderLine,
        as: 'kerry_work_order_lines',
        attributes: ['id', 'title', 'price', 'count', 'amount']
      }, {
        model: sequelize.model("WechatAssets"),
        attributes: ['id', 'media_id', 'url', 'type'],
        as: 'wechat_assets'
      }, {
        model: sequelize.model("SysUser"),
        as: "sys_user",
        attributes: ["id", "firstName", "lastName", "username"]
      },  {
        model: sequelize.model("User"),
        as: "wechat_user",
        attributes: ["username", "wechatId", "wechatNickname", "wechatSex", "wechatProvince", "wechatCity", "wechatHeadimage"]
      }, {
        model: sequelize.model("KerryWorkOrderComment"),
        as: "kerry_work_order_comment",
        attributes: ["content"]
      }, {
        model: sequelize.model("Units"),
        as: 'unit',
        attributes: ["id", "unit_number", "unit_desc"],
        where: unitOption,
        include: [{
          model: sequelize.model("KerryProperty"),
          as: 'property',
          where: {
            appId: appId
          }
        }, {
          model: sequelize.model("UserUnitBinding"),
          as: "user_unit_binding",
          attributes: ["user_type"],
          where: {
            wechat_user_id: {
              $col: '"wechat_user"."username"'
            }
          }
        }]
      }],
      offset: offset,
      limit: limit,
      order: [[ sequelize.col('id') , 'DESC' ]]
    })
    .then(function(results) {
      return res.json({
        success: true,
        data: results.rows,
        count: results.count,
        offset: offset,
        limit: limit
      })
    })
    .catch(function(err) {
      console.error(err)
      return res.status(500).json({
        success: false,
        errMsg: err.message,
        errors: err
      })
    })


  })

  // 后台查询维修单行
  router.post("/queryLines", function(req, res, next) {
    var param = req.body,
        order_id = param.order_id
    KerryWorkOrderLine.findAll({
      where: {
        kerry_work_order_id: order_id
      }
    })
    .then(function(orderLines) {
      return res.json({
        success: true,
        data: orderLines
      })
    })
    .catch(function(err) {
      console.error(err)
      return res.status(500).json({
        success: false,
        errMsg: err.message,
        errors: err
      })
    })
  })

  // 后台查询未处理个数
  router.post("/queryApplingCount", function(req, res, next) {
    var param = req.body,
        appId = param.appId,
        sys_user_id = param.sys_user_id

    var unitOption = {};
    if (req.units) {
      unitOption.id = {
        $in: req.units
      }
    }

    var orderOption = {
      status: 'APPLYING'
    }
    if (sys_user_id) {
      orderOption.sys_user_id = sys_user_id
    }

    KerryWorkOrder.count({
      subQuery: false,
      where: orderOption,
      include: [{
        model: sequelize.model("Units"),
        as: 'unit',
        attributes: ["id"],
        where: unitOption,
        include: [{
          model: sequelize.model("KerryProperty"),
          as: 'property',
          where: {
            appId: appId
          }
        }]
      }]
    })
    .then(function(count) {
      return res.json({
        success: true,
        data: count
      })
    })
    .catch(function(err) {
      console.error(err)
      return res.status(500).json({
        success: false,
        errMsg: err.message,
        errors: err
      })
    })

  })

  //微信端查询处理中的维修单
  router.post("/queryUnderWorking", function(req, res, next) {
    var param = req.body,
        wechat_user_id = param.wechat_user_id,
        offset = param.offset || 0,
        limit = param.limit || 10

    var results = {}
    KerryWorkOrder.findAll({
      where: {
        wechat_user_id: wechat_user_id,
        status: {
          $in: ['APPLYING', 'WORKING', 'UNPAY']
        }
      },
      // subQuery: false,
      include: [{
        model: KerryWorkOrderLine,
        as: 'kerry_work_order_lines',
        attributes: ['id', 'title', 'price', 'count', 'amount']
      }, {
        model: sequelize.model("Units"),
        as: 'unit',
        attributes: ["id", "unit_number", "unit_desc"]
      }],
      offset: offset,
      limit: limit,
      order: [[ sequelize.col('id') , 'DESC' ]]
    })
    .then(function(data) {
      results.rows = data
      return KerryWorkOrder.count({
        where: {
          wechat_user_id: wechat_user_id,
          status: {
            $in: ['APPLYING', 'WORKING', 'UNPAY']
          }
        }
      })
    })
    .then(function(count) {
      return res.json({
        success: true,
        data: results.rows,
        offset: offset,
        limit: limit,
        count: count
      })
    })
    .catch(function(err) {
      console.error(err)
      return res.status(500).json({
        success: false,
        errMsg: err.message,
        errors: err
      })
    })
  })

  //微信端查询已付款后的维修单
  router.post("/queryPaid", function(req, res, next) {
    var param = req.body,
        wechat_user_id = param.wechat_user_id,
        offset = param.offset,
        limit = param.limit

    var results = {}
    KerryWorkOrder.findAll({
      where: {
        wechat_user_id: wechat_user_id,
        status: {
          $in: ['PAID', 'FINISH']
        }
      },
      include: [{
        model: KerryWorkOrderLine,
        as: 'kerry_work_order_lines',
        attributes: ['id', 'title', 'price', 'count', 'amount']
      }, {
        model: sequelize.model("Units"),
        as: 'unit',
        attributes: ["id", "unit_number", "unit_desc"]
      }, {
        model: sequelize.model("KerryWorkOrderComment"),
        as: "kerry_work_order_comment",
        attributes: ["content"]
      }],
      offset: offset,
      limit: limit,
      order: [[ sequelize.col('id') , 'DESC' ]]
    })
    .then(function(data) {
      results.rows = data
      return KerryWorkOrder.count({
        where: {
          wechat_user_id: wechat_user_id,
          status: {
            $in: ['PAID', 'FINISH']
          }
        }
      })
    })
    .then(function(count) {
      return res.json({
        success: true,
        data: results.rows,
        offset: offset,
        limit: limit,
        count: count
      })
    })
    .catch(function(err) {
      console.error(err)
      return res.status(500).json({
        success: false,
        errMsg: err.message,
        errors: err
      })
    })
  })

  //微信端支付
  router.post("/pay", function(req, res, next) {
    var param = req.body,
        wechat_user_id = param.wechat_user_id,
        id = param.id,
        appId = param.appId

    KerryWorkOrder.findOne({
      where: {
        wechat_user_id: wechat_user_id,
        id: id
      }
    })
    .then(function(order) {
      if (!order) {
        return res.status(400).json({
          success: fasle,
          errMsg: '找不到该维修单!',
          errors: new Error('找不到该维修单!')
        })
      }
      else if (order.is_pay || order.status == 'PAID' || order.status == 'FINISH') {
        return res.status(400).json({
          success: false,
          errMsg: "该维修单已支付",
          errors: new Error('该微信单已支付!')
        })
      }
      else if (order.status != 'UNPAY') {
        return res.status(400).json({
          success: false,
          errMsg: "维修正在处理中, 请完成后再付款",
          errors: new Error('维修正在处理中, 请完成后再付款')
        })
      }

      var gross_amount = order.gross_amount

      var config = req.x_app_config;

      var initalParam = {
        trade_type: 'JSAPI',
        spbill_create_ip: config.apiIp,
        total_fee: gross_amount*100,
        openid: wechat_user_id.replace('wechat_', '')
      },
      initalConfig = {
        notifyUrl: config.apiHost+"/api/workOrder/pay_callback"
      }

      sequelize.model("KerryProperty")
      .findOne({
        where: {
          app_id: appId
        }
      })
      .then(function(property) {
        //根据appId查询物业, 获取物业商户相关参数
        if (!property) {
          return res.json({
            success: false,
            errMsg: '没有对应物业'
          })
        }
        initalParam.body = property.name + "维修单"
        initalConfig.partnerKey = property.partnerKey
        initalConfig.appId = property.appId
        initalConfig.mchId = property.mchId;

        sequelize.model("WechatPay").count()
        .then(function(payCount) {
          //提交微信统一下单接口
          var now = new Date();
          var year = now.getFullYear(),
              month = (now.getMonth()+1)+"",
              day = (now.getDate())+"";
          month = pad(month, 2);
          day = pad(day, 2);
          payCount = pad(payCount+"", 7);
          var trade_no = year+month+day+payCount;
          initalParam.out_trade_no = trade_no;

          var wechatPay = new Payment(initalConfig);
          if (env=='development') {

            //统一下单成功后, 创建WechatPay记录
            sequelize.model("WechatPay").create({
              trade_no: initalParam.out_trade_no,
              prepay_id: (new Date()).getTime(),
              description: initalParam.product_name,
              bill_lines: order.id,
              request_content: "",
              wechat_user_id: wechat_user_id,
              type: 'work_order'
            })
            .then(function() {
              return order.update({
                is_pay: true,
                status: 'PAID'
              })
            })
            .then(function(order) {
              return res.json({
                success: true,
                data: order,
                config: initalConfig,
                param: initalParam
              })
            })
            .catch(function(err) {
              console.error(err)
              return res.status(500).json({
                success: false,
                errMsg: err.message,
                errors: err
              })
            })
          }
          else {
            console.log(initalParam);
            wechatPay.getBrandWCPayRequestParams(initalParam, function(err, payargs) {
              if (err) {
                console.error(err);
                return res.json({
                  success: false,
                  errMsg: err
                })
              }
              //统一下单成功后, 创建WechatPay记录
              sequelize.model("WechatPay").create({
                trade_no: initalParam.out_trade_no,
                prepay_id: payargs.package,
                description: initalParam.product_name,
                bill_lines: order.id,
                request_content: JSON.stringify(payargs),
                wechat_user_id: wechat_user_id,
                type: 'work_order'
              })
              .then(function(pay) {
                return res.json({
                  success: true,
                  data: payargs
                })
              })
              .catch(function(err) {
                console.error(err)
                return res.status(500).json({
                  success: false,
                  errMsg: err.message,
                  errors: err
                })
              })

            })
          }
        })
        .catch(function(err) {
          console.error(err)
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
          success: false,
          errMsg: err.message,
          errors: err
        })
      })
    })
    .catch(function(err) {
      console.error(err)
      return res.status(500).json({
        success: false,
        errMsg: err.message,
        errors: err
      })
    })

  })

  //微信支付回调
  router.post("/pay_callback", function(req, res, next) {
    res.set('Content-Type', 'text/xml');
    var data = {
      return_code: 'SUCCESS'
    }
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(data);
    var result = req.body.xml;
    console.log('WECHAT PAY SUCCESS'+JSON.stringify(req.body));

    try {
      if (result.return_code == 'SUCCESS') {
        //支付回调成功,
        if (result.result_code == 'SUCCESS') {
          //支付成功
          var trade_no = result.out_trade_no,
              transaction_id = result.transaction_id;
          sequelize.model("WechatPay").findOne({
            where: {
              trade_no: trade_no,
              type: 'work_order'
            }
          })
          .then(function(wechatpay) {
            wechatpay.update({
              status: "PAID",
              wechat_response_content: JSON.stringify(req.body),
              transaction_id: transaction_id
            })
            .then(function(instance) {
              var orderId = wechatpay.bill_lines
              return KerryWorkOrder.findOne({
                where: {
                  id: id
                }
              })
            })
            .then(function(order) {
              return order.update({
                is_pay: true,
                status: 'PAID',
                remark: '微信支付',
                pay_date: new Date()
              })
            })
            .then(function(order) {
              return res.send(xml)
            })
            .catch(function(err) {
              console.error(err)
              return res.send(xml)
            })
          })
          .catch(function(err) {
            console.error(err)
            return res.send(xml)
          })

          console.log('WECHAT PAY SUCCESS'+JSON.stringify(req.body));
        }
        else {
          if (result.err_code) {
            console.error("Wechat Pay Error")
            console.error("err_code is ", result.err_code);
            return res.send(xml);
          }
        }
      }
      else {
        console.error("Wechat Pay Return Error")
        if (result.return_msg) {
          console.error("return_msg is ", result.return_msg);
        }
        return res.send(xml);
      }

    }
    catch(e) {
      console.error(e);
      return res.send(xml);
    }

  })

  //后台线下付款
  router.post("/pay_offline", function(req, res, next) {
    var param = req.body,
        sys_user_id = param.sys_user_id,
        remark = param.remark,
        work_order_id = param.work_order_id
    if (!remark || remark.length == 0) {
      return res.status(400).json({
        success: false,
        errMsg: '请输入备注信息'
      })
    }
    KerryWorkOrder.findOne({
      where: {
        id: work_order_id
      }
    })
    .then(function(order) {
      if (!order) {
        var error = new Error('找不到该维修单!')
        error.status = 400
        throw error
      }
      else if (order.status == 'PAID' || order.status == 'FINISH' || order.is_pay) {
        var error = new Error('维修单已经支付!')
        error.status = 400
        throw error
      }
      else {
        return order.update({
          sys_user_id: sys_user_id,
          remark: remark,
          is_pay: true,
          status: 'PAID',
          pay_date: new Date()
        })
      }
    })
    .then(function() {
      return res.json({
        success: true
      })
    })
    .catch(function(error) {
      console.error(error)
      var status = error.status || 500
      return res.status(status).json({
        success: false,
        errMsg: error.message,
        errors: error
      })
    })
  })

  // 微信端评论
  router.post("/comment", function(req, res, next) {
    var param = req.body,
        id = param.id,
        wechat_user_id = param.wechat_user_id,
        content = param.content
    KerryWorkOrder.findOne({
      where: {
        wechat_user_id: wechat_user_id,
        id: id,
        status: 'PAID'
      }
    })
    .then(function(order) {
      if (!order) {
        return res.status(400).json({
          success: false,
          errMsg: '找不到该维修单!',
          errors: new Error('找不到该维修单!')
        })
      }

      KerryWorkOrderComment.create({
        content: content,
        kerry_work_order_id: id
      })
      .then(function(comment) {
        return order.update({
          status: 'FINISH'
        })
      })
      .then(function() {
        return res.json({
          success: true
        })
      })
      .catch(function(err) {
        console.error(err)
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
        success: false,
        errMsg: err.message,
        errors: err
      })
    })
  })


  function pad(n, length) {
    if (n.length < length) {
      return pad("0"+n, length)
    }else {
      return n;
    }
  }

  app.use("/workOrder", router);

}
