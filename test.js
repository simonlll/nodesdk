var addon = require("./addon.js");

//初始化EasyTcpClient, 和服务器建立连接
// console.log("初始化，开始与服务器建立连接。。。");
//初始化EasyTcpClient, 和服务器建立连接
// var ret = addon.InitClient();
//如果返回值为-1，说明socket连接失败
// if(ret == -1){
//     console.log("socket连接失败，退出程序")
//     return;
// }

//启动接收线程，参数是消息回调函数
// addon.startReceiveThread();

//设置消息监听器
// addon.setMessageListener(function (msg) {
//     console.log("收到消息:", msg);
// });

//设置连接状态监听器
// addon.setConStatusListener(function(conStatus){
//     console.log("网络连接断开错误代码:", conStatus.errorcode);
// });

//设置连接回调,目前只有一个事件，当使用token与im服务器成功连接上时
// addon.setConnectCallback(function onConnected(result) {
//     currentuser = result;
//     //打印im服务器返回的当前用户名
//     console.log("current user is:", currentuser);
//
//
//     //查询和某人的历史消息
//     //获取当前时间戳
//     // ts = new Date().valueOf();
//     // getHistoryMessage(ts, 20, "zoujia1", "PERSON",function (err, result) {
//     //     console.log("getHistoryMessage result:",result);
//     // });
//
//     //查询会话列表getConversationList(sendBoxSyncTime, syncTime, count)
//     // getConversationList(1, 0, 20,function (err,result) {
//     //     console.log("getConversationList result:",result);
//     //
//     // });
//
//
//     //发送断开连接消息
//     // console.log("sendDisConMsg：", sendDisConMsg());
//
//     //发送消息
//     // sendMsg("PERSON","你哈","extra","zoujia1","TxtMsg","linbin2",1); //SEND 1 RECEIVE 2
// });

//发送连接消息（参数是用户的token),如果连接消息正常发送出去了，应当返回174（连接消息的长度）
// console.log("发送连接消息的结果",addon.Connect("AJofTYRyfPCyghUPxmshEjK/lhkVnr7w6ye/Pu9YaXvKepMyIxQxs5hXEb3vSOHpGvEE8dSemsNOI/azIuA9LOdqfsI="));


//发送ping消息
// console.log("sendPingMsg返回结果：", addon.sendPingMsg());


//发送断开连接消息
// console.log("sendDisConMsg返回结果：", addon.sendDisConMsg());

//清除某个会话中的未读消息数(未测试）
// addon.clearMessagesUnreadStatus("zoujia1","PERSON",function (err,ret) {
//     if(err != null){
//         console.log("清除某个会话中的未读消息数,数据库操作报错：", err);
//     }
// });

//从本地存储中删除会话(此方法会从本地存储中删除该会话，但是不会删除会话中的消息)
// addon.removeConversation("zoujia1","PERSON",function (err,ret) {
//     if(err != null){
//         console.log("从本地存储中删除会话,数据库操作报错：", err);
//     }
// });

//设置会话的置顶状态
// addon.setConversationToTop("zoujia1","PERSON",0,function (err,ret) {
//     if(err != null){
//         console.log("设置会话的置顶状态,数据库操作报错：", err);
//     }
// });