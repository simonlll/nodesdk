#ifndef _EasyTcpClient_MessageFactory_hpp_
#define _EasyTcpClient_MessageFactory_hpp_


#include "MessageHeader.hpp"
#include "MqttMessageHeader.hpp"


int messageID=0;
/**
* 构造一个connect message
* length 回传给调用方的消息总长度
* token 连接服务器的token
* clientIP 用户IP
* clientID 用户ID
*
* ------------消息类型
*  type = 1
*/
char* make_connect_message(int* length, const char* token, const char* clientIP, const char* clientId)
{
	char *buf, *ptr, *obfuscationIndex;
	ConnectMessage packet;
	int rc = SOCKET_ERROR, len;

	packet.header.byte = 0;
	packet.header.bits.type = CONNECT;
	packet.header.bits.dup = false;
	packet.header.bits.qos = 1;
	packet.header.bits.retain = true;

	//00010001
	packet.header.byte = 17;
	packet.flags.bits.hasClientIp = true;
	//packet.clientIp = "127.0.0.1";
	packet.clientIp = clientIP;
	packet.flags.bits.hasAppId = true;
	packet.appId = "10100557";
	packet.flags.bits.hasToken = true;
	//packet.token = "AJofTWsU+StU0c5Tt7J++sYq8gVmdAU+A/DJlEU9cLaBC/wj8TRK3QonNdDvSOHpGvEE8dSemsNOI/azIuA9LOdqfsI=";
	packet.token = token;
	//packet.clientId = "clientid";
	packet.clientId = clientId;
	packet.info = "platform-deviceInfo-3.2.3";
	packet.appIdentifier = "appinfo";
	packet.flags.bits.infoQoS = 0;
	packet.flags.bits.retainInfo = true;
	packet.flags.bits.hasInfo = true;
	packet.flags.bits.cleanSession = true;

	//11100111
	packet.flags.all = 231;

	len = packet.CONNECT_HEADER_SIZE;
	len += (int)strlen(packet.clientId) + 2;
	len += (int)strlen(packet.appIdentifier) + 2;
	len += (int)strlen(packet.info) + 2;
	len += (int)strlen(packet.appId) + 2;
	len += (int)strlen(packet.token) + 2;
	len += (int)strlen(packet.clientIp) + 2;
	//计算记录负载长度需要的byte位数
	int payloadlength = write_msg_length(NULL, len, NULL);
	int totallength = 1 + 1 + payloadlength + len; //header`(1), checkcode(1), 负载长度记录，负载长度



	ptr = buf = obfuscationIndex = (char*)malloc(totallength);

	//开始写入
	//写入header
	writeChar(&ptr, packet.header.byte);
	//校验位
	char* checkCodePos = ptr; //先记录校验位地址
	writeChar(&ptr, 0);
	unsigned char headerCode = packet.header.byte;
	write_msg_length(&ptr, len, &headerCode);
	writeChar(&checkCodePos, headerCode);//将计算出来checkCodePos写入到预先记录的位置
	writeUTF(&ptr, packet.protocolId);
	writeChar(&ptr, packet.protocolVersion);
	writeChar(&ptr, packet.flags.all);
	writeInt(&ptr, packet.keepAlive);
	writeUTF(&ptr, packet.clientId);
	if (packet.flags.bits.hasInfo) {
		writeUTF(&ptr, packet.appIdentifier);
		writeUTF(&ptr, packet.info);
	}
	if (packet.flags.bits.hasAppId) {
		writeUTF(&ptr, packet.appId);
	}

	if (packet.flags.bits.hasToken) {
		writeUTF(&ptr, packet.token);
	}

	if (packet.flags.bits.hasClientIp) {
		writeUTF(&ptr, packet.clientIp);
	}

	*length = totallength;

	obfuscation(obfuscationIndex, 1 + 1 + payloadlength, totallength);
	return buf;
}

/**
* 构造一个UserPublish message
* length 回传给调用方的消息总长度
* topic 消息主题： pullHisMsg 拉取某一个聊天的历史消息，最多180天 pullMsg拉取某人7天内的所有聊天信息
* targetId 返回人的id
* data protobuf协议的二进制编码数据
* dataLength protobuf协议的二进制编码的数据长度
* messageID 消息ID
*
* ------------消息类型
* type = 3
*/
char* make_userpublish_message(int* length, char* topic, char* targetId, char* data, int datalength,int messageID)
{
	char *buf, *ptr, *obfuscationIndex;
	UserPublishMessage packet;
	int rc = SOCKET_ERROR, len;

	packet.header.byte = 0;
	packet.header.bits.type = PUBLISH; //3
	packet.header.bits.dup = false;
	packet.header.bits.qos = 1;
	packet.header.bits.retain = true;

	//00110001
	packet.header.byte = 49;

	packet.topic = topic;
	packet.targetId = targetId;
	packet.signature = 255;
	packet.messageId = messageID;
	packet.data = data;

	//计算负载消息长度
	len = 2; //int messageId; 2位
	len += (int)strlen(packet.topic) + 2;
	len += (int)strlen(packet.targetId) + 2;
	len += datalength;
	len += 8; //long long signature 8位
	//计算记录负载长度需要的byte位数
	int payloadlength = write_msg_length(NULL, len, NULL);
	int totallength = 1 + 1 + payloadlength + len; //header`(1), checkcode(1), 负载长度记录，负载长度



	ptr = buf = obfuscationIndex = (char*)malloc(totallength);

	//开始写入
	//写入header
	writeChar(&ptr, packet.header.byte);
	//校验位
	char* checkCodePos = ptr; //先记录校验位地址
	writeChar(&ptr, 0);
	unsigned char headerCode = packet.header.byte;
	write_msg_length(&ptr, len, &headerCode);
	writeChar(&checkCodePos, headerCode);//将计算出来checkCodePos写入到预先记录的位置
	writeLongLong(&ptr, packet.signature);
	writeUTF(&ptr, packet.topic);
	writeUTF(&ptr, packet.targetId);
	writeInt(&ptr, packet.messageId);
	memcpy(ptr, data, datalength);


	*length = totallength;

	obfuscation(obfuscationIndex, 1 + 1 + payloadlength, totallength);
	return buf;
}

/**
* 构造一个Query message
* length 回传给调用方的消息总长度
* topic 消息主题： pullHisMsg 拉取某一个聊天的历史消息，最多180天 pullMsg拉取某人7天内的所有聊天信息
* targetId 返回人的id
* data protobuf协议的二进制编码数据
* dataLength protobuf协议的二进制编码的数据长度
* messageID 消息ID
*
* ------------消息类型
* type = 5
*/
char* make_query_message(int* length, char* topic, char* targetId, char* data, int datalength, int messageID)
{
	char *buf, *ptr, *obfuscationIndex;
	UserPublishMessage packet;
	int rc = SOCKET_ERROR, len;

	packet.header.byte = 0;
	packet.header.bits.type = QUERY; //5
	packet.header.bits.dup = false;
	packet.header.bits.qos = 1;
	packet.header.bits.retain = true;

	//01010001
	packet.header.byte = 81;

	packet.topic = topic;
	packet.targetId = targetId;
	packet.signature = 255;
	packet.messageId = messageID;
	packet.data = data;

	//计算负载消息长度
	len = 2; //int messageId; 2位
	len += (int)strlen(packet.topic) + 2;
	len += (int)strlen(packet.targetId) + 2;
	len += datalength;
	len += 8; //long long signature 8位
	//计算记录负载长度需要的byte位数
	int payloadlength = write_msg_length(NULL, len, NULL);
	int totallength = 1 + 1 + payloadlength + len; //header`(1), checkcode(1), 负载长度记录，负载长度



	ptr = buf = obfuscationIndex = (char*)malloc(totallength);

	//开始写入
	//写入header
	writeChar(&ptr, packet.header.byte);
	//校验位
	char* checkCodePos = ptr; //先记录校验位地址
	writeChar(&ptr, 0);
	unsigned char headerCode = packet.header.byte;
	write_msg_length(&ptr, len, &headerCode);
	writeChar(&checkCodePos, headerCode);//将计算出来checkCodePos写入到预先记录的位置
	writeLongLong(&ptr, packet.signature);
	writeUTF(&ptr, packet.topic);
	writeUTF(&ptr, packet.targetId);
	writeInt(&ptr, packet.messageId);
	memcpy(ptr, data, datalength);


	*length = totallength;
	//混淆
	obfuscation(obfuscationIndex, 1 + 1 + payloadlength, totallength);
	return buf;
}

/*
*  构造一个断开连接的消息
* length 回传给调用方的消息总长度
*
* ------------消息类型
* type = 14
*/
char* make_disconnect_message(int* length, int disconnectStatus)
{
	char *buf, *ptr, *obfuscationIndex;
	DisconnectMessage packet;
	int rc = SOCKET_ERROR, len;

	packet.header.byte = 0;
	packet.header.bits.type = DISCONNECT; //14
	packet.header.bits.dup = false;
	packet.header.bits.qos = 1;
	packet.header.bits.retain = true;

	//11100001
	packet.header.byte = 225;

	packet.status = (enum disConnectionStatus)disconnectStatus;
	//计算负载消息长度
	len = 2; //只有一个disconnectStatus
	//计算记录负载长度需要的byte位数
	int payloadlength = write_msg_length(NULL, len, NULL);
	int totallength = 1 + 1 + payloadlength + len; //header`(1), checkcode(1), 负载长度记录，负载长度

	ptr = buf = obfuscationIndex = (char*)malloc(totallength);

	//开始写入
	//写入header
	writeChar(&ptr, packet.header.byte);
	//校验位
	char* checkCodePos = ptr; //先记录校验位地址
	writeChar(&ptr, 0);
	unsigned char headerCode = packet.header.byte;
	write_msg_length(&ptr, len, &headerCode);
	writeChar(&checkCodePos, headerCode);//将计算出来checkCodePos写入到预先记录的位置
	writeChar(&ptr, 0);

	switch (disconnectStatus) {
		case RECON:
			writeChar(&ptr, 0);
			break;
		case OTHER_DEVICE_LOGIN:
			writeChar(&ptr, 1);
			break;
		case CLOSURE:
			writeChar(&ptr, 2);
			break;
		case LOGOUT:
			writeChar(&ptr, 4);
			break;
		case BLOCK:
			writeChar(&ptr, 5);
			break;
	}
	*length = totallength;

	obfuscation(obfuscationIndex, 1 + 1 + payloadlength, totallength);
	return buf;
}

/*
*  构造一个pingreq请求消息
* length 回传给调用方的消息总长度
*
* ------------消息类型
* type = 12
*/
char* make_pingreq_message(int* length)
{
	char *buf, *ptr;
	PingreqMessage packet;
	int rc = SOCKET_ERROR, len;

	packet.header.byte = 0;
	packet.header.bits.type = PINGREQ; //12
	packet.header.bits.dup = false;
	packet.header.bits.qos = 1;
	packet.header.bits.retain = true;

	//11000001
	packet.header.byte = 193;

	//计算负载消息长度
	len = 0; //
	//计算记录负载长度需要的byte位数
	int payloadlength = write_msg_length(NULL, len, NULL);
	int totallength = 1 + 1 + payloadlength + len; //header`(1), checkcode(1), 负载长度记录，负载长度

	ptr = buf = (char*)malloc(totallength);

	//开始写入
	//写入header
	writeChar(&ptr, packet.header.byte);
	//校验位
	char* checkCodePos = ptr; //先记录校验位地址
	writeChar(&ptr, 0);
	unsigned char headerCode = packet.header.byte;
	write_msg_length(&ptr, len, &headerCode);
	writeChar(&checkCodePos, headerCode);//将计算出来checkCodePos写入到预先记录的位置

	*length = totallength;
	return buf;
}

/*
*  构造一个pingresp请求返回消息
* length 回传给调用方的消息总长度
*
* ------------消息类型
* type = 13
*/
char* make_pingresp_message(int* length)
{
	char *buf, *ptr;
	PingreqMessage packet;
	int rc = SOCKET_ERROR, len;

	packet.header.byte = 0;
	packet.header.bits.type = PINGRESP; //13
	packet.header.bits.dup = false;
	packet.header.bits.qos = 1;
	packet.header.bits.retain = true;

	//11010001
	packet.header.byte = 209;

	//计算负载消息长度
	len = 0; //
	//计算记录负载长度需要的byte位数
	int payloadlength = write_msg_length(NULL, len, NULL);
	int totallength = 1 + 1 + payloadlength + len; //header`(1), checkcode(1), 负载长度记录，负载长度

	ptr = buf = (char*)malloc(totallength);

	//开始写入
	//写入header
	writeChar(&ptr, packet.header.byte);
	//校验位
	char* checkCodePos = ptr; //先记录校验位地址
	writeChar(&ptr, 0);
	unsigned char headerCode = packet.header.byte;
	write_msg_length(&ptr, len, &headerCode);
	writeChar(&checkCodePos, headerCode);//将计算出来checkCodePos写入到预先记录的位置

	*length = totallength;
	return buf;
}

int getMessageId(){

    if (messageID >= 65535) {
        messageID = 1;
    }
    return ++messageID;
}

void setMessageId(int id){
	messageID = id;
}

#endif
