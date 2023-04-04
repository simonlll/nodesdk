
#ifndef _EasyTcpClient_hpp_
#define _EasyTcpClient_hpp_

#ifdef _WIN32
#define WIN32_LEAN_AND_MEAN
#include<windows.h>
#include<WinSock2.h>
#include "malloc.h"
#pragma comment(lib,"ws2_32.lib")
#else
#include<unistd.h> //uni std
#include<arpa/inet.h>
#include<string.h>

#define SOCKET int
#define INVALID_SOCKET  (SOCKET)(~0)
#define SOCKET_ERROR            (-1)
#endif
#include <stdio.h>
#include "MessageHeader.hpp"
#include "MqttMessageHeader.hpp"
#include "util.hpp"
#include "nlohmann/json.hpp"
#include "napi.h"
#include "addon.cc"



using json = nlohmann::json;
struct EasyTcpClientImpl;

class EasyTcpClient
{
    SOCKET _sock;
    bool _isConnect;
    EasyTcpClientImpl * impl;
    Napi::ThreadSafeFunction _listener;
    void (*_serverPublishMsgResultCallback)(ServerPublishMessage, int);
    void (*_connAckMsgResultCallback)(ConnAckMessage);

public:
    
    
    EasyTcpClient()
    {
        _sock = INVALID_SOCKET;
        _isConnect = false;
    }

    void setServerPublishMsgResultCallback(void(*serverPublishMsgResultCallback)(ServerPublishMessage, int)){
        _serverPublishMsgResultCallback = serverPublishMsgResultCallback;


    }


    void setConnAckMsgResultCallback(void(*ConnAckMsgResultCallback)(ConnAckMessage)){
        _connAckMsgResultCallback = ConnAckMsgResultCallback;
    }
    

    virtual ~EasyTcpClient()
    {
        Close();
    }

    void setListener(Napi::ThreadSafeFunction listener){
      _listener = listener;
    }


    //初始化socket
    void InitSocket()
    {
#ifdef _WIN32
        //启动Windows socket 2.x环境
        WORD ver = MAKEWORD(2, 2);
        WSADATA dat;
        WSAStartup(ver, &dat);
#endif
        if (INVALID_SOCKET != _sock)
        {
            printf("<socket=%d>关闭旧连接...\n", _sock);
            Close();
        }
        _sock = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
        if (INVALID_SOCKET == _sock)
        {
            printf("错误，建立Socket失败...\n");
        }
        else {
            //printf("建立Socket=<%d>成功...\n", _sock);
        }
    }

    //连接服务器
    int Connect(const char* ip, unsigned short port)
    {
        if (INVALID_SOCKET == _sock)
        {
            InitSocket();
        }
        // 2 连接服务器 connect
        sockaddr_in _sin = {};
        _sin.sin_family = AF_INET;
        _sin.sin_port = htons(port);
#ifdef _WIN32
        _sin.sin_addr.S_un.S_addr = inet_addr(ip);
#else
        _sin.sin_addr.s_addr = inet_addr(ip);
#endif
        //printf("<socket=%d>正在连接服务器<%s:%d>...\n", _sock, ip, port);
        int ret = connect(_sock, (sockaddr*)&_sin, sizeof(sockaddr_in));
        if (SOCKET_ERROR == ret)
        {
            printf("<socket=%d>error, connect server<%s:%d>failed ...\n", _sock, ip, port);
        }
        else {
            _isConnect = true;
            printf("<socket=%d>连接服务器<%s:%d>成功...\n",_sock, ip, port);
        }
        return ret;
    }

  

    //关闭套节字closesocket
    void Close()
    {
        if (_sock != INVALID_SOCKET)
        {
            #ifdef _WIN32
                        closesocket(_sock);
                        //清除Windows socket环境
                        WSACleanup();
            #else
                        close(_sock);
            #endif
            _sock = INVALID_SOCKET;
        }
        _isConnect = false;
    }
    
    


    //处理网络消息
    bool OnRun()
    {
//        直接调用js传入的callback:
//        auto callback = [](Napi::Env env, Napi::Function jsCallback, int* data) {
//             // Transform native data into JS data, passing it to the provided
//              // `jsCallback` -- the TSFN's JavaScript function.
//                jsCallback.Call({Napi::Number::New(env, *data)});
//            };
//
//        int* value = new int( clock() );
//        napi_status status = _listener.BlockingCall(value, callback);
//        //用完需释放https://www.jianshu.com/p/bb8c12fd8fb1
//         delete value;


        if (isRun())
        {
            fd_set fdReads;
            FD_ZERO(&fdReads);
            FD_SET(_sock, &fdReads);
            timeval t = { 0,0 };
            int ret = select(_sock + 1, &fdReads, 0, 0, &t);
            if (ret < 0)
            {
                printf("<socket=%d>select任务结束1\n", _sock);
                Close();
                return false;
            }
            if (FD_ISSET(_sock, &fdReads))
            {
                FD_CLR(_sock, &fdReads);
                if (-1 == RecvData(_sock))
                {
                    printf("<socket=%d>select任务结束2\n", _sock);
                    Close();
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    //是否工作中
    bool isRun()
    {
        return _sock != INVALID_SOCKET && _isConnect;
    }
    //缓冲区最小单元大小
#ifndef RECV_BUFF_SZIE
#define RECV_BUFF_SZIE 10240
#endif // !RECV_BUFF_SZIE
    //第二缓冲区 消息缓冲区
    char _szMsgBuf[RECV_BUFF_SZIE * 5] = {};
    //消息缓冲区的数据尾部位置
    int _lastPos = 0;
    //接收缓冲区
    char _szRecv[RECV_BUFF_SZIE] = {};

    //接收数据 处理粘包 拆分包
    int RecvData(SOCKET cSock)
    {
        // 5 接收数据
        int nLen = (int)recv(cSock, _szRecv, RECV_BUFF_SZIE, 0);
        printf("nLen=%d\n", nLen);
        if (nLen <= 0)
        {
            printf("<socket=%d>与服务器断开连接，任务结束。\n", cSock);
            return -1;
        }
        //将收取到的数据拷贝到消息缓冲区
        memcpy(_szMsgBuf + _lastPos, _szRecv, nLen);
        //消息缓冲区的数据尾部位置后移
        _lastPos += nLen;
        //判断消息缓冲区的数据长度大于3, 消息头1位，校验1位，记录负载消息长度至少1位
        printf("_lastPos=%d\n", _lastPos);
        while (_lastPos >= 3)
        {
            //消息长度
            size_t payloadLength;
            //decodeLengthResult是记录payloadLength的字节数
            int decodeLengthResult = message_payload_length_decode(_szMsgBuf, &payloadLength);
            if (decodeLengthResult == 0) {
                break;
            }

            //判断消息缓冲区的数据长度大于消息长度
            if (_lastPos >=payloadLength)
            {
                //消息缓冲区剩余未处理数据的长度
                int nSize = _lastPos -(payloadLength+ decodeLengthResult+2);

                //处理网络消息
                OnNetMsg(decodeLengthResult,&payloadLength,_szMsgBuf);
                //将消息缓冲区剩余未处理数据前移
                memcpy(_szMsgBuf, _szMsgBuf + (payloadLength + decodeLengthResult + 2), nSize);
                //消息缓冲区的数据尾部位置前移
                _lastPos = nSize;
            }
            else {
                //消息缓冲区剩余数据不够一条完整消息
                break;
            }
        }
        return 0;
    }

    //响应网络消息
    virtual void OnNetMsg(int decodeLengthResult, size_t* payloadLength, char* _szMsgBuf)
    {
        //解析header
        char  headerValue = _szMsgBuf[0];
        static Header header;
        header.byte = headerValue;
        header.bits.type = (headerValue >> 4) & 15;
        header.bits.dup = (headerValue & 8)>0;
        header.bits.qos = (headerValue & 6) >> 1;
        header.bits.retain = (headerValue & 1) > 0;
        printf("\n");
        printf("type=%d", header.bits.type);
        switch (header.bits.type)
        {
            case 2: //返回数据类型为connack,连接确认消息,读返回的消息
            {
                //解除混淆
                char* obfuscationIndex = _szMsgBuf;
                obfuscation(obfuscationIndex, 1 + 1 + decodeLengthResult, 1 + 1 + decodeLengthResult + *payloadLength);
                //计算buf的指针末尾的值
                int skipedIndex = 2 + decodeLengthResult;
                char * endDataPointer = _szMsgBuf + skipedIndex + *payloadLength;
                ConnAckMessage conAckMessage;
                _szMsgBuf += skipedIndex;

                //读返回状态
                char nouse = readChar(&_szMsgBuf);
                printf("nouse=%d\n", nouse);
                char status = readChar(&_szMsgBuf);
                printf("status=%d\n", status);
                //TODO 释放userId 它是由malloc分配的内存
                conAckMessage.userId = readUTF(&_szMsgBuf, endDataPointer);
                printf("userId=%s\n", conAckMessage.userId);
                //TODO 释放session 它是由malloc分配的内存
                conAckMessage.session = readUTF(&_szMsgBuf, endDataPointer);
                printf("session=%s\n", conAckMessage.session);
                conAckMessage.timestamp = readLongLong(&_szMsgBuf);
                printf("timestamp=%llu\n", conAckMessage.timestamp);
                //回调addon.cc
                //_connAckMsgResultCallback(conActMessage);
                //直接调用js传入的callback:
                //variable ‘XXX cannot be implicitly captured in a lambda with no capture-default specified
                //  https://blog.csdn.net/zsiming/article/details/127037087
                auto callback = [=](Napi::Env env, Napi::Function jsCallback, ConnAckMessage* msg) {
                    // Transform native data into JS data, passing it to the provided
                    // `jsCallback` -- the TSFN's JavaScript function.
                    Napi::Object obj = Napi::Object::New(env);
                    obj.Set(Napi::String::New(env, "msyType"), Napi::Number::New(env,2));
                    obj.Set(Napi::String::New(env, "userId"), Napi::String::New(env,conAckMessage.userId));
                    obj.Set(Napi::String::New(env, "session"), Napi::String::New(env,conAckMessage.session));
                    obj.Set(Napi::String::New(env, "date"), Napi::Number::New(env,conAckMessage.timestamp));
                    jsCallback.Call({obj});
                };
                napi_status napi_status = _listener.BlockingCall(&conAckMessage, callback);
                break;
            }

            case 3: //返回数据类型为ServerPublishMessage, 服务器下发的聊天信息
            {
                //解除混淆
                char* obfuscationIndex = _szMsgBuf;
                obfuscation(obfuscationIndex, 1 + 1 + decodeLengthResult, 1 + 1 + decodeLengthResult + *payloadLength);
                //计算buf的指针末尾的值
                int skipedIndex = 2 + decodeLengthResult;
                char * endDataPointer = _szMsgBuf + skipedIndex + *payloadLength;

                ServerPublishMessage serverPublishMessage;
                _szMsgBuf += skipedIndex;

                //读取signature 8个bytes
                serverPublishMessage.signature = readLongLong(&_szMsgBuf);

                //读取date
                serverPublishMessage.date = read4ByteInt(&_szMsgBuf);

                //TODO 释放topic 它是由malloc分配的内存
                serverPublishMessage.topic = readUTF(&_szMsgBuf, endDataPointer);

                //TODO 释放targetId 它是由malloc分配的内存
                serverPublishMessage.targetId = readUTF(&_szMsgBuf, endDataPointer);

                //读取messageID
                serverPublishMessage.messageId = readInt(&_szMsgBuf);

                //计算data的长度
                int dataSize = endDataPointer - _szMsgBuf;
                char * protobufdata = new char[dataSize];

                //读取data
                memcpy(protobufdata, _szMsgBuf, dataSize);


                serverPublishMessage.data = protobufdata;

                //回调addon.cc
                //_serverPublishMsgResultCallback(serverPublishMessage,dataSize);
                //直接调用js传入的callback:
                //variable ‘XXX cannot be implicitly captured in a lambda with no capture-default specified
                //  https://blog.csdn.net/zsiming/article/details/127037087
                auto callback = [=](Napi::Env env, Napi::Function jsCallback, ServerPublishMessage* msg) {
                    // Transform native data into JS data, passing it to the provided
                    // `jsCallback` -- the TSFN's JavaScript function.
                    Napi::Object obj = Napi::Object::New(env);
                    obj.Set(Napi::String::New(env, "msyType"), Napi::Number::New(env,3));
                    obj.Set(Napi::String::New(env, "messageId"), Napi::Number::New(env,serverPublishMessage.messageId));
                    obj.Set(Napi::String::New(env, "topic"), Napi::String::New(env,serverPublishMessage.topic));
                    obj.Set(Napi::String::New(env, "targetId"), Napi::String::New(env,serverPublishMessage.targetId));
                    obj.Set(Napi::String::New(env, "signature"), Napi::Number::New(env,serverPublishMessage.signature));
                    obj.Set(Napi::String::New(env, "date"), Napi::Number::New(env,serverPublishMessage.date));
                    obj.Set(Napi::String::New(env, "data"), Napi::Buffer<char>::New(env, serverPublishMessage.data,dataSize));
                    jsCallback.Call({obj});
                };
                napi_status status = _listener.BlockingCall(&serverPublishMessage, callback);
                break;
            }

            case 4:{//消息到达服务器确认，返回的信息有在客户端生成的messagid, 和服务端生成的msguid，更新本地发送数据库，放入msguid,防止数据重复存储
                //解除混淆
                char* obfuscationIndex = _szMsgBuf;
                obfuscation(obfuscationIndex, 1 + 1 + decodeLengthResult, 1 + 1 + decodeLengthResult + *payloadLength);
                //计算buf的指针末尾的值
                int skipedIndex = 2 + decodeLengthResult;
                char * endDataPointer = _szMsgBuf + skipedIndex + *payloadLength;

                PublishAckMessage publishAckMessage;
                _szMsgBuf += skipedIndex;

                //读取messageID
                publishAckMessage.messageId = readInt(&_szMsgBuf);

                //读取date
                publishAckMessage.date = read4ByteInt(&_szMsgBuf);

                //读取status
                publishAckMessage.status = readInt(&_szMsgBuf);

                //读取millisecond
                publishAckMessage.millisecond = readInt(&_szMsgBuf);

                //读取msgId
                //TODO 释放 msgId 它是由malloc分配的内存
                publishAckMessage.msgId = readUTF(&_szMsgBuf, endDataPointer);

                auto callback = [=](Napi::Env env, Napi::Function jsCallback, PublishAckMessage* msg) {
                    // Transform native data into JS data, passing it to the provided
                    // `jsCallback` -- the TSFN's JavaScript function.
                    Napi::Object obj = Napi::Object::New(env);
                    obj.Set(Napi::String::New(env, "msyType"), Napi::Number::New(env,4));
                    obj.Set(Napi::String::New(env, "messageId"), Napi::Number::New(env,publishAckMessage.messageId));
                    obj.Set(Napi::String::New(env, "msgId"), Napi::String::New(env,publishAckMessage.msgId));
                    obj.Set(Napi::String::New(env, "status"), Napi::Number::New(env,publishAckMessage.status));
                    obj.Set(Napi::String::New(env, "millisecond"), Napi::Number::New(env,publishAckMessage.millisecond));
                    obj.Set(Napi::String::New(env, "date"), Napi::Number::New(env,publishAckMessage.date));
                    jsCallback.Call({obj});
                };
                napi_status status = _listener.BlockingCall(&publishAckMessage, callback);
                break;
            }

            case 6: //返回数据类型为QueryAckMessage, 服务器下发的用户离线信息
            {
                //解除混淆
                char* obfuscationIndex = _szMsgBuf;
                obfuscation(obfuscationIndex, 1 + 1 + decodeLengthResult, 1 + 1 + decodeLengthResult + *payloadLength);
                //计算buf的指针末尾的值
                int skipedIndex = 2 + decodeLengthResult;
                char * endDataPointer = _szMsgBuf + skipedIndex + *payloadLength;

                QueryAckMessage queryAckMessage;
                _szMsgBuf += skipedIndex;

                //读取messageID
                queryAckMessage.messageId = readInt(&_szMsgBuf);

                //读取date
                queryAckMessage.date = read4ByteInt(&_szMsgBuf);

                //读取status
                queryAckMessage.status = readInt(&_szMsgBuf);

                //计算data的长度
                int dataSize = endDataPointer - _szMsgBuf;
                char * queryAckMessageprotobufdata = new char[dataSize];
                //读取data
                memcpy(queryAckMessageprotobufdata, _szMsgBuf, dataSize);

                queryAckMessage.data = queryAckMessageprotobufdata;

                auto callback = [=](Napi::Env env, Napi::Function jsCallback, QueryAckMessage* msg) {
                    // Transform native data into JS data, passing it to the provided
                    // `jsCallback` -- the TSFN's JavaScript function.
                    Napi::Object obj = Napi::Object::New(env);
                    obj.Set(Napi::String::New(env, "msyType"), Napi::Number::New(env,6));
                    obj.Set(Napi::String::New(env, "messageId"), Napi::Number::New(env,queryAckMessage.messageId));
                    obj.Set(Napi::String::New(env, "status"), Napi::Number::New(env,queryAckMessage.status));
                    obj.Set(Napi::String::New(env, "date"), Napi::Number::New(env,queryAckMessage.date));
                    obj.Set(Napi::String::New(env, "data"), Napi::Buffer<char>::New(env, queryAckMessage.data,dataSize));
                    jsCallback.Call({obj});
                };
                napi_status status = _listener.BlockingCall(&queryAckMessage, callback);

                break;
            }

            case 13: //返回数据类型为PingrespMessage, 服务器收到PingreqMessage心跳请求信息，返回的心跳信息
            {
                printf("--------------printf receive PingrespMessage msg--------------");

                break;
            }

        }
    }

    //发送数据
    int SendData(DataHeader* header, int nLen)
    {
        int ret = SOCKET_ERROR;
        if (isRun() && header)
        {
            ret = send(_sock, (const char*)header, nLen, 0);
            if (SOCKET_ERROR == ret)
            {
                Close();
            }
        }
        return ret;
    }

    //发送数据
    int SendMessage(char* message, int nLen)
    {

        int ret = SOCKET_ERROR;
        if (isRun() && message)
        {
            ret = send(_sock, (const char*)message, nLen, 0);
            if (SOCKET_ERROR == ret)
            {
                Close();
            }
        }
        return ret;
    }
private:

};



#endif
