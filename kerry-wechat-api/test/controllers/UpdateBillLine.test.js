let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken'),
    UpdateWechatPayBill = require('../../lib/Utils/UpdateWechatPayBill')

module.exports = function(app, db, config){

  var sequelize = db.sequelize

  describe("微信支付后, 更新账单正确", function(){

    it("微信支付后, 更新账单正确", function(done) {
      var bill_lines = "1,2,3";
      UpdateWechatPayBill(bill_lines, sequelize, function(err) {
        expect(err).to.not.exist
        if (err) {
          done(err)
        }

        sequelize.model("PropertyBillLine").find({
          where: {
            id: {
              $in: [1,2,3]
            }
          }
        })
        .then(function(billLines){
          expect(billLines).to.be.exist;
          for (var i = 0; i < billLines.length; i++) {
            var billLine = billLines[i];
            console.log(billLine.is_pay)
            expect(billLine.is_pay).to.be.true
          }
          done()
        })

      })
    })

  });
}
