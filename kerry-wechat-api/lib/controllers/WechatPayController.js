module.exports = function(app, db, options){
  var _ = require("lodash"),
     debug = require('debug')('core-api'),
     express = require('express'),
     util = require('util'),
     path = require('path'),
     jwt = require('jsonwebtoken'),
     sequelize = db.sequelize,  //The sequelize instance
     Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
     fs = require('fs'),
     env = process.env.NODE_ENV,
     xml2js = require('xml2js'),
     Payment = require('../wechatPay/payment').Payment,
     Paymentmiddleware = require('../wechatPay/middleware'),
     UpdateWechatPayBill = require('../Utils/UpdateWechatPayBill');

  // var initConfig = {
  //  partnerKey: "w4go19um14n73r2v2v3wvderavvscgz0",  //w4go19um14n73r2v2v3wvderavvscgz0  API密钥，嘉里不夜城
  //  appId: "wx59b13639314be7c8",
  //  mchId: "1352525102",
  //  notifyUrl: "http://www.weixin.qq.com/wxpay/pay.php"//,
  //  //pfx: fs.readFileSync("../../cert/apiclient_cert.p12")
  // };
  // var payment = new Payment(initConfig);

  models = options.db;

  var router = express.Router();

  //准备付款
  router.post("/billLinePay", function(req, res, next) {
    var param = req.body,
        billLines = param.billLines,
        wechat_user_id = param.wechat_user_id;

    var config = req.x_app_config;

    var billLineIds = [];
    if (billLines) {
      billLineIds = billLines.split(",");
    }

    var initalParam = {
      trade_type: 'JSAPI',
      spbill_create_ip: config.apiIp
    },
    initalConfig = {
      notifyUrl: config.apiHost+"/api/wechatPays/callback"
    };

    sequelize.model("PropertyBillLine").findAll({
      where: {
        id: {
          $in: billLineIds
        }
      }
    })
    .then(function(billLines) {
      //查询并计算提交账单行的金额
      if (!billLines || billLines.length == 0) {
        return res.json({
          success: false,
          errMsg: '没有需要付款的账单'
        })
      }
      var totalAmount = parseInt(0);
      for (var i = 0; i < billLines.length; i++) {
        var billLine = billLines[i];
        if (!billLine.is_pay) {
          totalAmount += parseFloat(billLine.gross_amount)
        }
      }
      if (totalAmount <= 0) {
        return res.json({
          success: false,
          errMsg: '没有需要付款的账单'
        })
      }
      totalAmount *= 100;
      initalParam.total_fee = totalAmount;
      return sequelize.model("User")
            .findOne({
              attributes: ['wechatId', 'app_id'],
              where: {
                username: wechat_user_id
              }
            })
    })
    .then(function(user) {
      //根据wechat_user_id查询微信用户, 获取openid和appId
      if (!user) {
        return res.json({
          success: false,
          errMsg: '找不到用户!'
        })
      }
      var app_id = user.app_id,
          openid = user.wechatId;
      initalParam.openid = openid;
      return sequelize.model("KerryProperty")
            .findOne({
              where: {
                app_id: app_id
              }
            })
    })
    .then(function(property) {
      //根据appId查询物业, 获取物业商户相关参数
      if (!property) {
        return res.json({
          success: false,
          errMsg: '没有对应物业'
        })
      }
      initalParam.body = property.name + "账单"
      initalConfig.partnerKey = property.partnerKey
      initalConfig.appId = property.appId
      initalConfig.mchId = property.mchId;
      return sequelize.model("WechatPay").count()
    })
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
          bill_lines: billLines,
          request_content: "",
          wechat_user_id: wechat_user_id
        })
        .then(function(pay) {
          return res.json({
            success: true,
            config: initalConfig,
            param: initalParam
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
            bill_lines: billLines,
            request_content: JSON.stringify(payargs),
            wechat_user_id: wechat_user_id
          })
          .then(function(pay) {
            return res.json({
              success: true,
              data: payargs
            })
          })

        })
      }

    })
    .catch(function(err) {
      console.error(err)
      return res.json({
        success: false,
        errMsg: err.message,
        error: err
      })
    })


  })

  router.post("/callback", function(req, res, next) {
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
              trade_no: trade_no
            }
          })
          .then(function(wechatpay) {
            wechatpay.update({
              status: "PAID",
              wechat_response_content: JSON.stringify(req.body),
              transaction_id: transaction_id
            })
            .then(function(instance) {
              UpdateWechatPayBill(wechatpay.bill_lines, transaction_id, sequelize, function(err) {
                if (err) {
                  console.error("update bill line error: ", err);
                }
                return res.send(xml);
              })

            })
            .catch(function(err) {
              console.error(err)
              return res.send(xml);
            })
          })
          .catch(function(err) {
            console.error(err)
            return res.send(xml);
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

  router.post("/WechatPay", function(req, res, next) {

    var param = req.body,
        product_name = param.product_name,
        //attach = param.attach,
        out_trade_no = param.out_trade_no,
        total_fee = param.total_fee,
        wechat_user_id = param.wechat_user_id.replace('wechat_', '');

    var order = {
      body: product_name,
      //attach: '{"部位":"三角"}',     //附加数据
      out_trade_no: out_trade_no,   //订单号
      total_fee: total_fee,     //总金额
      spbill_create_ip: "10.0.0.35",  //下单IP"10.0.0.35"
      openid: "oc4kVwVHYTTQhWq7hrc_rgMBSpjI", // "oc4kVwVHYTTQhWq7hrc_rgMBSpjI"
      trade_type: 'JSAPI'
    };

    payment.getBrandWCPayRequestParams(order, function(err, payargs){
      console.log(err);
      console.log(payargs);
      return res.json({
        success: true,
        data:payargs
      })
    });

  })

  function pad(n, length) {
    if (n.length < length) {
      return pad("0"+n, length)
    }else {
      return n;
    }
  }

  app.use("/wechatPays", router);

}
