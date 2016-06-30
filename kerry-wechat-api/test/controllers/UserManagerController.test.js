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

    it("查询业主", function(done){

      var test_data = [
        {
          name: 'test1',
          openid: '12345635',
          mobile: '123457674444',
          reg_code: '5555355',
          bind_date: (new Date())
        },
        {
          name: 'test2',
          openid: '12563',
          mobile: '12322454444',
          reg_code: '5325555',
          bind_date: (new Date())
        },
        {
          name: 'test3',
          openid: '1263',
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

        request(app)
          .post("/api/user_settings/query")
          .send({
            name: '',
            offset: 2,
            limit: 2
          })
          .expect(200)
          .expect(function(res){
            console.log(res.body)
            expect(res.body.success).to.be.true;
            expect(res.body.data).to.exist;
            expect(res.body.data.length).to.equal(2);
            expect(res.body.count).to.equal(4);
            expect(res.body.data[0].id).to.equal(3);
          })
          .end(done);

      })
      .catch(function(err) {
        done();
      })


    })
  })

}
