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

    it("验证正则正确", function(done) {
      var permission = _.find(permissions, function(p) {
        return p.name == "上传账单"
      });
      var originUrl = '/api/propertyBills/queryPropertyBills';
      console.log(permission)
      var regExp = new RegExp(permission.httpPath);
      var result = regExp.test(originUrl);
      console.log(regExp)
      expect(result).to.be.true
      done();

    })


  });
}
