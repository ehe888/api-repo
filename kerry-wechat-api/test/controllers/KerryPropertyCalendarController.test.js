let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken');

module.exports = function(app, db, config){

  describe("API平台系统创建公告", function(){

    before(function(done) {
      db.sequelize.model("KerryProperty").findOne({
        where: {
          app_id: 'shanghai'
        }
      })
      .then(function(property) {
        expect(property).to.exist;
        db.sequelize.model("KerryCalendar").sync({force: true})
        .then(function() {
          console.log("KerryCalendar sync success!!")
          done();
        })
        .catch(function(error) {
          console.error('KerryCalendar sync error: ' , error);
          done(error)
        })

      })
      .catch(function(error) {
        console.error("find property error: ", error);
        done(error)
      })
    })

    it("查询今天是否是假期成功", (done) => {
      request(app)
        .post("/api/calendar/check")
        .send({
          appId: 'shanghai'
        })
        .expect((res) => {
          var result = res.body
          console.log(res.body)
          expect(result.success).to.be.true
        })
        .end(done)
    })

    var calendar_id
    it("创建假期成功", (done)=> {
      var now = new Date()
      request(app)
        .post("/api/calendar/create")
        .send({
          appId: 'shanghai',
          vacationDate: now,
          desc: '中秋节'
        })
        .expect(200)
        .expect((res) => {
          var result = res.body
          console.log(res.body)
          expect(result.success).to.be.true
          calendar_id = result.data.id
        })
        .end(done)
    })

    it("查询假期成功", (done)=> {
      request(app)
        .post("/api/calendar/query")
        .send({
          appId: 'shanghai'
        })
        .expect((res) => {
          var result = res.body
          console.log(res.body)
          expect(result.success).to.be.true
        })
        .end(done)
    })

    it("查询今天是否是假期成功", (done) => {
      request(app)
        .post("/api/calendar/check")
        .send({
          appId: 'shanghai'
        })
        .expect((res) => {
          var result = res.body
          console.log(res.body)
          expect(result.success).to.be.true
        })
        .end(done)
    })

    it("删除假期成功", (done)=> {
      request(app)
        .post("/api/calendar/delete")
        .send({
          calendar_id: calendar_id
        })
        .expect(200)
        .expect((res) => {
          var result = res.body
          console.log(res.body)
          expect(result.success).to.be.true
        })
        .end(done)
    })

  })
}
