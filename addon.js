const { createTSFN, InitClient,Connect,sendByteMsg,sendQueryBytesMsg,sendPingMsg,sendDisConMsg} = require('bindings')('addon');
var protobuf = require("protobufjs");
const utf8 = require('utf8');
var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var file = "sundot.db";
var msgroot = require("./message.js");
var async = require('async');

var currentuser;
var connectioncallback;
db = new sqlite3.Database(file);
// db.run("CREATE TABLE conversation(id INTEGER primary key autoincrement,senderID varchar(50),targetID varchar(50),conversationType varchar(10),msgType varchar(20),data varchar(500), sentTime INTEGER, receivedTime INTEGER,portraitUrl varchar(50), latestMessageId INTEGER,unreadMessageCount INTEGER,conversationTitle varchar(50));",function (err) {
    
// });
// db.run("CREATE TABLE message(id INTEGER primary key autoincrement,senderID varchar(50),targetID varchar(50),conversationType varchar(10),msgType varchar(20),data varchar(500),sendStatus varchar(10),  sendingTime INTEGER, receiveTime INTEGER,  createTime INTEGER, messageDirection INTEGER, msguid varchar(30));",function (err) {
    
// });
if(!fs.existsSync(file)){
    // console.log("Creating db file!");
    fs.openSync(file, 'w');
}
//-----------------------------消息回调函数-----------------------------
const callback = (msgObj) => {

    switch(msgObj.msyType){
        case 2: //返回数据类型为connack,连接确认消息,读返回的消息
            console.log("返回数据类型为conActMessage");
            connectioncallback(msgObj.userId);
            break;


        case 3: //返回数据类型为ServerPublishMessage, 服务器下发的聊天信息
            console.log("返回数据类型为ServerPublishMessage");

            var message = msgroot.Message.decode(msgObj.data);

            var msgDirection = 2; // 消息方向：//SEND 1 RECEIVE 2
            var msgcontent = JSON.parse(message.content.toString("utf8"));

            var content = getMsgContent(parseInt(message.msgTimestamp),message.msgUID,message.channelType,msgcontent["content"],msgcontent["extra"],message.toUserId, message.objectName,message.fromUserId,msgDirection);
            saveMessage(content, "recceivemsg",function (err, result) {
                if(null != err){
                    console.log("recceivemsg saveMessage() err:",err );
                }
            });
            break;

        case 4://消息到达服务器确认，返回的信息有在客户端生成的messagid, 和服务端生成的msguid，更新本地发送数据库，放入msguid,防止数据重复存储
            console.log("返回数据类型为 PublishAckMessage");
            console.log("PublishAckMessage is:", msgObj);
            saveMessage(content, "pullhismsg",function (err, result) {
                if(null != err){
                    console.log("PullHisMsg saveMessage() err:",err );
                }
            });
            break;

        case 6://返回数据类型为QueryAckMessage, 服务器下发的用户离线信息
            console.log("返回数据类型为QueryAckMessage");
            if(msgObj.status == 0){ //PullMsg 拉取使用者7天内所有的聊天记录，protobuf对应的类型：CSQryPullMessageACK
                var messages = msgroot.CSQryPullMessageACK.decode(msgObj.data);
                var count = messages.list.length;
                console.log("count=",count);

                var i = 0;
                async.whilst(
                    function (cb) {
                        cb(null,i < count);
                    },
                    function(cb){
                        var message = messages.list[i];
                        //存入数据库
                        var msgDirection = 1 // 消息方向：//SEND 1 RECEIVE 2
                        if(message.toUserId == currentuser){
                            msgDirection = 2;
                        }
                        console.log("msgDirection=",msgDirection);
                        var msgcontent = JSON.parse(message.content.toString("utf8"));

                        var content = getMsgContent(parseInt(message.msgTimestamp),message.msgUID,message.channelType,msgcontent["content"],msgcontent["extra"],message.toUserId, message.objectName,message.fromUserId,msgDirection);
                        saveMessage(content, "pullhismsg",function (err, result) {
                            cb();
                            if(null != err){
                                console.log("PullHisMsg saveMessage() err:",err );
                            }
                        });
                        i++;
                    },
                    function(err){
                        console.log(err);
                    });
            }

            if(msgObj.status == 1){ //PullHisMsg 拉取和某一个人的180天历史记录，protobuf对应的类型：CSQryPullHisMessageACK
                var messages = msgroot.CSQryPullHisMessageACK.decode(msgObj.data);
                var count = messages.list.length;
                var i = 0;
                async.whilst(
                    function (cb) {
                        cb(null,i < count);
                    },
                    function(cb){
                            var message = messages.list[i];
                            //存入数据库
                            var msgDirection = 1 // 消息方向：//SEND 1 RECEIVE 2
                            if(message.toUserId == currentuser){
                                msgDirection = 2;
                            }
                            var msgcontent = JSON.parse(message.content.toString("utf8"));

                            var content = getMsgContent(parseInt(message.msgTimestamp),message.msgUID,message.channelType,msgcontent["content"],msgcontent["extra"],message.toUserId, message.objectName,message.fromUserId,msgDirection);
                            saveMessage(content, "pullhismsg",function (err, result) {
                                cb();
                                if(null != err){
                                    console.log("PullHisMsg saveMessage() err:",err );
                                }
                            });
                            i++;


                    },
                    function(err){
                        console.log(err);
                    });
            }


    }

};

/**
 * 生成聊天消息内容
 * @timestamp 时间戳
 * @msgUID 在服务器端的msgUID
 * @param channeltype 聊天类型 PERSON GROUP
 * @param content 消息内容
 * @param extra   附加消息内容
 * @param targetId  收消息人
 * @param msgType 消息类型： txtMsg
 * @param senderId 发消息人
 * @param msgDirection 消息方向：//SEND 1 RECEIVE 2
 * @returns {{msgTimestamp: *, fromUserId: *, objectName: *, channelType: *, msgUID: string, source: string, toUserId: *, content, messageid: number, msgDirection: *}}
 */
function getMsgContent(timestamp, msgUID, channeltype, content, extra,targetId, msgType,senderId,msgDirection) {
// 构造消息
    var txtContent = {
        "content": content,
        "extra": extra
    };


    var content = {
        msgTimestamp: timestamp,
        fromUserId: senderId,
        objectName: msgType,
        channelType: channeltype,
        msgUID: msgUID,
        source: "PC",
        toUserId: targetId,
        content: txtContent,
        messageid : 0,
        msgDirection : msgDirection
    }
    return content;
}


/**
 * 发送查询和某人180天的历史消息给消息服务器，pullHisMsg: 拉取180天和某人的聊天记录
 * @param timestamp 时间戳
 * @param count 拉取条数
 * @param targetId   目标id
 * @param conversationType 聊天类型：PERSON， GROUP
 */
function sendQryHisMsg(timestamp, count, targetId, conversationType) {

    let contentbuffer;

    var CSQryPullHisMessage = {
        "time": timestamp, //拉取的时间（1970年到现在的毫秒数）
        "count": count, //数量
        "targetId": targetId, //聊天对象
        "channelType": conversationType //PERSON GROUP
    }


    contentbuffer = msgroot.CSQryPullHisMessage.encode(CSQryPullHisMessage).finish();
    console.log("发送查询180天历史消息结果：", sendQueryBytesMsg("linbin2", contentbuffer, contentbuffer.length, "pullHisMsg"));



}

/**
 * 向远端服务器发送查询使用人7天以内所有的消息
 * @param sendBoxSyncTime 发件箱上次同步时间戳
 * @param isPullSend 是否拉取发送消息
 * @param fromUserId 使用人id，现在不起作用
 * @param syncTime 上次同步时间戳
 */
function sendQryMessages(sendBoxSyncTime, isPullSend,fromUserId, syncTime) {
    var contentbuffer;

    //生成查询7天消息
    var CSQryPullMessage = {
        "sendBoxSyncTime": sendBoxSyncTime,
        "isPullSend": isPullSend,
        "fromUserId": fromUserId, //这个目前不起作用
        "syncTime": syncTime,
        "clientOs": "PC"
    }

    contentbuffer = msgroot.CSQryPullMessage.encode(CSQryPullMessage).finish();
    console.log("发送查询7天历史消息结果：", sendQueryBytesMsg("linbin2", contentbuffer, contentbuffer.length, "pullMsg"));
}


/**
 * 查询会话列表
 * @param sendBoxSyncTime 发件箱同步时间戳
 * @param syncTime 同步时间戳
 * @param count 数量
 */
function getConversationList(sendBoxSyncTime, syncTime, count,cb) {
    //向远端服务器发送查询使用人7天以内所有的消息
    sendQryMessages(sendBoxSyncTime, true,"fromuserid", syncTime);
    //查询本地数据库conversation表
    qryLocalConversationList(syncTime,count,cb);

}

/**
 * 查询本地数据库conversation表，获取会话列表
 * @param timestamp
 * @param count
 * @param cb
 */
function qryLocalConversationList(timestamp,count,cb ) {
    var qryStr = "select * from conversation where (sentTime>? or receivedTime>?) order by sentTime asc limit ?";
    var values = [timestamp,timestamp,count];

    console.log("qryStr:",qryStr);
    console.log("values:",values);

    db.all(qryStr, values,function(err, rows){
        console.log("get local history message result:", rows);
        cb(null,rows);
    });

}


/**
 * 在本地数据库存储消息
 * @param content 消息内容
 * @param cb 回调函数
 * @param caller 调用者 1 sendmsg(发送消息)，2 recceimsg(收到下发消息)， 3.pullhismsg(拉取的历史消息）
 */
function saveMessage(content,caller,cb){
//存入数据库， 获取messageID  注： Message Direction: SEND(1),RECEIVE(2);
    if(content["msgDirection"] == 1&&caller =="sendmsg"){ //发送消息 1 && 来自于发送消息的调用
        var insertMsgSql = "INSERT INTO message(\"senderID\", \"targetID\", \"conversationType\", \"msgType\", \"data\", \"sendStatus\",\"sendingTime\", \"receiveTime\", \"createTime\", \"messageDirection\", \"msguid\") VALUES (?,?,?,?,?,?,?,?,?,?,?)";
        var values = [content["fromUserId"], content["toUserId"], content["channelType"], content["objectName"], JSON.stringify(content), "sending", content["msgTimestamp"], 0, content["msgTimestamp"], content["msgDirection"], "msguid"];

        db.all(insertMsgSql, values, function (err, result) {
            if(null!=err) {
                cb(err,null);
            }
            var querySql = "select max(id) as newid from message;"
            db.all(querySql, function (err, rows) {
                    if (null != err) {
                        console.log("insert err", err);
                        cb(err,null);
                    }
                    content["messageid"] = rows[0]["newid"];
                    var updateSql = "update message set data = ? where id= ?";
                    values = [JSON.stringify(content), content["messageid"]];

                    db.all(updateSql, values, function (err, result) {
                        if (null != err) {
                            console.log("update error:", err);
                            cb(err,null);
                        }
                        insert_or_update_conversation(content,cb);
                    })
                }
            )
        });
    }else if(content["msgDirection"] == 1&&caller =="pullhismsg") { //发送消息 1 && 来自于拉取的历史消息
        //先看消息是否已经在数据库里面
        var checkSql = "select * from message where msguid=? and messageDirection=? and sendStatus=?";
        var checkSqlValue = [content["msgUID"],2,"sent"];
        db.all(checkSql,checkSqlValue, function (err, rows) {
            if (null != err) {
                console.log("select err", err);
                cb(err,null);
            }
            if(rows.length == 0){//说明没有记录
                //获取当前时间戳
                ts = new Date().valueOf();
                var insertMsgSql = "INSERT INTO message(\"senderID\", \"targetID\", \"conversationType\", \"msgType\", \"data\", \"sendStatus\",\"sendingTime\", \"receiveTime\", \"createTime\", \"messageDirection\", \"msguid\") VALUES (?,?,?,?,?,?,?,?,?,?,?)";
                var values = [content["fromUserId"], content["toUserId"], content["channelType"], content["objectName"], JSON.stringify(content), "sent", content["msgTimestamp"], 0, ts, content["msgDirection"], content["msgUID"]];
                db.all(insertMsgSql,values, function (err,result) {
                    if(null != err){
                        console.log("insert err", err);
                        cb(err,null);
                    }
                    var querySql = "select max(id) as newid from message;"
                    db.all(querySql, function (err, rows) {
                        if (null != err) {
                            console.log("select err", err);
                            cb(err, null);
                        }
                        content["messageid"] = rows[0]["newid"];
                        var updateSql = "update message set data = ? where id= ?";
                        values = [JSON.stringify(content), content["messageid"]];

                        db.all(updateSql, values, function (err, result) {
                            if (null != err) {
                                console.log("update error:", err);
                                cb(err,null);
                            }
                            insert_or_update_conversation(content,cb);
                        });

                    });
                });
            }else{//说明有记录，跳过
                cb(null,null);
            }
        });

    } else if(content["msgDirection"] == 2){ //接受消息 2
        //先看消息是否已经在数据库里面
        var checkSql = "select * from message where msguid=? and messageDirection=?";
        var checkSqlValue = [content["msgUID"],2];

        db.all(checkSql,checkSqlValue, function (err, rows) {
            if (null != err) {
                console.log("select err", err);
                cb(err,null);
            }
            if(rows.length == 0){//说明没有记录
                //获取当前时间戳
                ts = new Date().valueOf();
                var insertMsgSql = "INSERT INTO message(\"senderID\", \"targetID\", \"conversationType\", \"msgType\", \"data\", \"sendStatus\",\"sendingTime\", \"receiveTime\", \"createTime\", \"messageDirection\", \"msguid\") VALUES (?,?,?,?,?,?,?,?,?,?,?)";
                var values = [content["fromUserId"], content["toUserId"], content["channelType"], content["objectName"], JSON.stringify(content), "received", content["msgTimestamp"], ts, ts, content["msgDirection"], content["msgUID"]];
                db.all(insertMsgSql,values, function (err,result) {
                    if (null != err) {
                        console.log("select err", err);
                        cb(err,null);
                    }
                    var querySql = "select max(id) as newid from message;"
                    db.all(querySql, function (err, rows) {
                        if (null != err) {
                            console.log("select err", err);
                            cb(err, null);
                        }
                        content["messageid"] = rows[0]["newid"];
                        var updateSql = "update message set data = ? where id= ?";
                        values = [JSON.stringify(content), content["messageid"]];

                        db.all(updateSql, values, function (err, result) {
                            if (null != err) {
                                console.log("update error:", err);
                                cb(err,null);
                            }
                            insert_or_update_conversation(content,cb);
                        });

                    });
                })
            }else { //跳过
                cb(null,null);
            }
        });
    }else {
        cb(null,null);
    }


}

/**
 * 获取和某人的本地数据库聊天历史记录
 * @param timestamp 时间戳
 * @param count 返回条数
 * @param targetId 某人id
 * @param conversationType 聊天类型（PERSON, GROUP)
 * @param currentUserId 当前用户
 */
function qryLocalHistoryMessage(timestamp, count, targetId, conversationType, currentUserId,cb){
    var qryStr = "select * from message";
    var values = [];
    if(conversationType == "PERSON"){
        qryStr = "select * from message where ((senderID=? and targetID=?) or (senderID=? and targetID=?)) and createTime<? order by createTime desc limit ?";
        values = [currentUserId, targetId, targetId, currentUserId, timestamp, count];
    }

    if(conversationType == "GROUP"){
        qryStr = "select * from message where (senderID=? or targetID=?) and createTime>? order by createTime desc limit ?";
        values = [targetId, targetId, timestamp, count];
    }
    console.log("qryStr:",qryStr);
    console.log("values:",values);

    db.all(qryStr, values,function(err, rows){
        // console.log("get local history message result:", rows);
        cb(null,rows);
    });

}

/**
 * 插入或更新本地数据库会话记录
 * @param content 消息内容
 * @param cb 回调函数
 */
function insert_or_update_conversation(content,cb){
    channelType = content["channelType"];
    targetID = content["toUserId"];
    senderID = content["fromUserId"];
    var selectsql = "select * from conversation where (senderID=? and targetID=?) or (senderID=? and targetID=?) and conversationType='PERSON'";
    var values = [senderID,targetID,targetID,senderID];
    if(channelType == "GROUP"){
        selectsql = "select * from conversation where (targetID=? and senderID=?) and conversationType='GROUP'";
        values = [targetID,targetID];
    }
    db.all(selectsql, values, function (err, rows) {
        if(null!=err) {
            cb(err,null);
        }
        console.log("rows=",rows);
        if(rows.length == 0) {//如果查询结果为空
            var insertOrUpdateSql = "INSERT INTO conversation( \"senderID\", \"targetID\", \"conversationType\", \"msgType\", \"data\", \"sentTime\", \"receivedTime\", \"portraitUrl\", \"latestMessageId\", \"unreadMessageCount\", \"conversationTitle\") VALUES (?,?,?,?,?,?,?,?,?,?,?)";
            var insertOrUpdatevalues = [senderID, targetID, content["channelType"], content["objectName"], JSON.stringify(content["content"]), content["msgTimestamp"], content["msgTimestamp"], "portraitUrl", content["messageid"], 0, "conversationTitle"];
            if(channelType == "GROUP") {
                insertOrUpdatevalues = [targetID, targetID, content["channelType"], content["objectName"], JSON.stringify(content["content"]), content["msgTimestamp"], content["msgTimestamp"], "portraitUrl", content["messageid"], 0, "conversationTitle"];
            }
        } else {
            insertOrUpdateSql = "update conversation set sentTime=? , receivedTime=?, msgType=?, data=?, latestMessageId=? where (senderID=? and targetID=?) or (senderID=? and targetID=?) and conversationType =?";
            insertOrUpdatevalues = [content["msgTimestamp"],content["msgTimestamp"],content["objectName"],JSON.stringify(content["content"]),content["messageid"],senderID,targetID,targetID,senderID,"PERSON"];

            if(channelType == "GROUP"){
                insertOrUpdateSql = "update conversation set sentTime=? , receivedTime=?, msgType=?, data=?, latestMessageId=? where (senderID=? and targetID=?) and conversationType =?";
                insertOrUpdatevalues = [content["msgTimestamp"],content["msgTimestamp"],content["objectName"],JSON.stringify(content["content"]),content["messageid"],targetID,targetID,"GROUP"];
            }
        }
        console.log("insertOrUpdateSql=",insertOrUpdateSql);


        db.all(insertOrUpdateSql,insertOrUpdatevalues,function(err,result){
            if(err!=null){
                cb(err,null);
            }
            cb(null,null);
        })
    });
}

/**
 * 发送消息
 * @param channeltype 聊天类型 PERSON GROUP
 * @param content 消息内容
 * @param extra   附加消息内容
 * @param targetId  收消息人
 * @param msgType 消息类型： txtMsg
 * @param senderId 发消息人
 * @param msgDirection 消息方向：//SEND 1 RECEIVE 2
 */
function sendMsg(channeltype, content, extra,targetId, msgType,senderId,msgDirection) {
    //获取当前时间戳
    ts = new Date().valueOf();
    content = getMsgContent(ts,"msgUID",channeltype, content, extra,targetId, msgType,senderId,msgDirection);
    saveMessage(content,"sendmsg",function(err,result){
        if(null != err){
            console.log(err);
        }
        insert_or_update_conversation(content,function(err,result){
            if(null != err){
                console.log(err);
            }
            var contentbuffer;
            var bytecontent = new Buffer(JSON.stringify(content["content"]), 'utf8');
            content["content"] = bytecontent;
            contentbuffer = msgroot.Message.encode(content).finish();
            //发送消息 参数1：conversation_type 1 private 3 group 参数4： msgid
            console.log(sendByteMsg(1, "zoujia1", contentbuffer, contentbuffer.length, 1));
        });

    });



}


//-------------------------获取和某人的聊天历史记录---------------------
/**
 * 获取和某人的聊天历史记录：step1：发送查询信息到远程服务器，step2：搜索本地数据库
 * @param timestamp
 * @param count
 * @param targetId
 * @param conversationType
 */
function getHistoryMessage(timestamp, count, targetId, conversationType,cb){
    sendQryHisMsg(timestamp, count, targetId, conversationType);
    qryLocalHistoryMessage(timestamp, count, targetId, conversationType,"linbin2",cb);
}


/**
 * 设置连接成功后的回调函数。只有连接成功，才能进行下面的操作
 * @param cb
 */
function setConnectCallback(cb){
    connectioncallback = cb;

}




function main(){

    //初始化EasyTcpClient, 和服务器建立连接
    InitClient();
    //启动接受线程，设置消息回调函数
    createTSFN(callback);
    //设置连接回调
    setConnectCallback(function (result) {
        currentuser = result;
        console.log("current user is:", currentuser);


        //查询和某人的历史消息
        //获取当前时间戳
        // ts = new Date().valueOf();
        // getHistoryMessage(ts, 20, "zoujia1", "PERSON",function (err, result) {
        //     console.log("getHistoryMessage result:",result);
        // });

        //查询会话列表getConversationList(sendBoxSyncTime, syncTime, count)
        getConversationList(1, 0, 20,function (err,result) {
            console.log("getConversationList result:",result);

        });


        //发送断开连接消息
        // console.log("sendDisConMsg：", sendDisConMsg());

        //发送消息
        // sendMsg("PERSON","你哈","extra","zoujia1","TxtMsg","linbin2",1); //SEND 1 RECEIVE 2

    })


    //发送连接消息（参数是用户的token)
    console.log("发送连接消息的结果",Connect("AJofTYRyfPCyghUPxmshEjK/lhkVnr7w6ye/Pu9YaXvKepMyIxQxs5hXEb3vSOHpGvEE8dSemsNOI/azIuA9LOdqfsI="));



    //发送ping消息
    // console.log("sendPingMsg返回结果：", sendPingMsg());

    //发送断开连接消息
    // console.log("sendDisConMsg：", sendDisConMsg());

    //发送查询字符串
    // sendQryHisMsg();
    // qry7dayMsg();


};





main();

