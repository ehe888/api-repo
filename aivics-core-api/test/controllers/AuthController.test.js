let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken');

module.exports = function(app, config){

  describe("API平台系统用户身份验证", function(){

    it("POST提交用户名＋密码获得AccessToken", function(done){
      request(app)
        .post("/api/auth/login")
        .send({
          username: "su9527",
          password: "Abc123456"
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
          expect(res.body.access_token).to.exist;

          try{
            var decoded = jwt.verify(res.body.access_token, config.accessToken.secret);
            expect(decoded.sub).to.equal("su9527");
          }catch(err){
            throw err;
          }
        })
        .end(done);
    })

  });
}
