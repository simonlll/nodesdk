#ifndef _MqttMessageHeader_hpp_
#define _MqttMessageHeader_hpp_
#if defined(__linux__)
#include <endian.h>
#if __BYTE_ORDER == __BIG_ENDIAN
#define REVERSED 1
#endif
#endif

enum ConnectionStatus
{
    ACCEPTED,
    IDENTIFIER_REJECTION
};

//消息头
typedef union
{

    /*unsigned*/ char byte;	/**< the whole byte */
#if defined(REVERSED)
    struct
	{
		unsigned int type : 4;	/**< message type nibble */
		bool dup : 1;			/**< DUP flag bit */
		unsigned int qos : 2;	/**< QoS value, 0, 1 or 2 */
		bool retain : 1;		/**< retained flag bit */
	} bits;
#else
    struct
    {
        bool retain : 1;		/**< retained flag bit */
        unsigned int qos : 2;	/**< QoS value, 0, 1 or 2 */
        bool dup : 1;			/**< DUP flag bit */
        unsigned int type : 4;	/**< message type nibble */
    } bits;
#endif
} Header;


const  char ENCODEKEY[] = { 106,79,19,35,14,41,20,121 };

//消息类型
enum msgTypes
{
    CONNECT = 1, CONNACK, PUBLISH, PUBACK, QUERY, QUERYACK,
    QUERYCON, RECONNECT, RECONNECTACK, RESERVE1, RESERVE2,
    PINGREQ, PINGRESP, DISCONNECT
};

//断开连接的原因
enum disConnectionStatus
{
    RECON = 0, OTHER_DEVICE_LOGIN, CLOSURE, LOGOUT, BLOCK
};

/**
基础消息类：包含：
消息头 1个byte；
校验位 1个byte;
lengthSize 记录消息体长度的byte数量,不写入发送的消息体；
*/
typedef struct {
    Header header;
    unsigned char checkCode;
    int lengthSize;
} BaseMessage;

/**
  请求连接消息
*/
struct ConnectMessage : public BaseMessage {

    ConnectMessage() {
        protocolId = "MQIsdp"; //协议名 8 bytes
        protocolVersion = 3;
    }
    const int CONNECT_HEADER_SIZE = 12; //protocolId(8) + protocolVersion(1)+keepAlive(2) + flag(1)
    char* protocolId;
    unsigned char protocolVersion; //一个byte
    const char* clientId;
    signed short keepAlive; //2个byte
    char* appId;
    const char* token;
    char* appIdentifier;
    char* info;
    const char* clientIp;
    char* referer;
    union
    {
        unsigned char all;	/**< all connect flags */
#if defined(REVERSED)
        struct
		{
			bool hasAppId : 1;
			bool hasToken : 1;
			bool retainInfo : 1;
			unsigned int infoQoS : 2;
			bool hasInfo : 1;
			bool cleanSession : 1;
			bool hasClientIp : 1;
		} bits;
#else
        struct
        {
            bool hasClientIp : 1;
            bool cleanSession : 1;
            bool hasInfo : 1;
            unsigned int infoQoS : 2;
            bool retainInfo : 1;
            bool hasToken : 1;
            bool hasAppId : 1;
        } bits;
#endif
    } flags;	/**< connect flags 1个byte */
};


/**
  连接返回消息
*/
struct ConnAckMessage : public BaseMessage {

    ConnectionStatus status; //返回情况
    char* userId; //用户ID
    char* session;
    long long timestamp; //时间戳
};


/**
*  用户发送消息
* 需要集成protobuf
* visual studio 集成 protobuf： https://blog.csdn.net/weixin_43967805/article/details/108916227
* protobuf 3.15版本下载： https://github.com/protocolbuffers/protobuf/releases?after=v3.12.0-rc2&page=3
* cmake 3.23.1 下载: https://cmake.org/download/
* protobuf 如何在c++中使用 https://blog.csdn.net/qq_15267341/article/details/80107293
* VS2015编译Protobuf库以及使用 https://blog.csdn.net/atceedsun/article/details/52778150
* 多线程调试（/MTd）”，与protobuf保持一致，否则编译不过； https://www.cnblogs.com/rmthy/p/8462639.html
* c++使用protobuf https://zhuanlan.zhihu.com/p/420648886
*/
struct UserPublishMessage : public BaseMessage {
    UserPublishMessage() {
        signature = 255L;
    };

    int messageId; //消息ID
    char* topic; //消息类型，例如 GroupMsg
    char* data; //protobuf生成的数据
    char* targetId; //接收人的ID
    long long signature; //签名
};

/**
* 用户接收到的从服务器端发来的消息
* type = 3
*/
struct ServerPublishMessage : public BaseMessage {
    ServerPublishMessage() {
        signature = 255L;
    };
    int messageId; //消息ID
    char* topic; //消息类型，例如 GroupMsg
    char* data; //protobuf生成的数据
    char* targetId; //接收人的ID
    long long signature; //签名
    int date; //日期
};

/**
 * 消息到达服务器确认
 */
struct PublishAckMessage : public BaseMessage {
    PublishAckMessage() {
    }
    int messageId; //客户端生成的消息ID
    int date; //以秒为单位的时间戳
    int millisecond; //毫秒
    char* msgId; //服务器生成的唯一id
    int status; //消息返回状态

};

/**
* 用来拉取离线信息
* type = 5
*
*/
struct QueryMessage : public BaseMessage {
    QueryMessage() {
        signature = 255L;
    };
    int messageId; //消息ID
    char* topic; //消息类型，例如 GroupMsg
    char* data; //protobuf生成的数据
    char* targetId; //接收人的ID
    long long signature; //签名
};

/**
* 返回给客户端的用户离线信息
* type = 6
*
*/
struct QueryAckMessage : public BaseMessage {
    QueryAckMessage() {
    };
    int messageId; //消息ID
    int status; //消息返回状态
    char* data; //protobuf生成的数据
    int date; //以秒为单位的时间戳
};

/* 断开连接消息
* type = 14
*/
struct DisconnectMessage : public BaseMessage {
    DisconnectMessage() {};
    disConnectionStatus status; //断开连接的原因
};

/* 心跳请求消息
* type = 12
*/
struct PingreqMessage : public BaseMessage {
    PingreqMessage() {};
};

/* 心跳回复消息
* type = 13
*/
struct PingrespMessage : public BaseMessage {
    PingrespMessage() {};
};

#endif // !MqttMessageHeader_hpp
