let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken');

module.exports = function(app, db, config){

  describe("API平台系统查询业主", function(){

    before(function(done){
      db.sequelize.model("KerryUsers")
      .sync({force: false})
      .then(function() {
        done()
      })

    })

    var id
    it("创建业主", function(done) {
      var now = new Date();
      request(app)
        .post("/api/user_settings/create")
        .send({
          name: 'test',
          mobile: '15111111111',
          sex:'male',
          reg_code: '1234567890',
          unit_desc: 'test',
          appId: 'shanghai',
          identity_no:'3102193818293821',
          email:'test@testcomplete.com',
          emergency_contact:'chenadaitest',
          emergency_mobile:'13948271823',
          expire_date: now
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
          id = res.body.data.id
        })
        .end(done);
    })

    it("查询业主", function(done){

      request(app)
        .post("/api/user_settings/query")
        .send({
          name: '',
          offset: 0,
          limit: 2,
          appId: 'wxa0c45fc6d9e269ed'
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body)
          expect(res.body.success).to.be.true;
          expect(res.body.data).to.exist;
        })
        .end(done);
    })

    it("更新不存在的业主", function(done){

      request(app)
        .post("/api/user_settings/update")
        .send({
          id: 100,
          expire_date: (new Date())
        })
        .expect(404)
        .expect(function(res){
          console.log(res.body)
          expect(res.body.success).to.be.false;
        })
        .end(done);
    })

    it("更新业主", function(done){
      var now = new Date()
      request(app)
        .post("/api/user_settings/update")
        .send({
          id: id,
          expire_date: now,
          name: 'update name',
          mobile: '99999',
          sex:'female',
          identity_no:'3102193818293821',
          email:'test@testcomplete.com',
          emergency_contact:'chenadaitest',
          emergency_mobile:'13948271823'
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

    it("删除业主", function(done){
      var now = new Date()
      request(app)
        .post("/api/user_settings/delete_bind")
        .send({
          id: id
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })




  })

}
