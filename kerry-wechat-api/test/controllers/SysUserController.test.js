let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken');


module.exports = function(app, db, config){


  describe("API平台系统后台用户", function(){

    // it("POST提交后台用户", function(done){
    //   request(app)
    //     .post("/api/sysusers/create")
    //     .send({
    //       username:'testUser1',
    //       password:'123456',
    //       email:'12345678901@qq.com',
    //       mobile:'13584936920',
    //       headimage:'',
    //       firstName:'firstName',
    //       lastName:'lastName',
    //       userType:'PROPERTY',
    //       working_property_id: 1
    //     })
    //     .expect(200)
    //     .expect(function(res){
    //       expect(res.body.success).to.be.true;
    //       expect(res.body.data).to.exist;
    //     })
    //     .end(done);
    // })
    //
    // it("POST更新后台用户", function(done){
    //   request(app)
    //     .post("/api/sysusers/update")
    //     .send({
    //       id:2,
    //       email:'12345678901@163.com',
    //       mobile:'13584936921',
    //       headimage:'',
    //       firstName:'firstNameUpdate',
    //       lastName:'lastNameUpdate',
    //     })
    //     .expect(200)
    //     .expect(function(res){
    //       expect(res.body.success).to.be.true;
    //       expect(res.body.data.username).to.equal("testUser");
    //     })
    //     .end(done);
    // })

    it("POST查询后台用户", function(done){
      request(app)
        .post("/api/sysusers/querySysUsers")
        .send({
          username: '',
          appId: 'wxa0c45fc6d9e269ed'
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body);
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

    // it("POST查询后台用户-失败", function(done){
    //   request(app)
    //     .post("/api/sysusers/querySysUsers")
    //     .send({
    //       username: '111'
    //     })
    //     .expect(200)
    //     .expect(function(res){
    //       expect(res.body.success).to.be.true;
    //       expect(res.body.data.length).to.below(1);
    //     })
    //     .end(done);
    // })
    //
    // it("GET删除后台用户", function(done){
    //   request(app)
    //     .get("/api/sysusers/delete?id=2")
    //     .expect(200)
    //     .expect(function(res){
    //       console.log(res.body.rows);
    //       expect(res.body.success).to.be.true;
    //     })
    //     .end(done);
    // })
  });
}
