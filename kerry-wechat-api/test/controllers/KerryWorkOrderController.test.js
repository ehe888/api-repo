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
        db.sequelize.model("KerryWorkOrderLine").sync({force: false})
      })
      .then(function() {
        done()
      })
    })

    it("POST提交工单", function(done){
      request(app)
        .post("/api/workOrder/create")
        .send()
        .expect(200)
        .expect(function(res){
          console.log(res.body)
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })


  });
}
