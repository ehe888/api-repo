let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken');

module.exports = function(app, db, config){

  var access_token = "";
  describe("API平台系统用户身份验证", function(){

    it("POST提交用户名＋密码获得AccessToken", function(done){
      request(app)
        .post("/api/auth/login")
        .send({
          username: "su",
          password: "Abc123456"
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
          expect(res.body.access_token).to.exist;
          access_token = res.body.access_token;
          try{
            var decoded = jwt.verify(res.body.access_token, config.accessToken.secret);
            console.log(decoded);
            expect(decoded.sub).to.equal("su");
          }catch(err){
            throw err;
          }
        })
        .end(done);
    })

    it("根据access token获取用户信息", function(done) {
      request(app)
        .post('/api/auth/')
        .send({
          access_token: access_token
        })
        .expect(200)
        .expect(function(res) {
          expect(res.body.success).to.be.true;
          expect(res.body.data.sub).to.equal("su");
        })
        .end(done);
    })



  });
}
