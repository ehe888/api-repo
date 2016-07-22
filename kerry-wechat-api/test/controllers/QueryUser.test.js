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

  describe("查询用户Test", function(){

    it("POST查询后台用户", function(done){
      request(app)
        .post("/api/wechatUsers/queryWechatUsers")
        .send({
          username: 't',
          offset: 0,
          limit: 20,
          appId: 'wxa0c45fc6d9e269ed'
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body);
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

  });
}
