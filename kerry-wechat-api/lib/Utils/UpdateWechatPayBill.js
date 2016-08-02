
var UpdateWechatPayBill = function(bill_lines, sequelize, callback) {
  try {
    var billLines = bill_lines.split(",");
    updateBillLinesAsync(billLines, 0, sequelize, function() {
      console.log("UPDATE FINISH!");
      return callback();
    })

  } catch (e) {
    console.error(e)
    return callback(e)
  }
}

function updateBillLinesAsync(array, index, sequelize, callback) {
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
      return updateBillLinesAsync(array, ++index, sequelize, callback)
    }

    return billLine.update({
      is_pay: true
    })
  })
  .then(function(billLine) {
    return updateBillLinesAsync(array, ++index, sequelize, callback)
  })
  .catch(function(err) {
    console.error("UPDATE BILLLINE ERROR, ID: ", billLineId);
    return updateBillLinesAsync(array, ++index, sequelize, callback)
  })

}

module.exports = UpdateWechatPayBill;
