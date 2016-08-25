
module.exports = function(app, db, options){
  var _ = require("lodash"),
     debug = require('debug')('core-api'),
     express = require('express'),
     util = require('util'),
     path = require('path'),
     sequelize = db.sequelize,  //The sequelize instance
     Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
     models = options.db,
     KerryWorkOrder = sequelize.model("KerryWorkOrder"),
     KerryWorkOrderLine = sequelize.model("KerryWorkOrderLine"),
     KerryWorkOrderComment = sequelize.model("KerryWorkOrderComment")
     WechatAssets = sequelize.model("WechatAssets")

  var router = express.Router();
  var env = process.env.NODE_ENV

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
    debug(assetIds)
    if (!unit_id) {
      return res.status(400).json({
        success: false,
        errMsg: '无效的户号'
      })
    }

    if (!content) {
      return res.status(400).json({
        success: false,
        errMsg: '请输入内容'
      })
    }

    if (!wechat_user_id) {
      return res.status(400).json({
        success: false,
        errMsg: '无效的微信号'
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
          errMsg: '微信号没有与该单元绑定!'
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
        errMsg: '请输入正确的价格和数量'
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
          errMsg: '找不到该维修单!'
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
        worker_phone = param.worker_phone
    KerryWorkOrder.findOne({
      where: {
        id: id
      }
    })
    .then(function(order) {
      if (!order) {
        return res.status(400).json({
          success: false,
          errMsg: '找不到该维修单'
        })
      }

      order.update({
        worker_name: worker_name,
        worker_phone: worker_phone,
        status: 'WORKING'
      })
      .then(function() {
        //todo 发送模板消息
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
          errMsg: '找不到该维修单'
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
          errMsg: '找不到该维修项目'
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
            errMsg: '找不到该维修单'
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
        attributes: ["id", "firstName", "lastName"]
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
        id = param.id
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
          errMsg: '找不到该维修单!'
        })
      }
      else if (order.is_pay) {
        return res.status(400).json({
          success: false,
          errMsg: "该维修单已支付"
        })
      }
      else if (order.status != 'UNPAY') {
        return res.status(400).json({
          success: false,
          errMsg: "维修正在处理中, 请完成后再付款"
        })
      }

      var gross_amount = order.gross_amount
      //todo 微信支付

      order.update({
        is_pay: true,
        status: 'PAID'
      })
      .then(function(order) {
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
          success: fasle,
          errMsg: '找不到该维修单!'
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

  app.use("/workOrder", router);

}
