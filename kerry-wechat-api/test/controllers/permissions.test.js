let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken'),
    permissions = require('../../lib/permissions.js')

module.exports = function(app, db, config){

  describe("验证Permission正则", function(){

    it("验证ALL正则正确", function(done) {
      var permission = permissions[0];
      var originUrl = '/api/units/create';

      var regExp = new RegExp(permission.httpPath);
      var result = regExp.test(originUrl);
      console.log(regExp)
      expect(result).to.be.true
      done();

    })

    it("验证创建单元正则正确", function(done) {
      var permission = permissions[1];
      var originUrl = '/api/units/create';

      var regExp = new RegExp(permission.httpPath);
      var result = regExp.test(originUrl);
      console.log(regExp)
      expect(result).to.be.true
      done();

    })

    it("验证更新单元正则正确", function(done) {
      var permission = permissions[1];
      var originUrl = '/api/units/update';

      var regExp = new RegExp(permission.httpPath);
      var result = regExp.test(originUrl);
      console.log(regExp)
      expect(result).to.be.true
      done();

    })


    it("验证查询单元正则正确", function(done) {
      var permission = permissions[2];
      var originUrl = '/api/units/create';

      var regExp = new RegExp(permission.httpPath);
      var result = regExp.test(originUrl);
      console.log(regExp)
      var originUrl2 = '/api/units/query_all'
      var result2 = regExp.test(originUrl2)

      expect(result).to.be.false
      expect(result2).to.be.true
      done();

    })

    it("验证物流API正则正确", function(done) {
      var permission = permissions[3];
      var originUrl = '/api/unit/';

      var regExp = new RegExp(permission.httpPath);
      var result = regExp.test(originUrl);
      console.log(regExp)
      var originUrl2 = '/api/delivery/create'
      var result2 = regExp.test(originUrl2)

      expect(result).to.be.false
      expect(result2).to.be.true
      done();

    })

    it("验证账单API正则正确", function(done) {
      var permission = permissions[4];
      var originUrl = '/api/propertyBills/';

      var regExp = new RegExp(permission.httpPath);
      var result = regExp.test(originUrl);
      console.log(regExp)
      var originUrl2 = '/api/propertyBillLines/create'
      var result2 = regExp.test(originUrl2)

      expect(result).to.be.true
      expect(result2).to.be.true
      done();

    })

    it("验证业主操作正则正确", function(done) {
      var permission = permissions[5];
      var originUrl = '/api/user_settings/update';

      var regExp = new RegExp(permission.httpPath);
      var result = regExp.test(originUrl);
      console.log(regExp)
      expect(result).to.be.true
      done();

    })

    it("验证微信相关操作正则正确", function(done) {
      var permission = permissions[7];
      var originUrl = '/api/wechatAssets/';

      var regExp = new RegExp(permission.httpPath);
      var result = regExp.test(originUrl);
      console.log(regExp)

      var originUrl2 = '/wxapi/menu'
      var result2 = regExp.test(originUrl2)

      var originUrl3 = '/wxapi/messages'
      var result3 = regExp.test(originUrl3)

      expect(result).to.be.true
      expect(result2).to.be.true
      expect(result3).to.be.true
      done();

    })

  });
}
