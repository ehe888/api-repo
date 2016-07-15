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

    // before(function(done) {
    //
    //   var test_data = [
    //     {
    //       unit_number: "11-503",
    //       property_id: 1,
    //       sys_user_id: 1
    //     },
    //     {
    //       unit_number: "12-503",
    //       property_id: 1,
    //       sys_user_id: 2
    //     },
    //     {
    //       unit_number: "A0001103A",
    //       property_id: 1,
    //       sys_user_id: 1
    //     }
    //   ]
    //
    //   db.sequelize.model("Units").bulkCreate(test_data)
    //   .then(function(instance){
    //     expect(instance).to.exist;
    //     done()
    //   })
    //   .catch(function(err) {
    //     done(err);
    //   })
    // })

    it("新建单元", function(done) {
      request(app)
        .post("/api/units/create")
        .send({
          unit_number: "A0001103E",
          property_id: 1,
          sys_user_id: 2
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
        .post("/api/units/update")
        .send({
          id:1,
          sys_user_id: 2,
          unit_number: 'test1'
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
          expect(res.body.data).to.exist;
          expect(res.body.data.sys_user_id).to.equal(2)
        })
        .end(done);
    })

    it("查询所有单元", function(done) {
      request(app)
        .post("/api/units/query")
        .send({
          unit_number: '11'
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
          expect(res.body.data).to.exist;

        })
        .end(done);
    })

  })

}
