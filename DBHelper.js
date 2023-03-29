 var SqliteDB = require('./sqlite.js').SqliteDB;
 var file = "sundot.db";
 var sqliteDB = new SqliteDB(file);

 var DB = DB || {};



 var createConversationTableSql = "create table if not exists conversation(id INTEGER primary key autoincrement,senderID varchar(50),targetID varchar(50),conversationType varchar(10),msgType varchar(20),data varchar(500), sentTime INTEGER, receivedTime INTEGER,portraitUrl varchar(50), latestMessageId INTEGER,unreadMessageCount INTEGER,conversationTitle varchar(50));";
 var createMessageTableSql = "create table if not exists message(id INTEGER primary key autoincrement,senderID varchar(50),targetID varchar(50),conversationType varchar(10),msgType varchar(20),data varchar(500),sendStatus varchar(10),  sendingTime INTEGER, receiveTime INTEGER,  createTime INTEGER, messageDirection INTEGER, msguid varchar(30));";
 var createGroup_infoTableSql = "create table if not exists group_info(id INTEGER primary key autoincrement,group_id varchar(200),name varchar(200));";
 var createGroup_personsTableSql = "create table if not exists group_persons(id INTEGER primary key autoincrement,group_id varchar(200),user_id varchar(50));";





 sqliteDB.createTable(createConversationTableSql);
 sqliteDB.createTable(createMessageTableSql);
 sqliteDB.createTable(createGroup_infoTableSql);
 sqliteDB.createTable(createGroup_personsTableSql);

 
 DB.DBHelper = function () {
     
 }

 /*

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
  */
 DB.DBHelper.prototype.insertMessage = function (msg) {
     var values = [msg["fromUserId"],msg["targetId"],msg["channelType"],msg["objectName"],JSON.stringify(msg),"sending",msg["msgTimestamp"],0,msg["msgTimestamp"],"send","msguid"];
     var insertMsgSql = "INSERT INTO message VALUES (?,?,?,?,?,?,?,?,?,?,?)";
     sqliteDB.insertData(insertMsgSql, values);

 }


 exports.DBHelper = DB.DBHelper;

  // /// query data.
  // var querySql = 'select * from tiles where level = 1 and column >= 10 and column <= 11 and row >= 10 and row <=11';
  // sqliteDB.queryData(querySql, dataDeal);
  //
  // /// update data.
  // var updateSql = 'update tiles set level = 2 where level = 1 and column = 10 and row = 10';
  // sqliteDB.executeSql(updateSql);
  //
  // /// query data after update.
  // querySql = "select * from tiles where level = 2";
  // sqliteDB.queryData(querySql, dataDeal);
  // sqliteDB.close();
