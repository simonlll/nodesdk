#ifndef _EasyTcpClient_Util_hpp_
#define _EasyTcpClient_Util_hpp_
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
#include <string>


/**
* ������Ϣ���صĳ���
*/
int message_payload_length_decode(char* _szMsgBuf, size_t* value)
{

	char c;
	int multiplier = 1;
	int len = 0;
	*value = 0;
	do
	{
		if (++len > 3)
		{
			return 0;
		}
		c = _szMsgBuf[len + 1];
		*value += (c & 127) * multiplier;
		multiplier *= 128;
	} while ((c & 128) != 0);
	printf("message length=%d,payloadlength=%d", len, *value);
	return len;
}

/**
* �����ݳ�����Ϣд��CHAR����
* @param buf Ҫͨ��SOCKET���͵�CHAR����
* @param length ����ͷ֮�����Ϣ�ĳ���
* @return ���ؼ�¼��Ϣ���ȵ�byte������(<=3)
*/
int write_msg_length(char** buf, size_t length, unsigned char* headerCode)
{
	int rc = 0;

	do
	{
		unsigned char d = length % 128;
		length /= 128;
		/* if there are more digits to encode, set the top bit of this digit */
		if (length > 0)
			d |= 0x80;
		if (buf) {
			**buf = d;
			(*buf)++;
		}
		else
			rc++;
		if (headerCode)
			(*headerCode) ^= d;
	} while (length > 0);
	return rc;
}

/**
* Calculates an integer from two bytes read from the input buffer
* @param pptr pointer to the input buffer - incremented by the number of bytes used & returned
* @return the integer value calculated
*/
static int readInt(char** pptr)
{
	char* ptr = *pptr;
	int len = 256 * ((unsigned char)(*ptr)) + (unsigned char)(*(ptr + 1));
	*pptr += 2;
	return len;
}


/**
* Calculates an long long from eight bytes read from the input buffer
* @param pptr pointer to the input buffer - incremented by the number of bytes used & returned
* @return the integer value calculated
*/
static long long readLongLong(char** pptr)
{
	char* ptr = *pptr;
	long long len = (((long long)(*ptr) << 56) +
		((long long)(*(ptr + 1) & 255) << 48) +
		((long long)(*(ptr + 2) & 255) << 40) +
		((long long)(*(ptr + 3) & 255) << 32) +
		((long long)(*(ptr + 4) & 255) << 24) +
		((int)(*(ptr + 5) & 255) << 16) +
		((int)(*(ptr + 6) & 255) << 8) +
		((int)(*(ptr + 7) & 255) << 0));
	*pptr += 8;
	return len;
}

/**
* writes a long to the underlying output stream as eight bytes, high byte first.
* @param pptr pointer to the input buffer - incremented by the number of bytes used & returned
* @param value long need to be written
* @return void
*/
static void writeLongLong(char** pptr, long long value)
{
	**pptr = (char)(value >> 56);
	(*pptr)++;
	**pptr = (char)(value >> 48);
	(*pptr)++;
	**pptr = (char)(value >> 40);
	(*pptr)++;
	**pptr = (char)(value >> 32);
	(*pptr)++;
	**pptr = (char)(value >> 24);
	(*pptr)++;
	**pptr = (char)(value >> 16);
	(*pptr)++;
	**pptr = (char)(value >> 8);
	(*pptr)++;
	**pptr = (char)(value >> 0);
	(*pptr)++;
}

/**
�����Գ��ȷָ���ַ�����ǰ2byte���ַ������ȣ�Ȼ����ݳ��ȶ�ȡ�ַ�����Ϊ�˷�ֹԽ�磬
ͬ���ṩ�˽�β��ָ�� enddata��ͬʱ��ָ��ķ�ʽ���س�������
* Reads a "UTF" string from the input buffer.  UTF as in the MQTT v3 spec which really means
* a length delimited string.  So it reads the two byte length then the data according to
* that length.  The end of the buffer is provided too, so we can prevent buffer overruns caused
* by an incorrect length.
* @param pptr pointer to the input buffer - incremented by the number of bytes used & returned
* @param enddata pointer to the end of the buffer not to be read beyond
* @param len returns the calculcated value of the length bytes read
* @return an allocated C string holding the characters read, or NULL if the length read would
* have caused an overrun.
*
*/
static char* readUTFlen(char** pptr, char* enddata, int* len)
{
	char* string = NULL;

	if (enddata - (*pptr) > 1) /* enough length to read the integer? */
	{
		*len = readInt(pptr);
		if (&(*pptr)[*len] <= enddata)
		{
			if ((string = (char*)malloc(*len + 1)) == NULL)
				goto exit;
			memcpy(string, *pptr, *len);
			string[*len] = '\0';
			*pptr += *len;
		}
	}
exit:
	return string;
}

/**
�����Գ��ȷָ���ַ�����ǰ2byte���ַ������ȣ�Ȼ����ݳ��ȶ�ȡ�ַ�����Ϊ�˷�ֹԽ�磬
ͬ���ṩ�˽�β��ָ�� enddata
* Reads a "UTF" string from the input buffer.  UTF as in the MQTT v3 spec which really means
* a length delimited string.  So it reads the two byte length then the data according to
* that length.  The end of the buffer is provided too, so we can prevent buffer overruns caused
* by an incorrect length.
* @param pptr pointer to the input buffer - incremented by the number of bytes used & returned
* @param enddata pointer to the end of the buffer not to be read beyond
* @return an allocated C string holding the characters read, or NULL if the length read would
* have caused an overrun.
*/
char* readUTF(char** pptr, char* enddata)
{
	int len;
	return readUTFlen(pptr, enddata, &len);
}

/**д��2��byte��UTF�ַ�������
* Writes an integer as 2 bytes to an output buffer.
* @param pptr pointer to the output buffer - incremented by the number of bytes used & returned
* @param anInt the integer to write
*/
void writeInt(char** pptr, int anInt)
{
	**pptr = (char)(anInt / 256);
	(*pptr)++;
	**pptr = (char)(anInt % 256);
	(*pptr)++;
}

/**д��4��byte��UTF�ַ�������
* Writes an integer as 4 bytes to an output buffer.
* @param pptr pointer to the output buffer - incremented by the number of bytes used & returned
* @param anInt the integer to write
*/
void write4ByteInt(char** pptr, int value)
{
	**pptr = (char)(value >> 24);
	(*pptr)++;
	**pptr = (char)(value >> 16);
	(*pptr)++;
	**pptr = (char)(value >> 8);
	(*pptr)++;
	**pptr = (char)(value >> 0);
	(*pptr)++;
}

/**
* Calculates an int from four bytes read from the input buffer
* @param pptr pointer to the input buffer - incremented by the number of bytes used & returned
* @return the integer value calculated
*/
static int read4ByteInt(char** pptr)
{
	char* ptr = *pptr;
	int len = (((long long)(*(ptr) & 255) << 24) +
		((int)(*(ptr + 1) & 255) << 16) +
		((int)(*(ptr + 2) & 255) << 8) +
		((int)(*(ptr + 3) & 255) << 0));
	*pptr += 4;
	return len;
}

/**
д��UTF�ַ�������д��2��byte���ַ������ȣ�Ȼ��д���ַ���
* Writes a "UTF" string to an output buffer.  Converts C string to length-delimited.
* @param pptr pointer to the output buffer - incremented by the number of bytes used & returned
* @param string the C string to write
*/
void writeUTF(char** pptr, const char* string)
{
	size_t len = strlen(string);
	writeInt(pptr, (int)len);
	memcpy(*pptr, string, len);
	*pptr += len;
}

/**
*	��buffer�ж�һ���ַ�
* Reads one character from the input buffer.
* @param pptr pointer to the input buffer - incremented by the number of bytes used & returned
* @return the character read
*/
unsigned char readChar(char** pptr)
{
	unsigned char c = **pptr;
	(*pptr)++;
	return c;
}


/**
 *дһ���ַ���buffer��
 * Writes one character to an output buffer.
 * @param pptr pointer to the output buffer - incremented by the number of bytes used & returned
 * @param c the character to write
 */
void writeChar(char** pptr, char c)
{
	**pptr = c;
	(*pptr)++;
}

/**
 *	�����㷨

 * Writes one character to an output buffer.
 * @param pptr pointer to the output buffer - incremented by the number of bytes used & returned
 * @param c the character to write
 */
void obfuscation(char* pptr, int start, int dataLength)
{

	int b;
	for (int i = start; i < dataLength; i++) {
		b = i;
		for (int j = 0; j < 8 && b < dataLength; b++) {
			pptr[b] ^= ENCODEKEY[j];
			j++;
		}
	}

}



#endif
