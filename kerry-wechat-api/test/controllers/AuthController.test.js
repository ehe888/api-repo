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

    before(function(done) {

      db.sequelize.model("SysUser").findOne({
        where: {
          username: 'wang'
        }
      })
      .then(function(sysuser) {
        return sysuser.update({
          password: '123456'
        })
      })
      .then(function() {
        console.log("done")
        done();
      })
      .catch(function(err) {
        console.error(err);
        done(err)
      })

    })

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
          console.log(res.body)
          console.log(JSON.stringify(res.body.data.sys_role_user))

          expect(res.body.success).to.be.true;
          expect(res.body.data).to.be.exist;
        })
        .end(done);
    })

    it("修改密码成功", function(done) {
      request(app)
        .post('/api/auth/changePassword')
        .send({
          oldPassword: '123456',
          newPassword: '12345678',
          username: 'wang'
        })
        .expect(function(res) {
          console.log(res.body)
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

    it("修改密码后, 登录成功", function(done){
      request(app)
        .post("/api/auth/login")
        .send({
          username: "wang",
          password: "12345678"
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

  });
}
