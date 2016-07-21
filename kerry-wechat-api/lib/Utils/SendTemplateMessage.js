var rp = require('request-promise')

var SendTemplateMessage = function(openids, content, template_id, url, topcolor, access_token, app_id, host,callback) {

  var index = 0;

  sendMessage(function() {
    callback();
  })

  function sendMessage(callback) {
    if (index >= openids.length) {
      return callback();
    }
    var openid = openids[index];
    index++;
    var data = {
      openid: openid,
      template_id: template_id,
      url: url || "",
      data: content,
      topcolor: topcolor?topcolor:"#FF0000"
    }

    var option = {
      method: 'POST',
      uri: host+'/wxapi/template/send?app_id='+app_id,
      body: data,
      headers: {
        authorization: 'Bearer '+access_token
      },
      json: true
    }
    console.log(option)
    rp(option)
      .then(function(result) {
        console.log("========================")
        console.log(result);
        if (!result.success) {
          console.error(result)
        }
        console.log("==========================")
        sendMessage(callback);
      })
      .catch(function(err){
        console.error(err);
        sendMessage(callback);
      })
  }

}


module.exports = SendTemplateMessage;
