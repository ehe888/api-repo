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
      var test_data = [
        {
          name: 'test1',
          mobile: '123457674444',
          reg_code: '5555355',
          bind_date: (new Date())
        },
        {
          name: 'test2',
          mobile: '12322454444',
          reg_code: '5325555',
          bind_date: (new Date())
        },
        {
          name: 'test3',
          mobile: '1235454444',
          reg_code: '551555',
          bind_date: (new Date())
        },
        {
          name: 'test4',
          openid: '1563',
          mobile: '1234544434',
          reg_code: '555355',
          bind_date: (new Date())
        }
      ]

      db.sequelize.model("Users").bulkCreate(test_data)
      .then(function(instance){
        expect(instance).to.exist;
        done()
      })
      .catch(function(err) {
        done(err);
      })
    });

    it("查询业主", function(done){

      request(app)
        .post("/api/user_settings/query")
        .send({
          name: '',
          offset: 2,
          limit: 2
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body.data)
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

    it("更新业主到期时间", function(done){
      var now = new Date()
      request(app)
        .post("/api/user_settings/update")
        .send({
          id: 1,
          expire_date: now
        })
        .expect(200)
        .expect(function(res){
          expect(res.body.success).to.be.true;
          expect(new Date(res.body.data.expire_date).getTime()).to.equal(now.getTime())
        })
        .end(done);
    })


  })

}
