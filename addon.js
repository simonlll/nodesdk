const { createTSFN, InitClient,Connect,sendByteMsg,sendQueryBytesMsg,sendPingMsg,sendDisConMsg} = require('bindings')('addon');
var protobuf = require("protobufjs");
const utf8 = require('utf8');
var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var file = "sundot.db";
var msgroot = require("./message.js");


db = new sqlite3.Database(file);
if(!fs.existsSync(file)){
    // console.log("Creating db file!");
    fs.openSync(file, 'w');
}
//-----------------------------消息回调函数-----------------------------
const callback = (msgObj) => {

    switch(msgObj.msyType){
        case 3: //返回数据类型为ServerPublishMessage, 服务器下发的聊天信息
            console.log("返回数据类型为ServerPublishMessage");

            var msg = msgroot.Message.decode(msgObj.data);
            console.log("msg is:",msg);
            console.log("msg content  is:",msg.content.toString("utf8"));
            break;

        case 4://消息到达服务器确认，返回的信息有在客户端生成的messagid, 和服务端生成的msguid，更新本地发送数据库，放入msguid,防止数据重复存储
            // console.log("返回数据类型为 PublishAckMessage");
            // console.log("PublishAckMessage is:", msgObj);

            break;

        case 6://返回数据类型为QueryAckMessage, 服务器下发的用户离线信息
            console.log("返回数据类型为QueryAckMessage");
            // console.log("QueryAckMessage is:", msgObj);
            if(msgObj.status == 0){ //PullMsg 拉取使用者7天内所有的聊天记录，protobuf对应的类型：CSQryPullMessageACK
                var messages = msgroot.CSQryPullMessageACK.decode(msgObj.data);
                for(i=0;i<messages.list.length;i++){
                    var message = messages.list[i];
                    console.log("message content byte===>",message.content);
                    console.log("msg content",message.content.toString("utf8"));                    }
            }

            if(msgObj.status == 1){ //PullHisMsg 拉取和某一个人的180天历史记录，protobuf对应的类型：CSQryPullHisMessageACK
                var messages = msgroot.CSQryPullHisMessageACK.decode(msgObj.data);
                for(i=0;i<messages.list.length;i++){
                    var message = messages.list[i];
                    console.log("message content byte===>",message.content);
                    console.log(message.content.toString("utf8"));                    }

            }


    }

};

/**
 * 生成聊天消息内容
 * @param channeltype 聊天类型 PERSON GROUP
 * @param content 消息内容
 * @param extra   附加消息内容
 * @param targetId  收消息人
 * @param msgType 消息类型： txtMsg
 * @param senderId 发消息人
 * @param msgDirection 消息方向：//SEND 1 RECEIVE 2
 * @returns {{msgTimestamp: *, fromUserId: *, objectName: *, channelType: *, msgUID: string, source: string, toUserId: *, content, messageid: number, msgDirection: *}}
 */
function getMsgContent(channeltype, content, extra,targetId, msgType,senderId,msgDirection) {
// 构造消息
    var txtContent = {
        "content": content,
        "extra": extra
    };

    //获取当前时间戳
    ts = new Date().valueOf();
    var content = {
        msgTimestamp: ts,
        fromUserId: senderId,
        objectName: msgType,
        channelType: channeltype,
        msgUID: "MsgUID",
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

    //用protobuf编码
    protobuf.load("Message.proto", function (err, root) {
        if (err)
            throw err;

        // Obtain a message type
        var AwesomeMessage = root.lookupType("CSQryPullHisMessage");

        // Decode an Uint8Array (browser) or Buffer (node) to a message
        contentbuffer = AwesomeMessage.encode(CSQryPullHisMessage).finish();

        //发送消息
        //     console.log(sendQueryBytesMsg("linbin2", contentbuffer, contentbuffer.length, "pullMsg"));

        console.log("发送查询消息结果：", sendQueryBytesMsg("linbin2", contentbuffer, contentbuffer.length, "pullHisMsg"));
    });
}

//-----------------------------发送查询消息，拉取7天内所有聊天记录 -------------------------------------
function qry7dayMsg() {
    let contentbuffer;

    //生成查询7天消息
    var CSQryPullMessage = {
        "sendBoxSyncTime": 1,
        "isPullSend": true,
        "fromUserId": "linbin2", //这个目前不起作用
        "syncTime": 0,
        "clientOs": "IOS"
    }


    //用protobuf编码
    protobuf.load("Message.proto", function (err, root) {
        if (err)
            throw err;

        // Obtain a message type
        var AwesomeMessage = root.lookupType("CSQryPullMessage");

        // Decode an Uint8Array (browser) or Buffer (node) to a message
        contentbuffer = AwesomeMessage.encode(CSQryPullMessage).finish();
        //发送消息
        console.log(sendQueryBytesMsg("linbin2", contentbuffer, contentbuffer.length, "pullMsg"));
    });
}


/**
 * 在本地数据库存储消息
 * @param content 消息内容
 * @param cb 回调函数
 */
function saveMessage(content,cb){
//存入数据库， 获取messageID  注： Message Direction: SEND(1),RECEIVE(2);
    var values = [content["fromUserId"], content["toUserId"], content["channelType"], content["objectName"], JSON.stringify(content), "sending", content["msgTimestamp"], 0, content["msgTimestamp"], "send", "msguid"];
    var insertMsgSql = "INSERT INTO message(\"senderID\", \"targetID\", \"conversationType\", \"msgType\", \"data\", \"sendStatus\",\"sendingTime\", \"receiveTime\", \"createTime\", \"messageDirection\", \"msguid\") VALUES (?,?,?,?,?,?,?,?,?,?,?)";
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
    // console.log("qryStr:",qryStr);
    // console.log("values:",values);

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
    // console.log("slectsql=",selectsql);
    // console.log("values=",values);
    db.all(selectsql, values, function (err, result) {
        if(null!=err) {
            cb(err,null);
        }
        // console.log("result=",result);
        if(result.length == 0) {//如果查询结果为空
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
    content = getMsgContent(channeltype, content, extra,targetId, msgType,senderId,msgDirection);
    saveMessage(content,function(err,result){
        //用protobuf编码
        protobuf.load("Message.proto", function (err, root) {
            if(null != null){
                console.log(err);
                return;
            }
            var contentbuffer;
            if (err)
                throw err;
            var bytecontent = new Buffer(JSON.stringify(content["content"]), 'utf8');
            content["content"] = bytecontent;

            // Obtain a message type
            var AwesomeMessage = root.lookupType("Message");

            // Decode an Uint8Array (browser) or Buffer (node) to a message
            contentbuffer = AwesomeMessage.encode(content).finish();

            //发送消息 参数1：conversation_type 1 private 3 group 参数4： msgid
            // console.log(sendByteMsg(1, "zoujia1", contentbuffer, contentbuffer.length, 1));
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
    // qryLocalHistoryMessage(timestamp, count, targetId, conversationType,"linbin2",cb);
}







function main(){

    //初始化EasyTcpClient, 和服务器建立连接
    InitClient();
    //启动接受线程，设置消息回调函数
    createTSFN(callback);
    //发送连接消息（参数是用户的token)
    Connect("AJofTYRyfPCyghUPxmshEjK/lhkVnr7w6ye/Pu9YaXvKepMyIxQxs5hXEb3vSOHpGvEE8dSemsNOI/azIuA9LOdqfsI=");

    //发送消息
    // sendMsg("PERSON","你哈","extra","zoujia1","TxtMsg","linbin2",1); //SEND 1 RECEIVE 2

    //发送ping消息
    // console.log("sendPingMsg返回结果：", sendPingMsg());

    //发送断开连接消息
    // console.log("sendDisConMsg：", sendDisConMsg());

    //发送查询字符串
    // sendQryHisMsg();
    // qry7dayMsg();
    //查询和某人的历史消息
    getHistoryMessage(0, 20, "zoujia1", "PERSON",function (err, result) {
        // console.log("getHistoryMessage result:",result);
    });

};





main();

