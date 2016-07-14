let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken');

module.exports = function(app, db, config){


  describe("下载微信图片素材", function(){

    // it("下载微信图片素材", function(done) {
    //   request(app)
    //     .post("/api/wechatAssets/")
    //     .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdSIsInJvbGVzIjpbIui2hee6p-eUqOaItyJdLCJ1dCI6IkNPUlAiLCJpYXQiOjE0NjgzNzM4MTIsImV4cCI6MjMzMjM3MzgxMn0.WZKKm8QeEWbvHBdyON7UA4X4eFIFffCbrl1T2sj60w8')
    //     .send({
    //       appId: 'wxa0c45fc6d9e269ed',
    //       media_id: 'aEUXzi7jhXLqmGeRpse2DvEc3UHo3HdgFAhsYDdztI4',
    //       type: 'image'
    //     })
    //     .expect(200)
    //     .expect(function(res){
    //       expect(res.body.success).to.be.true;
    //       expect(res.body.data).to.exist;
    //     })
    //     .end(done);
    // })

  })

}
