
module.exports = function(app, db, options){
  var _ = require("lodash"),
     debug = require('debug')('core-api'),
     express = require('express'),
     util = require('util'),
     path = require('path'),
     sequelize = db.sequelize,  //The sequelize instance
     Sequelize = db.Sequelize,  //The Sequelize Class via require("sequelize")
     models = options.db;

  var router = express.Router();


  //查询已付款的账单信息
  //根据时间和户号, 查询已付款账单
  router.post("/queryByTime", function(req, res, next) {
    var param = req.body,
        start_time = param.start_time || "",
        end_time = param.end_time || "",
        appId = param.appId,
        offset = param.offset || 0,
        limit = param.limit || 20,
        unit_desc = param.unit_desc || ""

    var billOption = ""
    if (unit_desc && unit_desc.length > 0) {
      billOption += "'%"+unit_desc+"%'"
    }

    var timeOption = ""
    if (start_time.length > 0) {
      var startDate = new Date(start_time);
      if (startDate != 'Invalid Date') {
        var year = startDate.getFullYear(),
            month = startDate.getMonth()+1
        timeOption = "year >="+year+" AND month >= "+month
      }
    }

    if (end_time.length > 0) {
      var endDate = new Date(end_time);
      if (endDate != 'Invalid Date') {
        var year = endDate.getFullYear(),
            month = endDate.getMonth()+2
        if (timeOption.length > 0) {
          timeOption += " AND year >= "+year+" AND month >= "+month
        }else {
          timeOption = "year >= "+year+" AND month >= "+month
        }
      }
    }

    var query = 'SELECT * FROM vw_property_bill WHERE app_id = ? AND is_pay = TRUE';
    if (billOption.length > 2) {
      query += ' AND unit_desc LIKE ' + billOption
    }
    if (timeOption.length > 0) {
      query += ' AND ' + timeOption
    }

    query += ' ORDER BY id DESC offset ? limit ?'

    sequelize.query(query, { replacements: [appId, offset, limit], type: sequelize.QueryTypes.SELECT})
    .then(function(results) {
      var data = [];
      for (var i = 0; i < results.length; i++) {
        var row = results[i];
        var bill = _.find(data, function(o) {
          return row.id == o.id
        })
        if (!bill) {
          data.push({
            id: row.id,
            bill_number: row.bill_number,
            year: row.year,
            month: row.month,
            print_data: row.print_data,
            is_push: row.is_push,
            username: row.username,
            active: row.active,
            created_at: row.created_at,
            updated_at: row.updated_at,
            deleted_at: row.deleted_at,
            unit_id: row.unit_id,
            property_bill_lines: [{
              id: row.bill_line_id,
              work_order_number: row.work_order_number,
              description: row.description,
              taxable_amount: row.taxable_amount,
              tax: row.tax,
              gross_amount: row.gross_amount,
              is_pay: row.is_pay,
              expire_date: row.expire_date
            }],
            unit: [{
              id: row.unit_id,
              unit_number: row.unit_number,
              unit_desc: row.unit_desc
            }]
          })
        }
        else {
          bill.property_bill_lines.push({
            id: row.bill_line_id,
            work_order_number: row.work_order_number,
            description: row.description,
            taxable_amount: row.taxable_amount,
            tax: row.tax,
            gross_amount: row.gross_amount,
            is_pay: row.is_pay,
            expire_date: row.expire_date
          })

          bill.unit.push({
            id: row.unit_id,
            unit_number: row.unit_number,
            unit_desc: row.unit_desc
          })
        }
      }

      var countQuery = 'SELECT count(1) FROM (SELECT DISTINCT id FROM vw_property_bill WHERE app_id = ?  AND is_pay = TRUE ';

      if (billOption.length > 2) {
        countQuery += ' AND unit_desc LIKE ' + billOption
      }
      if (timeOption.length > 0) {
        query += ' AND ' + timeOption
      }

      countQuery += ') as count'

      sequelize.query(countQuery, { replacements: [appId], type: sequelize.QueryTypes.SELECT})
      .then(function(count) {

        return res.json({
          success: true,
          data: data,
          offset: offset,
          limit: limit,
          count: count.length>0?count[0].count:0
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

  app.use("/billHistory", router);

}
