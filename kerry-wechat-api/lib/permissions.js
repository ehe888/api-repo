"use strict"

module.exports = [
    {
      name: "ALL",
      httpMethod: "*",
      httpPath: "^\/.*"
    },
    {
      name: "创建户号",
      httpMethod: "POST",
      httpPath: "^\/api\/units.*"
    },
    {
      name: "查询户号",
      httpMethod: "POST",
      httpPath: "^\/api\/units(\/query|\/query_all)"
    },
    {
      name: "物流操作",
      httpMethod: "POST",
      httpPath: "^\/api\/delivery.*"
    },
    {
      name: "消息操作",
      httpMethod: "POST",
      httpPath: "^\/api\/pushMessage.*"
    },
    {
      name: "公告操作",
      httpMethod: "POST",
      httpPath: "^\/api\/billboards.*"
    },
    {
      name: "图文消息",
      httpMethod: "POST",
      httpPath: "^\/api\/news.*"
    },
    {
      name: "账单查询",
      httpMethod: "POST",
      httpPath: "^\/api(\/propertyBills\/queryPropertyBills|\/propertyBills\/queryUserBills)"
    },
    {
      name: "账单创建",
      httpMethod: "POST",
      httpPath: "^\/api(\/propertyBills.*|\/propertyBillLines.*)"
    },
    {
      name: "业主操作",
      httpMethod: "POST",
      httpPath: "^\/api\/user_settings.*"
    },
    {
      name: "查询意见",
      httpMethod: "POST",
      httpPath: "^\/api\/suggestions.*"
    },
    {
      name: "微信用户操作",
      httpMethod: "POST",
      httpPath: "^\/api\/wechatUsers.*"
    },
    {
      name: "微信菜单与消息操作",
      httpMethod: "POST",
      httpPath: "^(\/api\/wechatAssets.*|\/wxapi.*)"
    },
    {
      name: "个人中心",
      httpMethod: "POST",
      httpPath: "^\/api(\/auth.*|\/sysusers\/deleteUnit|\/sysusers\/updateUnits)"
    },
    {
      name: "查询物业管家",
      httpMethod: "POST",
      httpPath: "^\/api\/sysuser"
    }

]
