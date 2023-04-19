const { createTSFN, InitClient,Connect,sendByteMsg,sendQueryBytesMsg,sendPingMsg,sendDisConMsg,setConStatusListener} = require('bindings')('addon');
const utf8 = require('utf8');
var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var file = "sundot.db";
var msgroot = require("./message.js");
var async = require('async');
//是否需要初始化数据库表，当数据库初次创建时为真
var initDB = false;

//当前用户
var currentuser;
//连接回调
var connectioncallback;
//消息监听器
var messageListener;

if(!fs.existsSync(file)){
    // console.log("Creating db file!");
    fs.openSync(file, 'w');
    initDB = true;
}

db = new sqlite3.Database(file);

//当数据库初次创建时，运行创建表：conversation, message
if(initDB){
    console.log("第一次运行，创建数据库相关表")
    //会话表
    db.run("CREATE TABLE conversation(id INTEGER primary key autoincrement,senderID varchar(50),targetID varchar(50),conversationType varchar(10),msgType varchar(20),data varchar(500), sentTime INTEGER, receivedTime INTEGER,portraitUrl varchar(50), latestMessageId INTEGER,unreadMessageCount INTEGER,conversationTitle varchar(50)),isTop INTEGER;",
        function (err,ret) {
            if(err!=null){
                console.log("创建 conversation 表失败",err);
            } else {
                console.log("创建 conversation 表成功");
            }
    });
    //消息表
    db.run("CREATE TABLE message(id INTEGER primary key autoincrement,senderID varchar(50),targetID varchar(50),conversationType varchar(10),msgType varchar(20),data varchar(500),sendStatus varchar(10),  sendingTime INTEGER, receiveTime INTEGER,  createTime INTEGER, messageDirection INTEGER, msguid varchar(30));",
        function (err,ret) {
            if(err!=null){
                console.log("创建 message 表失败",err);
            } else {
                console.log("创建 message 表成功");
            }
    });

    //群信息表
    db.run("CREATE TABLE group_info(id INTEGER primary key autoincrement,group_id varchar(200),name varchar(200));",
        function (err,ret) {
            if(err!=null){
                console.log("创建 group_info 表失败",err);
            } else {
                console.log("创建 group_info 表成功");
            }
    });


    //群成员表
    db.run("CREATE TABLE group_persons(id INTEGER primary key autoincrement,group_id varchar(200),user_id varchar(50));",
        function (err,ret) {
            if(err!=null){
                console.log("创建 group_persons 表失败",err);
            } else {
                console.log("创建 group_persons 表成功");
            }
    });
}

/**
 * 定义消息回调函数
 */
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
            messageListener(content);
            saveMessage(content, "recceivemsg",function (err, result) {
                if(null != err){
                    console.log("recceivemsg saveMessage() err:",err );
                }
            });
            break;

        case 4://消息到达服务器确认，返回的信息有在客户端生成的messagid, 和服务端生成的msguid，更新本地发送数据库，放入msguid,防止数据重复存储
            console.log("返回数据类型为 PublishAckMessage");
            console.log("PublishAckMessage is:", msgObj);
            //使用发送消息在数据库中的id,以便更新数据库中消息的发送状态从 'sending' 到 'sent', 并将msguid字段更新成服务器返回的msguid
            var updateSql = "update message set sendStatus = ? , msguid = ? where id= ?";
            var values = ["sent",  msgObj["msgId"], msgObj["messageId"]];
            console.log("updateSql",updateSql);
            console.log("values",values);
            db.all(updateSql, values, function (err, result) {
                if (null != err) {
                    console.log("update error:", err);
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
        if(rows.length == 0) {//如果查询结果为空,插入新会话
            var unreadMessageCount = 0;
            if(content["msgDirection"] == 2){ //接收消息
                unreadMessageCount = 1; //未读消息设为1
            }
            var insertOrUpdateSql = "INSERT INTO conversation( \"senderID\", \"targetID\", \"conversationType\", \"msgType\", \"data\", \"sentTime\", \"receivedTime\", \"portraitUrl\", \"latestMessageId\", \"unreadMessageCount\", \"conversationTitle\", \"isTop\") VALUES (?,?,?,?,?,?,?,?,?,?,?,?)";
            var insertOrUpdatevalues = [senderID, targetID, content["channelType"], content["objectName"], JSON.stringify(content["content"]), content["msgTimestamp"], content["msgTimestamp"], "portraitUrl", content["messageid"], unreadMessageCount, "conversationTitle",0];
            if(channelType == "GROUP") {
                insertOrUpdatevalues = [targetID, targetID, content["channelType"], content["objectName"], JSON.stringify(content["content"]), content["msgTimestamp"], content["msgTimestamp"], "portraitUrl", content["messageid"], unreadMessageCount, "conversationTitle",0];
            }
        } else {//更新已有会话

            //获取数据库现有的未读消息
            var unreadMessageCount = content["messageid"] = rows[0]["unreadMessageCount"];
            if(content["msgDirection"] == 2){ //如果是接收消息
                unreadMessageCount++; //将未读消息+1
            }
            insertOrUpdateSql = "update conversation set sentTime=? , receivedTime=?, msgType=?, data=?, latestMessageId=?, unreadMessageCount=？where (senderID=? and targetID=?) or (senderID=? and targetID=?) and conversationType =?";
            insertOrUpdatevalues = [content["msgTimestamp"],content["msgTimestamp"],content["objectName"],JSON.stringify(content["content"]),content["messageid"],unreadMessageCount, senderID,targetID,targetID,senderID,"PERSON"];


            if(channelType == "GROUP"){
                insertOrUpdateSql = "update conversation set sentTime=? , receivedTime=?, msgType=?, data=?, latestMessageId=?, unreadMessageCount=？  where (senderID=? and targetID=?) and conversationType =?";
                insertOrUpdatevalues = [content["msgTimestamp"],content["msgTimestamp"],content["objectName"],JSON.stringify(content["content"]),content["messageid"],unreadMessageCount,targetID,targetID,"GROUP"];
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
            console.log(sendByteMsg(1, "zoujia1", contentbuffer, contentbuffer.length, content["messageid"]));
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
 * 设置发送token后，与im服务器成功建立连接，连接成功后的回调函数。回调参数：返回token对应的用户id
 * @param cb
 */
function setConnectCallback(cb){
    console.log("发送token，与im服务器成功建立连接后，运行回调函数，返回的是token对应的用户名");
    connectioncallback = cb;

}

/**
 * 设置消息监听器
 * @param cb
 */
function setMessageListener(cb){
    console.log("设置消息接听器");
    messageListener = cb;
}

/**
 * 启动接收线程
 */
function startReceiveThread(){
    console.log("启动接收线程。。。");
    //启动接受线程，参数是消息回调函数
    createTSFN(callback);
}


/**
 * 清除某个会话中的未读消息数(未测试）
 * @param targetId 目标ID
 * @param conversationType 会话类型 'GROUP' 'PERSON'
 * @param cb 数据库操作回调函数
 */
function clearMessagesUnreadStatus(targetId, channelType,cb){
    targetID = targetId;
    senderID = "linbin2"; //TODO 因为没有Wi-Fi，暂时使用"linbin2",只有改成 currentuser
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
        if(rows.length > 0) {//如果查询结果不为空,说明有会话记录，将未读消息数量设为0
            insertOrUpdateSql = "update conversation set unreadMessageCount=? where (senderID=? and targetID=?) or (senderID=? and targetID=?) and conversationType =?";
            insertOrUpdatevalues = [0,senderID,targetID,targetID,senderID,"PERSON"];


            if(channelType == "GROUP"){
                insertOrUpdateSql = "update conversation set  unreadMessageCount=? where (senderID=? and targetID=?) and conversationType =?";
                insertOrUpdatevalues = [0,targetID,targetID,"GROUP"];
            }


            db.all(insertOrUpdateSql,insertOrUpdatevalues,function(err,result){
                if(err!=null){
                    cb(err,null);
                }
                cb(null,null);
            })
        }
    });
}

/**
 * 从本地存储中删除会话(此方法会从本地存储中删除该会话，但是不会删除会话中的消息)
 * @param targetId
 * @param channelType
 * @param cb
 */
function removeConversation(targetId, channelType,cb){
    targetID = targetId;
    senderID = "linbin2"; //TODO 因为没有Wi-Fi，暂时使用"linbin2",只有改成 currentuser
    var delsql = "delete from conversation where (senderID=? and targetID=?) or (senderID=? and targetID=?) and conversationType='PERSON'";
    var values = [senderID,targetID,targetID,senderID];
    if(channelType == "GROUP"){
        delsql = "delete from conversation where (targetID=? and senderID=?) and conversationType='GROUP'";
        values = [targetID,targetID];
    }
    db.all(delsql, values, function (err, ret) {
        if(null!=err) {
            cb(err,null);
        }
        cb(null,null);
    });
}

/**
 * 设置会话的置顶状态
 * @param targetId
 * @param channelType
 * @param istop
 * @param cb
 */
function setConversationToTop(targetId, channelType,istop,cb){
    targetID = targetId;
    senderID = "linbin2"; //TODO 因为没有Wi-Fi，暂时使用"linbin2",只有改成 currentuser
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
        if(rows.length > 0) {//如果查询结果不为空,说明有会话记录，设置会话置顶字段
            insertOrUpdateSql = "update conversation set isTop=? where (senderID=? and targetID=?) or (senderID=? and targetID=?) and conversationType =?";
            insertOrUpdatevalues = [istop,senderID,targetID,targetID,senderID,"PERSON"];


            if(channelType == "GROUP"){
                insertOrUpdateSql = "update conversation set  isTop=? where (senderID=? and targetID=?) and conversationType =?";
                insertOrUpdatevalues = [0,targetID,targetID,"GROUP"];
            }


            db.all(insertOrUpdateSql,insertOrUpdatevalues,function(err,result){
                if(err!=null){
                    cb(err,null);
                }
                cb(null,null);
            })
        }
    });
}

//导出初始化客户端
module.exports.InitClient = InitClient;
//启动接收线程
module.exports.startReceiveThread = startReceiveThread;
//导出设置消息监听器
module.exports.setMessageListener = setMessageListener;
//设置连接状态监听器
module.exports.setConStatusListener = setConStatusListener;
//设置发送token后，与im服务器成功建立连接，连接成功后的回调函数。回调参数：返回token对应的用户id
module.exports.setConnectCallback = setConnectCallback;
//发送token给im服务器进行验证
module.exports.Connect = Connect;
//发送心跳消息
module.exports.sendPingMsg = sendPingMsg;
//发送断开连接消息
module.exports.sendDisConMsg = sendDisConMsg;
//清除某个会话中的未读消息数(已测试）
module.exports.clearMessagesUnreadStatus = clearMessagesUnreadStatus;
//从本地存储中删除会话(此方法会从本地存储中删除该会话，但是不会删除会话中的消息)(已测试）
module.exports.removeConversation = removeConversation;
//设置会话的置顶状态（已测试）
module.exports.setConversationToTop = setConversationToTop;


