#ifndef _addon_cc
#define _addon_cc
#include <chrono>
#include <thread>
#include "EasyTcpClient.hpp"
#include "MessageFactory.hpp"
#include "napi.h"
using namespace std;

constexpr size_t ARRAY_LENGTH = 10;

EasyTcpClient* client;

Napi::ThreadSafeFunction tsfn;
Napi::ThreadSafeFunction conStatusListener;
std::thread nativeThread;
//im server地址
//char* host = "10.0.0.52"; //本机
char* host = "10.0.0.138"; //macbook air
//im server 端口
//int port = 7001; //本机
int port = 7000; //mackbook air
//自动重连时间间隔数组
float reconnectInterval[10] = {0,0.25,0.5,1,2,4,8,16,32,64};
//重连尝试次数
int retryCount=0;
//用户传入的token
char* token;

// 定义重连
void retry();

//定义连接
int innerconnect();

// 从EasyTcpClient返回 ServerPublishMessage 的回调函数
void serverPublishMsgResultCallback(ServerPublishMessage msg, int dataSize) {
  printf("函数指针结果n=%s, a=%d,b=%d.\n", msg.topic, msg.date, dataSize);
}

// 从EasyTcpClient返回 ConnAckMessage 的回调函数
void connAckMessageResultCallback(ConnAckMessage msg) {
  printf("ConnAckMessage, userid=%s.\n", msg.userId);
}

// 从EasyTcpClient返回网络连接断开的回调函数
void disconnectCallback(int errorCode) {
  printf("网络连接已断开,错误码是=%d.\n", errorCode);
    //自动重连
   retry();
}



void setMethodPoint() {
  // 定义函数指针(ServerPublishMessage)
  void (*pServerPublishMsgResultCallback)(ServerPublishMessage, int) =
      serverPublishMsgResultCallback;
  // 设置回调
  client->setServerPublishMsgResultCallback(pServerPublishMsgResultCallback);

  // 定义函数指针(ConnAckMessage)
  void (*pconnAckMessageResultCallback)(ConnAckMessage) =
      connAckMessageResultCallback;
  // 设置回调
  client->setConnAckMsgResultCallback(pconnAckMessageResultCallback);

  // 定义函数指针(返回连接断开错误吗)
  void (*pdisconnectCallback)(int) =
      disconnectCallback;
  // 设置回调
  client->setDisconnectCallback(pdisconnectCallback);
}

// 自动重连时的连接
int innerconnect(){


    char* clientIP = "clientip";

    char* userid = "userid";

    int buflen;

    // 创建一个连接消息
    char* buf = make_connect_message(&buflen, token, clientIP, userid);

    int ret = 174;
    // 发送连接消息
    if (buf) {
        ret = client->SendMessage(buf, buflen);
        printf("发送连接消息结果%d\n", ret);
        free(buf);
        if(ret != 174){//说明发送连接字符串失败，要重连
            retry();
        }
        buf = NULL;
    }
    return ret;
}
//自动重连
void retry(){
    //最大重连次数
    int maxRetryCount = sizeof(reconnectInterval)/sizeof(float);
    //重连时间间隔
    int interval;
    if(retryCount>=0 && retryCount<=maxRetryCount){
            interval = reconnectInterval[retryCount];
    }else{
            interval = reconnectInterval[maxRetryCount];
    }


    std::this_thread::sleep_for(std::chrono::milliseconds(1000*interval));

    printf("自动重连，等待了%d秒，重新尝试连接\n", 1000*interval);
    retryCount++;
    int a = client->Connect(host, port);

    if(a == -1){//-1说明连接im服务器不成功，自动重连
        retry();
    }
    innerconnect();


}

// 定义监听消息线程
void threadEntry();

//发送断开消息
Napi::Value sendDisConMsg(const Napi::CallbackInfo& info){
    Napi::Env env = info.Env();

    int disconnectmsgLength;
    char * disconnectMsgBuf = make_disconnect_message(&disconnectmsgLength, 1);

     int ret=0;
     //发送PingreqMessage的消息
     if (disconnectMsgBuf) {
         ret = client->SendMessage(disconnectMsgBuf, disconnectmsgLength);
         free(disconnectMsgBuf);
         disconnectMsgBuf = NULL;
     }
     return Napi::Number::New(env, ret);
}
//发送ping消息
Napi::Value sendPingMsg(const Napi::CallbackInfo& info){
    Napi::Env env = info.Env();

    int pingreqMessageLength;
    char * pingreqMsgBuf = make_pingreq_message(&pingreqMessageLength);

    int ret=0;

    //发送PingreqMessage的消息
    if (pingreqMsgBuf) {
        ret = client->SendMessage(pingreqMsgBuf, pingreqMessageLength);
        free(pingreqMsgBuf);
        pingreqMsgBuf = NULL;
    }
     return Napi::Number::New(env, ret);

}


// 发送消息
Napi::Value sendByteMsg(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() < 1) {
    Napi::TypeError::New(env, "Wrong number of arguments")
        .ThrowAsJavaScriptException();
    return Napi::String::New(env, "Wrong arguments");
  }

  //    public native int sendByteMsg(int conversation_type, String receiver,
  //    byte[] content, int contentLength, int msgId);

  int conversation_type = info[0].As<Napi::Number>().Int32Value();
  std::string receiver = info[1].As<Napi::String>().Utf8Value();
  char* contentArray = info[2].As<Napi::Buffer<char>>().Data();
  int contentLength = info[3].As<Napi::Number>().Int32Value();
  int msgId = info[4].As<Napi::Number>().Int32Value();

  char* targetId;
  int len = receiver.length();
  targetId = (char*)malloc((len + 1) * sizeof(char));
  receiver.copy(targetId, len, 0);

  // 记录userPublishMessageLen的长度
  int userPublishMessageLen;

  int ret = 0;

  if (conversation_type == 1) {
    char* userPublishMsgBuf = make_userpublish_message(&userPublishMessageLen,
                                                       "PersonMsg",
                                                       (char*)targetId,
                                                       (char*)contentArray,
                                                       contentLength,
                                                       msgId);
    ret = client->SendMessage(userPublishMsgBuf, userPublishMessageLen);

  } else {
    char* userPublishMsgBuf = make_userpublish_message(&userPublishMessageLen,
                                                       "GroupMsg",
                                                       (char*)targetId,
                                                       (char*)contentArray,
                                                       contentLength,
                                                       msgId);
    ret = client->SendMessage(userPublishMsgBuf, userPublishMessageLen);
  }

  return Napi::Number::New(env, ret);
}

// 发送查询消息
Napi::Value sendQueryBytesMsg(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() < 1) {
    Napi::TypeError::New(env, "Wrong number of arguments")
        .ThrowAsJavaScriptException();
    return Napi::String::New(env, "Wrong arguments");
  }

  //    public native int sendByteMsg(int conversation_type, String receiver,
  //    byte[] content, int contentLength, int msgId);

  std::string user = info[0].As<Napi::String>().Utf8Value();
  char* contentArray = info[1].As<Napi::Buffer<char>>().Data();
  int contentLength = info[2].As<Napi::Number>().Int32Value();
  std::string qryString = info[3].As<Napi::String>().Utf8Value();

  // 如果要将string转换为char*，可以使用string提供的函数c_str()
  // ，或是函数data()，data除了返回字符串内容外，不附加结束符'\0'，而c_str()返回一个以‘\0’结尾的字符数组。
  char* userId = user.data();

  char* queryType = qryString.data();

  // 记录 queryMessageLen 的长度
  int queryMessageLen;

  int ret = 0;

  char* queryMsgBuf = make_query_message(&queryMessageLen,
                                         (char*)queryType,
                                         (char*)userId,
                                         (char*)contentArray,
                                         contentLength,
                                         getMessageId());

  ret = client->SendMessage(queryMsgBuf, queryMessageLen);

  return Napi::Number::New(env, ret);
}

// 发送连接消息（参数是用户的token)
Napi::Value Connect(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  if (info.Length() < 1) {
    Napi::TypeError::New(env, "Wrong number of arguments")
        .ThrowAsJavaScriptException();
    return Napi::String::New(env, "Wrong arguments");
  }

  std::string s1 = info[0].As<Napi::String>().Utf8Value();
  token = s1.data();


  int ret = innerconnect();
  return Napi::Number::New(env, ret);
}

// 初始化EasyTcpClient, 和服务器建立连接
Napi::Number InitClient(const Napi::CallbackInfo& info) {

  Napi::Env env = info.Env();
  client = new EasyTcpClient();
  // 设置指针函数
  setMethodPoint();

  int a = 10;
  a = client->Connect(host, port);

  return Napi::Number::New(env, a);
}

// 设置连接状态回调函数
Napi::Value setConStatusListener(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  // Create a new ThreadSafeFunction.
  conStatusListener = Napi::ThreadSafeFunction::New(
      env,
      info[0]
          .As<Napi::Function>(),  // JavaScript function called asynchronously
      "Connection status listener",            // Name
      0,                          // Unlimited queue
      1,                          // Only one thread will use this initially
      [](Napi::Env) {             // Finalizer used to clean threads up
       });

  client->setConStatusListener(conStatusListener);

  // Return the deferred's Promise. This Promise is resolved in the thread-safe
  // function's finalizer callback.
  int a = 100;
  return Napi::Number::New(env, a);
}

// 启动接受线程，设置消息回调函数
Napi::Value CreateTSFN(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  // Create a new ThreadSafeFunction.
  tsfn = Napi::ThreadSafeFunction::New(
      env,
      info[0]
          .As<Napi::Function>(),  // JavaScript function called asynchronously
      "Resource Name",            // Name
      0,                          // Unlimited queue
      1,                          // Only one thread will use this initially
      [](Napi::Env) {             // Finalizer used to clean threads up
        nativeThread.join();
      });

  client->setListener(tsfn);
  nativeThread = std::thread(threadEntry);

  // Return the deferred's Promise. This Promise is resolved in the thread-safe
  // function's finalizer callback.
  int a = 10;
  return Napi::Number::New(env, a);
}



// 监听消息线程
void threadEntry() {
  while (client->isRun()) {
    std::this_thread::sleep_for(std::chrono::milliseconds(200));
    client->OnRun();
  }
  // Release the thread-safe function. This decrements the internal thread
  // count, and will perform finalization since the count will reach 0.
  tsfn.Release();
  conStatusListener.Release();
}

// Addon entry point
Napi::Object Init(Napi::Env env, Napi::Object exports) {
  // 初始化EasyTcpClient, 和服务器建立连接
  exports["InitClient"] = Napi::Function::New(env, InitClient);
  // 启动接受线程，设置消息回调函数
  exports["createTSFN"] = Napi::Function::New(env, CreateTSFN);
  // 设置网络断开错误码回调
  exports["setConStatusListener"] = Napi::Function::New(env, setConStatusListener);
  // 发送连接消息（参数是用户的token)
  exports["Connect"] = Napi::Function::New(env, Connect);
  // 发送消息
  exports["sendByteMsg"] = Napi::Function::New(env, sendByteMsg);
  // 发送查询消息
  exports["sendQueryBytesMsg"] = Napi::Function::New(env, sendQueryBytesMsg);
  //发送ping消息
  exports["sendPingMsg"] = Napi::Function::New(env, sendPingMsg);
  //发送断开消息
  exports["sendDisConMsg"] = Napi::Function::New(env, sendDisConMsg);

  return exports;
}

NODE_API_MODULE(addon, Init)
#endif
