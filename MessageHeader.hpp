#ifndef _MessageHeader_hpp_
#define _MessageHeader_hpp_

#if defined(__linux__)
#include <endian.h>
#if __BYTE_ORDER == __BIG_ENDIAN
#define REVERSED 1
#endif
#endif


enum CMD
{
	CMD_LOGIN,
	CMD_LOGIN_RESULT,
	CMD_LOGOUT,
	CMD_LOGOUT_RESULT,
	CMD_NEW_USER_JOIN,
	CMD_ERROR
};


//测试消息头
struct DataHeader
{
	DataHeader() {
		dataLength = sizeof(DataHeader);
		cmd = CMD_ERROR;
	}
	unsigned char dataLength; //数据长度max 32767
	short cmd; //命令
};
//DataPackage
struct Login :public DataHeader
{
	Login() {
		dataLength = sizeof(Login);
		cmd = CMD_LOGIN;
	}
	char userName[32];
	char passWord[32];
	char data[32];
};

//DataPackage
struct LoginResult :public DataHeader
{
	LoginResult() {
		dataLength = sizeof(LoginResult);
		cmd = CMD_LOGIN_RESULT;
		result = 0;
	}
	int result; //登录结果
	char data[92];
};


struct Logout :public DataHeader
{
	Logout() {
		dataLength = sizeof(Logout);
		cmd = CMD_LOGOUT;
	}
	char userName[32];
};

//DataPackage:public DataHeader
struct LogoutResult :public DataHeader
{
	LogoutResult() {
		dataLength = sizeof(LogoutResult);
		cmd = CMD_LOGOUT_RESULT;
		result = 0;
	}
	int result; //登出结果
};

//DataPackage:public DataHeader
struct NewUserJoin :public DataHeader
{
	NewUserJoin() {
		dataLength = sizeof(NewUserJoin);
		cmd = CMD_NEW_USER_JOIN;
		scok = 0;
	}
	int scok; //新用户加入
};





#endif // !MessageHeader.hpp