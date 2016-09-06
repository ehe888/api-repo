
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
     bwipjs = require('bwip-js'),
     env = process.env.NODE_ENV,
     xml2js = require('xml2js'),
     Payment = require('../wechatPay/payment').Payment,
     Paymentmiddleware = require('../wechatPay/middleware'),
     KerryWorkOrder = sequelize.model("KerryWorkOrder"),
     KerryWorkOrderLine = sequelize.model("KerryWorkOrderLine"),
     KerryWorkOrderComment = sequelize.model("KerryWorkOrderComment")
     WechatAssets = sequelize.model("WechatAssets"),
     Docxtemplater = require('docxtemplater'),
     ImageModule=require('docxtemplater-image-module'),
     gm = require('gm').subClass({imageMagick: true})

  var router = express.Router()
  var env = process.env.NODE_ENV

  // 打印账单
  router.post("/print", function(req, res, next) {
    var param = req.body,
        id = param.id
    var _order
    KerryWorkOrder.findOne({
      where: {
        id: id
      },
      include: [{
        model: sequelize.model("Units"),
        as: 'unit',
        attributes: ["unit_desc", "id", "unit_number"],
        include: [{
          model: sequelize.model("KerryProperty"),
          as: 'property',
          attributes: ['name', 'telephone', 'province', 'city', 'street', 'zipcode']
        }]
      }, {
        model: KerryWorkOrderLine,
        as: 'kerry_work_order_lines'
      }, {
        model: sequelize.model("User"),
        as: 'wechat_user',
        attributes: ['email', 'mobile', 'wechatId', 'wechatNickname']
      }, {
        model: sequelize.model("SysUser"),
        as: 'sys_user',
        attributes: ['firstName', 'lastName']
      }]
    })
    .then((order) => {
      if (!order) {
        var error = new Error("找不到维修单!")
        error.status = 400
        throw error
      }
      else if (!order.unit) {
        var error = new Error("该维修单找不到对应户号!")
        error.status = 400
        throw error
      }
      else if (!order.unit.property) {
        var error = new Error("该维修单找不到对应物业!")
        error.status = 400
        throw error
      }
      _order = order

      return sequelize.model("UserUnitBinding").findOne({
        unit_id: order.unit_id,
        wechat_user_id: order.wechat_user_id
      })

    })
    .then((binding) => {
      if (!binding) {
        var error = new Error("找不到绑定信息!")
        error.status = 400
        throw error
      }

      // 生成维修单条形码
      var barcodePath = req.x_app_config.billPath + _order.order_number + ".png"
      generateBarcodeBase64(_order.order_number, (err, base64) => {
        if (err) throw err

        fs.writeFile(barcodePath, base64, 'base64', (err) => {
          if (err) throw err

          gm(barcodePath).rotate('transparent', 90)
          .write(barcodePath, (err) => {
            if (err) throw err

            var created_at = new Date(_order.created_at)
            var p_start, p_end
            if (_order.p_start) {
              p_start = new Date(_order.p_start)
            }
            if (_order.p_end) {
              p_end = new Date(_order.p_end)
            }

            var df = ""
            if (p_start && p_end) {
              var start = p_start.getTime(),
                  end = p_end.getTime()
              df = ((end - start)/(1000*60*60)).toFixed(1)
            }

            var sysUserName = ""
            if (_order.sys_user) {
              var firstName =  _order.sys_user.firstName||"",
                  lastName = _order.sys_user.lastName || ""
              sysUserName = firstName+lastName
            }

            var items = []
            for (var i = 0; i < 6; i++) {
              if (_order.kerry_work_order_lines && i < _order.kerry_work_order_lines.length) {
                var orderLine = _order.kerry_work_order_lines[i]
                items.push({
                  title: orderLine.title,
                  price: orderLine.price,
                  count: orderLine.count,
                  amount: orderLine.amount
                })
              }
              else {
                items.push({
                  title: "",
                  price: "",
                  count: "",
                  amount: ""
                })
              }
            }

            var priority = ""
            if (_order.priority == 1) {
              priority = "低"
            }else if (_order.priority == 5) {
              priority = "中"
            }else if (_order.priority == 10) {
              priority = "高"
            }

            var print = {
              "Company_cs": _order.unit.property.name,
              "Doc": _order.order_number,
              "Or Ty": "服务工作单",
              "Wo Ty": "现场工作单",
              "Priority": priority,
              "Dt_Init": formatDate(created_at),
              "Dt_PSta": p_start?formatDate(p_start):"",
              "Dt_PEnd": p_end?formatDate(p_end):"",
              "Df":df,
              "Venue": _order.unit.property.name+_order.unit.unit_desc,
              "Torg": sysUserName,
              "Customer": binding.username,
              "ContactName2_ID210": binding.username,
              "PhoneAreaCode1_ID212": binding.mobile,
              "Issue1": _order.content,
              "Item1": items[0].title,
              "Price1": items[0].price,
              "Qty1": items[0].count,
              "Amount1": items[0].amount,
              "Item2": items[1].title,
              "Price2": items[1].price,
              "Qty2": items[1].count,
              "Amount2": items[1].amount,
              "Item3": items[2].title,
              "Price3": items[2].price,
              "Qty3": items[2].count,
              "Amount3": items[2].amount,
              "Item4": items[3].title,
              "Price4": items[3].price,
              "Qty4": items[3].count,
              "Amount4": items[3].amount,
              "Item5": items[4].title,
              "Price5": items[4].price,
              "Qty5": items[4].count,
              "Amount5": items[4].amount,
              "Item6": items[5].title,
              "Price6": items[5].price,
              "Qty6": items[5].count,
              "Amount6": items[5].amount,
              "Barcode": barcodePath,
              "Total": _order.gross_amount,
              "Prompt": ""
            }

            debug(barcodePath)
            var filePath = req.x_app_config.billPath + _order.order_number + ".docx"
            fs.readFile(__dirname+'/template/R5548004_both_V2.docx', 'binary', (err, data) => {
              if (err) {
                throw err
              }

              var opts = {}
              opts.centered = false;
              opts.getImage=function(tagValue, tagName) {
                  return fs.readFileSync(tagValue,'binary');
              }

              opts.getSize=function(img,tagValue, tagName) {
                  return [30,250];
              }

              var imageModule = new ImageModule(opts)
              var doc = new Docxtemplater()
                .attachModule(imageModule)
                .load(data)
                .setData(print)
                .render()
              var buf = doc.getZip()
                   .generate({type:"nodebuffer"})
              fs.writeFile(filePath, buf, (err) => {
                if (err) throw err
                
                if (env == 'development') {
                  return res.json({
                    success: true,
                    order: _order,
                    bind: binding,
                    data: print
                  })
                }
                else {
                  return res.download(filePath)
                }

              })
            })

          })

        })

      })



    })
    .catch((err) => {
      console.error(err)
      var status = err.status || 500
      return res.status(status).json({
        success: false
        ,errMsg: err.message
        ,errors: err
      })
    })
  })

  function pad(n, length) {
    n = n + ""
    if (n.length < length) {
      return pad("0"+n, length)
    }else {
      return n;
    }
  }

  /**
   * generate base64 string of barcode image
   * @param  {[type]} code [description]
   * @return {base64}      base64 represent of Code128 barcode
   */
  function generateBarcodeBase64(code, cb){
    bwipjs.toBuffer({
        bcid:           'code128',      // Barcode type
        text:           code,           // Text to encode
        scale:          2,              // 3x scaling factor
        height:         10,             // Bar height, in millimeters
        includetext:    true,           // Show human-readable text
        textxalign:     'center',       // Always good to set this
        textsize:       13              // Font size, in points
    }, function (err, png) {
        if (err) {
            // Decide how to handle the error
            // `err` may be a string or Error object
            debug("Error in generating barcode", err);
            return cb(err);

        } else {
            // `png` is a Buffer
            // png.length           : PNG file length
            // png.readUInt32BE(16) : PNG image width
            // png.readUInt32BE(20) : PNG image height
            //Convert png buffer to base64
            return cb(null, png.toString('base64'));
        }
    });
  }

  function formatDate(date) {
    return date.getFullYear()+"-"+pad(date.getMonth()+1, 2)+"-"+pad(date.getDate(), 2)
          + " "+pad(date.getHours(), 2)+":"+pad(date.getMinutes(), 2)
  }

  app.use("/orderPrint", router)

}
