const { createTSFN, InitClient,Connect,sendByteMsg,sendQueryBytesMsg,sendPingMsg,sendDisConMsg} = require('bindings')('addon');
var protobuf = require("protobufjs");
const utf8 = require('utf8');
var SqliteDB = require('./sqlite.js').SqliteDB;
var file = "sundot.db";
var sqliteDB = new SqliteDB(file);
//-----------------------------消息回调函数-----------------------------
const callback = (msgObj) => {

    switch(msgObj.msyType){
        case 3: //返回数据类型为ServerPublishMessage, 服务器下发的聊天信息
            console.log("返回数据类型为ServerPublishMessage");
            console.log("ServerPublishMessage is:", msgObj);
            protobuf.load("Message.proto", function(err, root) {
                if (err)
                    throw err;

                // Obtain a message type
                var AwesomeMessage = root.lookupType("Message");


                // Decode an Uint8Array (browser) or Buffer (node) to a message
                var message = AwesomeMessage.decode(msgObj.data);

                // ... do something with message

                // If the application uses length-delimited buffers, there is also encodeDelimited and decodeDelimited.

                // Maybe convert the message back to a plain object
                var object = AwesomeMessage.toObject(message, {
                    longs: String,
                    enums: String,
                    bytes: String
                    // see ConversionOptions
                });
                console.log("message:",object);
                // console.log(binayUtf8ToString(message.content,0));
                console.log(message.content.toString("utf8"));

            });
            break;

        case 4://消息到达服务器确认，返回的信息有在客户端生成的messagid, 和服务端生成的msguid，更新本地发送数据库，放入msguid,防止数据重复存储
            console.log("返回数据类型为 PublishAckMessage");
            console.log("PublishAckMessage is:", msgObj);

            break;

        case 6://返回数据类型为QueryAckMessage, 服务器下发的用户离线信息
            console.log("返回数据类型为QueryAckMessage");
            console.log("QueryAckMessage is:", msgObj);
            if(msgObj.status == 0){ //PullMsg 拉取使用者7天内所有的聊天记录，protobuf对应的类型：CSQryPullMessageACK
                protobuf.load("Message.proto", function(err, root) {
                    if (err)
                        throw err;

                    // Obtain a message type
                    var AwesomeMessage = root.lookupType("CSQryPullMessageACK");


                    // Decode an Uint8Array (browser) or Buffer (node) to a message
                    var message = AwesomeMessage.decode(msgObj.data);

                    // ... do something with message

                    // If the application uses length-delimited buffers, there is also encodeDelimited and decodeDelimited.

                    // Maybe convert the message back to a plain object
                    var object = AwesomeMessage.toObject(message, {
                        longs: String,
                        enums: String,
                        bytes: String
                        // see ConversionOptions
                    });
                    console.log("message:",object);

                });
            }

            if(msgObj.status == 1){ //PullHisMsg 拉取和某一个人的180天历史记录，protobuf对应的类型：CSQryPullHisMessageACK
                protobuf.load("Message.proto", function(err, root) {
                    if (err)
                        throw err;

                    // Obtain a message type
                    var AwesomeMessage = root.lookupType("CSQryPullHisMessageACK");


                    // Decode an Uint8Array (browser) or Buffer (node) to a message
                    var message = AwesomeMessage.decode(msgObj.data);

                    // ... do something with message

                    // If the application uses length-delimited buffers, there is also encodeDelimited and decodeDelimited.

                    // Maybe convert the message back to a plain object
                    var object = AwesomeMessage.toObject(message, {
                        longs: String,
                        enums: String,
                        bytes: String
                        // see ConversionOptions
                    });
                    console.log("message:",object);

                });
            }


    }

};

//-----------------------------生成消息内容-----------------------------
function getMsgContent(channeltype, content, extra,targetId, msgType,senderId) {
// 构造消息
    var txtContent = {
        "content": content,
        "extra": extra
    };
    var bytecontent = new Buffer(JSON.stringify(txtContent), 'utf8');

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
        content: bytecontent
    }
    return content;
}


//-----------------------------发送查询和某人180天的历史消息-------------------------------------
function sendQryHisMsg() {
    let contentbuffer;

//查询类型： pullHisMsg: 拉取180天和某人的聊天记录
    var CSQryPullHisMessage = {
        "time": 1, //拉取的时间（1970年到现在的毫秒数）
        "count": 20, //数量
        "targetId": "zoujia1", //聊天对象
        "channelType": "PERSON" //PERSON GROUP
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


//-----------------------------发送消息  -------------------------------------
function sendMsg(channeltype, content, extra,targetId, msgType,senderId) {
    var content = getMsgContent(channeltype, content, extra,targetId, msgType,senderId);

    //存入数据库， 获取messageID  注： Message Direction: SEND(1),RECEIVE(2);
    var values = [[content["fromUserId"],content["targetId"],content["channelType"],content["objectName"],JSON.stringify(content),"sending",content["msgTimestamp"],0,content["msgTimestamp"],"send","msguid"]];
    var insertMsgSql = "INSERT INTO message(\"senderID\", \"targetID\", \"conversationType\", \"msgType\", \"data\", \"sendStatus\", \"sendingTime\", \"receiveTime\", \"createTime\", \"messageDirection\", \"msguid\") VALUES (?,?,?,?,?,?,?,?,?,?,?)";
    sqliteDB.insertData(insertMsgSql,values);

    //用protobuf编码
    protobuf.load("Message.proto", function (err, root) {
        let contentbuffer;
        if (err)
            throw err;

        // Obtain a message type
        var AwesomeMessage = root.lookupType("Message");

        // Decode an Uint8Array (browser) or Buffer (node) to a message
        contentbuffer = AwesomeMessage.encode(content).finish();


        //发送消息 参数1：conversation_type 1 private 3 group 参数4： msgid
        console.log(sendByteMsg(1, "zoujia1", contentbuffer, contentbuffer.length, 1));
    });
}

function main(){
    //初始化EasyTcpClient, 和服务器建立连接
    console.log(InitClient());
    //启动接受线程，设置消息回调函数
    createTSFN(callback);
    //发送连接消息（参数是用户的token)
    console.log(Connect("AJofTYRyfPCyghUPxmshEjK/lhkVnr7w6ye/Pu9YaXvKepMyIxQxs5hXEb3vSOHpGvEE8dSemsNOI/azIuA9LOdqfsI="));

    //发送消息
    sendMsg("PERSON","你哈","extra","zoujia1","TxtMsg","linbin2");

    //发送ping消息
    // console.log("sendPingMsg返回结果：", sendPingMsg());

    //发送断开连接消息
    // console.log("sendDisConMsg：", sendDisConMsg());

    //发送查询字符串
    // setTimeout(()=>sendQryHisMsg(),2000);
    // setTimeout(()=>qry7dayMsg(),2000);

};





main();


