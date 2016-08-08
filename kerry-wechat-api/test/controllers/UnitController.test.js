let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken');

module.exports = function(app, db, config){


  describe("单元api", function(){

    before(function(done) {

      db.sequelize.model("Units").sync({force: true})
      .then(function(instance){
        done()
      })
      .catch(function(err) {
        done(err);
      })
    })

    it("新建单元", function(done) {
      request(app)
        .post("/api/units/create")
        .send({
          unit_number: "A00015",
          property_id: 1
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
          expect(res.body.data).to.exist;

        })
        .end(done);
    })

    it("查询单元", function(done){

      request(app)
        .post("/api/units/query")
        .send({
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

    it("更新单元管理人员", function(done){

      request(app)
        .post("/api/sysusers/updateUnits")
        .send({
          sys_user_id: 2,
          unit_id: 1
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body)
          expect(res.body.success).to.be.true;
          expect(res.body.data).to.exist;
          expect(res.body.data.sys_user_id).to.equal(2)
        })
        .end(done);
    })

    it("查询所有单元", function(done) {
      request(app)
        .post("/api/units/query_all")
        .send({
          unit_number: '11',
          appId: 'wxa0c45fc6d9e269ed'
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
          expect(res.body.data).to.exist;

        })
        .end(done);
    })

    it("新建单元2", function(done) {
      request(app)
        .post("/api/units/create")
        .send({
          unit_number: "A00010",
          property_id: 1
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
          expect(res.body.data).to.exist;

        })
        .end(done);
    })

    it("删除单元", function(done) {

      request(app)
        .post("/api/units/delete")
        .send({
          id: '1'
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })


    it("根据单元查询业主和微信用户", function(done) {

      request(app)
        .post("/api/units/queryUserBindByUnit")
        .send({
          id: 2
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body)
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

  })

}
