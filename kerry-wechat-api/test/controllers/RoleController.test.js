let _   = require("lodash"),
    bodyParser = require("body-parser"),
  	cookieParser = require('cookie-parser'),
  	expect = require('chai').expect,
  	express = require('express'),
    request = require('supertest'),
  	should = require('chai').should,
    jwt = require('jsonwebtoken');

module.exports = function(app, db, config){


  describe("API平台系统角色管理", function(){



    // it("POST提交角色名", function(done){
    //   request(app)
    //     .post("/api/roles/create")
    //     .send({
    //       name: 'ceshiyongli',
    //       permissions:[{
    //         name:'创建角色',
    //         httpMethod:'POST',
    //         httpPath:'/^/wxapi/roles.*/'
    //       }]
    //     })
    //     .expect(200)
    //     .expect(function(res){
    //       expect(res.body.success).to.be.true;
    //       expect(res.body.data).to.exist;
    //     })
    //     .end(done);
    // })

    // it("POST更新角色", function(done){
    //   request(app)
    //     .post("/api/roles/update")
    //     .send({
    //       id:23,
    //       name:'ceshiyongli',
    //       permissions:[{
    //         name:'创建角色',
    //         httpMethod:'POST',
    //         httpPath:'/^/wxapi/roles.*/'
    //       },{
    //         name:'ALL',
    //         httpMethod:'*',
    //         httpPath:'/^/wxapi/roles.*/'
    //       }]
    //     })
    //     .expect(200)
    //     .expect(function(res){
    //       expect(res.body.success).to.be.true;
    //     })
    //     .end(done);
    // })

    // it("POST查询角色", function(done){
    //   request(app)
    //     .post("/api/roles/queryRoles")
    //     .send({
    //       name: 'test11112234'
    //     })
    //     .expect(200)
    //     .expect(function(res){
    //       console.log(res.body.data);
    //       expect(res.body.success).to.be.true;
    //       expect(res.body.data[0].name).to.equal("test11112234");
    //     })
    //     .end(done);
    // })

    // it("POST查询角色-失败", function(done){
    //   request(app)
    //     .post("/api/roles/queryRoles")
    //     .send({
    //       name: '111'
    //     })
    //     .expect(200)
    //     .expect(function(res){
    //       expect(res.body.success).to.be.true;
    //       expect(res.body.data.length).to.below(1);
    //     })
    //     .end(done);
    // })

    // it("PGET删除角色", function(done){
    //   request(app)
    //     .get("/api/roles/delete?id=18")
    //     .expect(200)
    //     .expect(function(res){
    //       expect(res.body.success).to.be.true;
    //     })
    //     .end(done);
    // })
    //
  //   it("PGET删除角色权限", function(done){
  //     request(app)
  //       .post("/api/roles/deleteRoles")
  //       .send({
  //         role_id: 1,
  //         name: "创建角色"
  //       })
  //       .expect(200)
  //       .expect(function(res){
  //         expect(res.body.success).to.be.true;
  //       })
  //       .end(done);
  //   })
  //

    it("根据角色查询用户", function(done) {
      request(app)
        .post("/api/roles/querySysUsers")
        .send({
          role_id: 1
        })
        .expect(200)
        .expect(function(res){
          console.log(res.body.data)
          expect(res.body.success).to.be.true;
        })
        .end(done);
    })

  });

}
