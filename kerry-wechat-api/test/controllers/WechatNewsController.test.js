let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken'),
    xml2js = require('xml2js');

module.exports = function(app, db, config){


  describe("API平台群发图文消息", function(){

    it("群发合并图文消息", function(done){
      request(app)
        .post("/api/wechatNews/combineNews")
        .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdSIsInJvbGVzIjpbIui2hee6p-eUqOaItyJdLCJ1dCI6IkNPUlAiLCJpYXQiOjE0NzAyMTcxMjMsImV4cCI6MjMzNDIxNzEyM30.0ykWEKZ92460grn2UmU6sR3LkY0xsP5quk89HrTTdlY')
        .send({
          "news_item":[{
              "title":"測試素材",
              "thumb_media_id":"R8F_GY4AsIfZYJtZoXcu8mHZiiY0A6AAFQOC_bUm47I",
              "author":"自己",
              "digest":"測試的圖文消息",
              "show_cover_pic":"1",
              "content":"111111111111111111111111",
              "content_source_url":"1111111111"
          }],
          "appId": "wxa0c45fc6d9e269ed"
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body);
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

    it("群发单个图文消息", function(done){
      request(app)
        .post("/api/wechatNews/singleNews")
        .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzdSIsInJvbGVzIjpbIui2hee6p-eUqOaItyJdLCJ1dCI6IkNPUlAiLCJpYXQiOjE0NzAyMTcxMjMsImV4cCI6MjMzNDIxNzEyM30.0ykWEKZ92460grn2UmU6sR3LkY0xsP5quk89HrTTdlY')
        .send({
          media_id: "aEUXzi7jhXLqmGeRpse2Dk0SwE1vZTWyplg2GhEASKM",
          content: {
            "news_item":[{
                "title":"測試素材",
                "thumb_media_id":"R8F_GY4AsIfZYJtZoXcu8mHZiiY0A6AAFQOC_bUm47I",
                "author":"自己",
                "digest":"測試的圖文消息",
                "show_cover_pic":"1",
                "content":"111111111111111111111111",
                "content_source_url":"1111111111"
            }]
          },
          "appId": "wxa0c45fc6d9e269ed"
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body);
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

  });
}
