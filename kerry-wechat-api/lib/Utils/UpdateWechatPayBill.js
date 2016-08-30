
var UpdateWechatPayBill = function(bill_lines, trade_no, sequelize, callback) {
  try {
    var billLines = bill_lines.split(",");
    updateBillLinesAsync(billLines, 0, trade_no, sequelize, function() {
      console.log("UPDATE FINISH!");
      return callback();
    })

  } catch (e) {
    console.error(e)
    return callback(e)
  }
}

function updateBillLinesAsync(array, index, trade_no, sequelize, callback) {
  if (index >= array.length) {
    return callback();
  }

  var billLineId = array[index];
  sequelize.model("PropertyBillLine").findOne({
    where: {
      id: billLineId
    }
  })
  .then(function(billLine) {
    if (!billLine) {
      console.error("CAN NOT FOUND BILLLINE BY ID: ", billLineId);
      return updateBillLinesAsync(array, ++index, trade_no, sequelize, callback)
    }

    return billLine.update({
      is_pay: true,
      wechat_trade_no: trade_no,
      pay_date: (new Date()),
      remark: "微信支付"
    })
  })
  .then(function(billLine) {
    return updateBillLinesAsync(array, ++index, trade_no, sequelize, callback)
  })
  .catch(function(err) {
    console.error("UPDATE BILLLINE ERROR, ID: ", billLineId);
    return updateBillLinesAsync(array, ++index, trade_no, sequelize, callback)
  })

}

module.exports = UpdateWechatPayBill;
