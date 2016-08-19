let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken');

module.exports = function(app, db, config){


  describe("维修工单", function(){

    before(function(done) {
      db.sequelize.model("KerryWorkOrder").sync({force: false})
      .then(function() {
        return db.sequelize.model("KerryWorkOrderLine").sync({force: false})
      })
      .then(function() {
        return db.sequelize.model("KerryWorkOrderComment").sync({force: false})
      })
      .then(function() {
        done()
      })
    })

    it("POST提交工单", function(done){
      request(app)
        .post("/api/workOrder/create")
        .send({
          unit_id: 2,
          title: '灯坏了',
          wechat_user_id: 'wechat_ossPrw6Uu6gK69mwwyv151LbPgJE'
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body)
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

    it("POST查询工单", function(done){
      request(app)
        .post("/api/workOrder/query")
        .send({
          appId: 'shanghai'
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body)
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

  });
}
