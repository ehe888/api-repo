
module.exports = function(models, config){
  var expect  = require('chai').expect
    ,should  = require('chai').should;

  describe("Sequelize Models", function(){
    it("成功Sync数据库", function(done){
      models.sequelize.sync({ force: false })
        .then(function(){
          console.log("Success to sync!!!")
          done();
        })
        .catch(function(err){
          done(err);
        })
    })
  })

}
