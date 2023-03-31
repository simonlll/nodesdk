/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
(function(global, factory) { /* global define, require, module */

    /* AMD */ if (typeof define === 'function' && define.amd)
        define(["protobufjs/minimal"], factory);

    /* CommonJS */ else if (typeof require === 'function' && typeof module === 'object' && module && module.exports)
        module.exports = factory(require("protobufjs/minimal"));

})(this, function($protobuf) {
    "use strict";

    // Common aliases
    var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;
    
    // Exported root namespace
    var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});
    
    $root.Message = (function() {
    
        /**
         * Properties of a Message.
         * @exports IMessage
         * @interface IMessage
         * @property {number|Long} msgTimestamp Message msgTimestamp
         * @property {string} fromUserId Message fromUserId
         * @property {string} objectName Message objectName
         * @property {string} channelType Message channelType
         * @property {string} msgUID Message msgUID
         * @property {string} source Message source
         * @property {string} toUserId Message toUserId
         * @property {Uint8Array} content Message content
         * @property {number|Long|null} [status] Message status
         */
    
        /**
         * Constructs a new Message.
         * @exports Message
         * @classdesc Represents a Message.
         * @implements IMessage
         * @constructor
         * @param {IMessage=} [properties] Properties to set
         */
        function Message(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }
    
        /**
         * Message msgTimestamp.
         * @member {number|Long} msgTimestamp
         * @memberof Message
         * @instance
         */
        Message.prototype.msgTimestamp = $util.Long ? $util.Long.fromBits(0,0,false) : 0;
    
        /**
         * Message fromUserId.
         * @member {string} fromUserId
         * @memberof Message
         * @instance
         */
        Message.prototype.fromUserId = "";
    
        /**
         * Message objectName.
         * @member {string} objectName
         * @memberof Message
         * @instance
         */
        Message.prototype.objectName = "";
    
        /**
         * Message channelType.
         * @member {string} channelType
         * @memberof Message
         * @instance
         */
        Message.prototype.channelType = "";
    
        /**
         * Message msgUID.
         * @member {string} msgUID
         * @memberof Message
         * @instance
         */
        Message.prototype.msgUID = "";
    
        /**
         * Message source.
         * @member {string} source
         * @memberof Message
         * @instance
         */
        Message.prototype.source = "";
    
        /**
         * Message toUserId.
         * @member {string} toUserId
         * @memberof Message
         * @instance
         */
        Message.prototype.toUserId = "";
    
        /**
         * Message content.
         * @member {Uint8Array} content
         * @memberof Message
         * @instance
         */
        Message.prototype.content = $util.newBuffer([]);
    
        /**
         * Message status.
         * @member {number|Long} status
         * @memberof Message
         * @instance
         */
        Message.prototype.status = $util.Long ? $util.Long.fromBits(0,0,false) : 0;
    
        /**
         * Creates a new Message instance using the specified properties.
         * @function create
         * @memberof Message
         * @static
         * @param {IMessage=} [properties] Properties to set
         * @returns {Message} Message instance
         */
        Message.create = function create(properties) {
            return new Message(properties);
        };
    
        /**
         * Encodes the specified Message message. Does not implicitly {@link Message.verify|verify} messages.
         * @function encode
         * @memberof Message
         * @static
         * @param {IMessage} message Message message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Message.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).int64(message.msgTimestamp);
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.fromUserId);
            writer.uint32(/* id 3, wireType 2 =*/26).string(message.objectName);
            writer.uint32(/* id 4, wireType 2 =*/34).string(message.channelType);
            writer.uint32(/* id 5, wireType 2 =*/42).string(message.msgUID);
            writer.uint32(/* id 6, wireType 2 =*/50).string(message.source);
            writer.uint32(/* id 7, wireType 2 =*/58).string(message.toUserId);
            writer.uint32(/* id 8, wireType 2 =*/66).bytes(message.content);
            if (message.status != null && Object.hasOwnProperty.call(message, "status"))
                writer.uint32(/* id 9, wireType 0 =*/72).int64(message.status);
            return writer;
        };
    
        /**
         * Encodes the specified Message message, length delimited. Does not implicitly {@link Message.verify|verify} messages.
         * @function encodeDelimited
         * @memberof Message
         * @static
         * @param {IMessage} message Message message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Message.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
    
        /**
         * Decodes a Message message from the specified reader or buffer.
         * @function decode
         * @memberof Message
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {Message} Message
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Message.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Message();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.msgTimestamp = reader.int64();
                        break;
                    }
                case 2: {
                        message.fromUserId = reader.string();
                        break;
                    }
                case 3: {
                        message.objectName = reader.string();
                        break;
                    }
                case 4: {
                        message.channelType = reader.string();
                        break;
                    }
                case 5: {
                        message.msgUID = reader.string();
                        break;
                    }
                case 6: {
                        message.source = reader.string();
                        break;
                    }
                case 7: {
                        message.toUserId = reader.string();
                        break;
                    }
                case 8: {
                        message.content = reader.bytes();
                        break;
                    }
                case 9: {
                        message.status = reader.int64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("msgTimestamp"))
                throw $util.ProtocolError("missing required 'msgTimestamp'", { instance: message });
            if (!message.hasOwnProperty("fromUserId"))
                throw $util.ProtocolError("missing required 'fromUserId'", { instance: message });
            if (!message.hasOwnProperty("objectName"))
                throw $util.ProtocolError("missing required 'objectName'", { instance: message });
            if (!message.hasOwnProperty("channelType"))
                throw $util.ProtocolError("missing required 'channelType'", { instance: message });
            if (!message.hasOwnProperty("msgUID"))
                throw $util.ProtocolError("missing required 'msgUID'", { instance: message });
            if (!message.hasOwnProperty("source"))
                throw $util.ProtocolError("missing required 'source'", { instance: message });
            if (!message.hasOwnProperty("toUserId"))
                throw $util.ProtocolError("missing required 'toUserId'", { instance: message });
            if (!message.hasOwnProperty("content"))
                throw $util.ProtocolError("missing required 'content'", { instance: message });
            return message;
        };
    
        /**
         * Decodes a Message message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof Message
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {Message} Message
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Message.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
    
        /**
         * Verifies a Message message.
         * @function verify
         * @memberof Message
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Message.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.msgTimestamp) && !(message.msgTimestamp && $util.isInteger(message.msgTimestamp.low) && $util.isInteger(message.msgTimestamp.high)))
                return "msgTimestamp: integer|Long expected";
            if (!$util.isString(message.fromUserId))
                return "fromUserId: string expected";
            if (!$util.isString(message.objectName))
                return "objectName: string expected";
            if (!$util.isString(message.channelType))
                return "channelType: string expected";
            if (!$util.isString(message.msgUID))
                return "msgUID: string expected";
            if (!$util.isString(message.source))
                return "source: string expected";
            if (!$util.isString(message.toUserId))
                return "toUserId: string expected";
            if (!(message.content && typeof message.content.length === "number" || $util.isString(message.content)))
                return "content: buffer expected";
            if (message.status != null && message.hasOwnProperty("status"))
                if (!$util.isInteger(message.status) && !(message.status && $util.isInteger(message.status.low) && $util.isInteger(message.status.high)))
                    return "status: integer|Long expected";
            return null;
        };
    
        /**
         * Creates a Message message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof Message
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {Message} Message
         */
        Message.fromObject = function fromObject(object) {
            if (object instanceof $root.Message)
                return object;
            var message = new $root.Message();
            if (object.msgTimestamp != null)
                if ($util.Long)
                    (message.msgTimestamp = $util.Long.fromValue(object.msgTimestamp)).unsigned = false;
                else if (typeof object.msgTimestamp === "string")
                    message.msgTimestamp = parseInt(object.msgTimestamp, 10);
                else if (typeof object.msgTimestamp === "number")
                    message.msgTimestamp = object.msgTimestamp;
                else if (typeof object.msgTimestamp === "object")
                    message.msgTimestamp = new $util.LongBits(object.msgTimestamp.low >>> 0, object.msgTimestamp.high >>> 0).toNumber();
            if (object.fromUserId != null)
                message.fromUserId = String(object.fromUserId);
            if (object.objectName != null)
                message.objectName = String(object.objectName);
            if (object.channelType != null)
                message.channelType = String(object.channelType);
            if (object.msgUID != null)
                message.msgUID = String(object.msgUID);
            if (object.source != null)
                message.source = String(object.source);
            if (object.toUserId != null)
                message.toUserId = String(object.toUserId);
            if (object.content != null)
                if (typeof object.content === "string")
                    $util.base64.decode(object.content, message.content = $util.newBuffer($util.base64.length(object.content)), 0);
                else if (object.content.length >= 0)
                    message.content = object.content;
            if (object.status != null)
                if ($util.Long)
                    (message.status = $util.Long.fromValue(object.status)).unsigned = false;
                else if (typeof object.status === "string")
                    message.status = parseInt(object.status, 10);
                else if (typeof object.status === "number")
                    message.status = object.status;
                else if (typeof object.status === "object")
                    message.status = new $util.LongBits(object.status.low >>> 0, object.status.high >>> 0).toNumber();
            return message;
        };
    
        /**
         * Creates a plain object from a Message message. Also converts values to other types if specified.
         * @function toObject
         * @memberof Message
         * @static
         * @param {Message} message Message
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Message.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.msgTimestamp = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.msgTimestamp = options.longs === String ? "0" : 0;
                object.fromUserId = "";
                object.objectName = "";
                object.channelType = "";
                object.msgUID = "";
                object.source = "";
                object.toUserId = "";
                if (options.bytes === String)
                    object.content = "";
                else {
                    object.content = [];
                    if (options.bytes !== Array)
                        object.content = $util.newBuffer(object.content);
                }
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.status = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.status = options.longs === String ? "0" : 0;
            }
            if (message.msgTimestamp != null && message.hasOwnProperty("msgTimestamp"))
                if (typeof message.msgTimestamp === "number")
                    object.msgTimestamp = options.longs === String ? String(message.msgTimestamp) : message.msgTimestamp;
                else
                    object.msgTimestamp = options.longs === String ? $util.Long.prototype.toString.call(message.msgTimestamp) : options.longs === Number ? new $util.LongBits(message.msgTimestamp.low >>> 0, message.msgTimestamp.high >>> 0).toNumber() : message.msgTimestamp;
            if (message.fromUserId != null && message.hasOwnProperty("fromUserId"))
                object.fromUserId = message.fromUserId;
            if (message.objectName != null && message.hasOwnProperty("objectName"))
                object.objectName = message.objectName;
            if (message.channelType != null && message.hasOwnProperty("channelType"))
                object.channelType = message.channelType;
            if (message.msgUID != null && message.hasOwnProperty("msgUID"))
                object.msgUID = message.msgUID;
            if (message.source != null && message.hasOwnProperty("source"))
                object.source = message.source;
            if (message.toUserId != null && message.hasOwnProperty("toUserId"))
                object.toUserId = message.toUserId;
            if (message.content != null && message.hasOwnProperty("content"))
                object.content = options.bytes === String ? $util.base64.encode(message.content, 0, message.content.length) : options.bytes === Array ? Array.prototype.slice.call(message.content) : message.content;
            if (message.status != null && message.hasOwnProperty("status"))
                if (typeof message.status === "number")
                    object.status = options.longs === String ? String(message.status) : message.status;
                else
                    object.status = options.longs === String ? $util.Long.prototype.toString.call(message.status) : options.longs === Number ? new $util.LongBits(message.status.low >>> 0, message.status.high >>> 0).toNumber() : message.status;
            return object;
        };
    
        /**
         * Converts this Message to JSON.
         * @function toJSON
         * @memberof Message
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Message.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
    
        /**
         * Gets the default type url for Message
         * @function getTypeUrl
         * @memberof Message
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Message.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/Message";
        };
    
        return Message;
    })();
    
    $root.CSQryPullMessage = (function() {
    
        /**
         * Properties of a CSQryPullMessage.
         * @exports ICSQryPullMessage
         * @interface ICSQryPullMessage
         * @property {number|Long} sendBoxSyncTime CSQryPullMessage sendBoxSyncTime
         * @property {boolean} isPullSend CSQryPullMessage isPullSend
         * @property {string} fromUserId CSQryPullMessage fromUserId
         * @property {number|Long} syncTime CSQryPullMessage syncTime
         * @property {string} clientOs CSQryPullMessage clientOs
         */
    
        /**
         * Constructs a new CSQryPullMessage.
         * @exports CSQryPullMessage
         * @classdesc Represents a CSQryPullMessage.
         * @implements ICSQryPullMessage
         * @constructor
         * @param {ICSQryPullMessage=} [properties] Properties to set
         */
        function CSQryPullMessage(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }
    
        /**
         * CSQryPullMessage sendBoxSyncTime.
         * @member {number|Long} sendBoxSyncTime
         * @memberof CSQryPullMessage
         * @instance
         */
        CSQryPullMessage.prototype.sendBoxSyncTime = $util.Long ? $util.Long.fromBits(0,0,false) : 0;
    
        /**
         * CSQryPullMessage isPullSend.
         * @member {boolean} isPullSend
         * @memberof CSQryPullMessage
         * @instance
         */
        CSQryPullMessage.prototype.isPullSend = false;
    
        /**
         * CSQryPullMessage fromUserId.
         * @member {string} fromUserId
         * @memberof CSQryPullMessage
         * @instance
         */
        CSQryPullMessage.prototype.fromUserId = "";
    
        /**
         * CSQryPullMessage syncTime.
         * @member {number|Long} syncTime
         * @memberof CSQryPullMessage
         * @instance
         */
        CSQryPullMessage.prototype.syncTime = $util.Long ? $util.Long.fromBits(0,0,false) : 0;
    
        /**
         * CSQryPullMessage clientOs.
         * @member {string} clientOs
         * @memberof CSQryPullMessage
         * @instance
         */
        CSQryPullMessage.prototype.clientOs = "";
    
        /**
         * Creates a new CSQryPullMessage instance using the specified properties.
         * @function create
         * @memberof CSQryPullMessage
         * @static
         * @param {ICSQryPullMessage=} [properties] Properties to set
         * @returns {CSQryPullMessage} CSQryPullMessage instance
         */
        CSQryPullMessage.create = function create(properties) {
            return new CSQryPullMessage(properties);
        };
    
        /**
         * Encodes the specified CSQryPullMessage message. Does not implicitly {@link CSQryPullMessage.verify|verify} messages.
         * @function encode
         * @memberof CSQryPullMessage
         * @static
         * @param {ICSQryPullMessage} message CSQryPullMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CSQryPullMessage.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).int64(message.sendBoxSyncTime);
            writer.uint32(/* id 2, wireType 0 =*/16).bool(message.isPullSend);
            writer.uint32(/* id 3, wireType 2 =*/26).string(message.fromUserId);
            writer.uint32(/* id 4, wireType 0 =*/32).int64(message.syncTime);
            writer.uint32(/* id 5, wireType 2 =*/42).string(message.clientOs);
            return writer;
        };
    
        /**
         * Encodes the specified CSQryPullMessage message, length delimited. Does not implicitly {@link CSQryPullMessage.verify|verify} messages.
         * @function encodeDelimited
         * @memberof CSQryPullMessage
         * @static
         * @param {ICSQryPullMessage} message CSQryPullMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CSQryPullMessage.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
    
        /**
         * Decodes a CSQryPullMessage message from the specified reader or buffer.
         * @function decode
         * @memberof CSQryPullMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {CSQryPullMessage} CSQryPullMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CSQryPullMessage.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.CSQryPullMessage();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.sendBoxSyncTime = reader.int64();
                        break;
                    }
                case 2: {
                        message.isPullSend = reader.bool();
                        break;
                    }
                case 3: {
                        message.fromUserId = reader.string();
                        break;
                    }
                case 4: {
                        message.syncTime = reader.int64();
                        break;
                    }
                case 5: {
                        message.clientOs = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("sendBoxSyncTime"))
                throw $util.ProtocolError("missing required 'sendBoxSyncTime'", { instance: message });
            if (!message.hasOwnProperty("isPullSend"))
                throw $util.ProtocolError("missing required 'isPullSend'", { instance: message });
            if (!message.hasOwnProperty("fromUserId"))
                throw $util.ProtocolError("missing required 'fromUserId'", { instance: message });
            if (!message.hasOwnProperty("syncTime"))
                throw $util.ProtocolError("missing required 'syncTime'", { instance: message });
            if (!message.hasOwnProperty("clientOs"))
                throw $util.ProtocolError("missing required 'clientOs'", { instance: message });
            return message;
        };
    
        /**
         * Decodes a CSQryPullMessage message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof CSQryPullMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {CSQryPullMessage} CSQryPullMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CSQryPullMessage.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
    
        /**
         * Verifies a CSQryPullMessage message.
         * @function verify
         * @memberof CSQryPullMessage
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CSQryPullMessage.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.sendBoxSyncTime) && !(message.sendBoxSyncTime && $util.isInteger(message.sendBoxSyncTime.low) && $util.isInteger(message.sendBoxSyncTime.high)))
                return "sendBoxSyncTime: integer|Long expected";
            if (typeof message.isPullSend !== "boolean")
                return "isPullSend: boolean expected";
            if (!$util.isString(message.fromUserId))
                return "fromUserId: string expected";
            if (!$util.isInteger(message.syncTime) && !(message.syncTime && $util.isInteger(message.syncTime.low) && $util.isInteger(message.syncTime.high)))
                return "syncTime: integer|Long expected";
            if (!$util.isString(message.clientOs))
                return "clientOs: string expected";
            return null;
        };
    
        /**
         * Creates a CSQryPullMessage message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof CSQryPullMessage
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {CSQryPullMessage} CSQryPullMessage
         */
        CSQryPullMessage.fromObject = function fromObject(object) {
            if (object instanceof $root.CSQryPullMessage)
                return object;
            var message = new $root.CSQryPullMessage();
            if (object.sendBoxSyncTime != null)
                if ($util.Long)
                    (message.sendBoxSyncTime = $util.Long.fromValue(object.sendBoxSyncTime)).unsigned = false;
                else if (typeof object.sendBoxSyncTime === "string")
                    message.sendBoxSyncTime = parseInt(object.sendBoxSyncTime, 10);
                else if (typeof object.sendBoxSyncTime === "number")
                    message.sendBoxSyncTime = object.sendBoxSyncTime;
                else if (typeof object.sendBoxSyncTime === "object")
                    message.sendBoxSyncTime = new $util.LongBits(object.sendBoxSyncTime.low >>> 0, object.sendBoxSyncTime.high >>> 0).toNumber();
            if (object.isPullSend != null)
                message.isPullSend = Boolean(object.isPullSend);
            if (object.fromUserId != null)
                message.fromUserId = String(object.fromUserId);
            if (object.syncTime != null)
                if ($util.Long)
                    (message.syncTime = $util.Long.fromValue(object.syncTime)).unsigned = false;
                else if (typeof object.syncTime === "string")
                    message.syncTime = parseInt(object.syncTime, 10);
                else if (typeof object.syncTime === "number")
                    message.syncTime = object.syncTime;
                else if (typeof object.syncTime === "object")
                    message.syncTime = new $util.LongBits(object.syncTime.low >>> 0, object.syncTime.high >>> 0).toNumber();
            if (object.clientOs != null)
                message.clientOs = String(object.clientOs);
            return message;
        };
    
        /**
         * Creates a plain object from a CSQryPullMessage message. Also converts values to other types if specified.
         * @function toObject
         * @memberof CSQryPullMessage
         * @static
         * @param {CSQryPullMessage} message CSQryPullMessage
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CSQryPullMessage.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.sendBoxSyncTime = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.sendBoxSyncTime = options.longs === String ? "0" : 0;
                object.isPullSend = false;
                object.fromUserId = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.syncTime = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.syncTime = options.longs === String ? "0" : 0;
                object.clientOs = "";
            }
            if (message.sendBoxSyncTime != null && message.hasOwnProperty("sendBoxSyncTime"))
                if (typeof message.sendBoxSyncTime === "number")
                    object.sendBoxSyncTime = options.longs === String ? String(message.sendBoxSyncTime) : message.sendBoxSyncTime;
                else
                    object.sendBoxSyncTime = options.longs === String ? $util.Long.prototype.toString.call(message.sendBoxSyncTime) : options.longs === Number ? new $util.LongBits(message.sendBoxSyncTime.low >>> 0, message.sendBoxSyncTime.high >>> 0).toNumber() : message.sendBoxSyncTime;
            if (message.isPullSend != null && message.hasOwnProperty("isPullSend"))
                object.isPullSend = message.isPullSend;
            if (message.fromUserId != null && message.hasOwnProperty("fromUserId"))
                object.fromUserId = message.fromUserId;
            if (message.syncTime != null && message.hasOwnProperty("syncTime"))
                if (typeof message.syncTime === "number")
                    object.syncTime = options.longs === String ? String(message.syncTime) : message.syncTime;
                else
                    object.syncTime = options.longs === String ? $util.Long.prototype.toString.call(message.syncTime) : options.longs === Number ? new $util.LongBits(message.syncTime.low >>> 0, message.syncTime.high >>> 0).toNumber() : message.syncTime;
            if (message.clientOs != null && message.hasOwnProperty("clientOs"))
                object.clientOs = message.clientOs;
            return object;
        };
    
        /**
         * Converts this CSQryPullMessage to JSON.
         * @function toJSON
         * @memberof CSQryPullMessage
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CSQryPullMessage.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
    
        /**
         * Gets the default type url for CSQryPullMessage
         * @function getTypeUrl
         * @memberof CSQryPullMessage
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CSQryPullMessage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/CSQryPullMessage";
        };
    
        return CSQryPullMessage;
    })();
    
    $root.CSQryPullMessageACK = (function() {
    
        /**
         * Properties of a CSQryPullMessageACK.
         * @exports ICSQryPullMessageACK
         * @interface ICSQryPullMessageACK
         * @property {Array.<IMessage>|null} [list] CSQryPullMessageACK list
         * @property {boolean} finished CSQryPullMessageACK finished
         * @property {number|Long} syncTime CSQryPullMessageACK syncTime
         * @property {string|null} [clientOs] CSQryPullMessageACK clientOs
         */
    
        /**
         * Constructs a new CSQryPullMessageACK.
         * @exports CSQryPullMessageACK
         * @classdesc Represents a CSQryPullMessageACK.
         * @implements ICSQryPullMessageACK
         * @constructor
         * @param {ICSQryPullMessageACK=} [properties] Properties to set
         */
        function CSQryPullMessageACK(properties) {
            this.list = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }
    
        /**
         * CSQryPullMessageACK list.
         * @member {Array.<IMessage>} list
         * @memberof CSQryPullMessageACK
         * @instance
         */
        CSQryPullMessageACK.prototype.list = $util.emptyArray;
    
        /**
         * CSQryPullMessageACK finished.
         * @member {boolean} finished
         * @memberof CSQryPullMessageACK
         * @instance
         */
        CSQryPullMessageACK.prototype.finished = false;
    
        /**
         * CSQryPullMessageACK syncTime.
         * @member {number|Long} syncTime
         * @memberof CSQryPullMessageACK
         * @instance
         */
        CSQryPullMessageACK.prototype.syncTime = $util.Long ? $util.Long.fromBits(0,0,false) : 0;
    
        /**
         * CSQryPullMessageACK clientOs.
         * @member {string} clientOs
         * @memberof CSQryPullMessageACK
         * @instance
         */
        CSQryPullMessageACK.prototype.clientOs = "";
    
        /**
         * Creates a new CSQryPullMessageACK instance using the specified properties.
         * @function create
         * @memberof CSQryPullMessageACK
         * @static
         * @param {ICSQryPullMessageACK=} [properties] Properties to set
         * @returns {CSQryPullMessageACK} CSQryPullMessageACK instance
         */
        CSQryPullMessageACK.create = function create(properties) {
            return new CSQryPullMessageACK(properties);
        };
    
        /**
         * Encodes the specified CSQryPullMessageACK message. Does not implicitly {@link CSQryPullMessageACK.verify|verify} messages.
         * @function encode
         * @memberof CSQryPullMessageACK
         * @static
         * @param {ICSQryPullMessageACK} message CSQryPullMessageACK message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CSQryPullMessageACK.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.list != null && message.list.length)
                for (var i = 0; i < message.list.length; ++i)
                    $root.Message.encode(message.list[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            writer.uint32(/* id 2, wireType 0 =*/16).bool(message.finished);
            writer.uint32(/* id 3, wireType 0 =*/24).int64(message.syncTime);
            if (message.clientOs != null && Object.hasOwnProperty.call(message, "clientOs"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.clientOs);
            return writer;
        };
    
        /**
         * Encodes the specified CSQryPullMessageACK message, length delimited. Does not implicitly {@link CSQryPullMessageACK.verify|verify} messages.
         * @function encodeDelimited
         * @memberof CSQryPullMessageACK
         * @static
         * @param {ICSQryPullMessageACK} message CSQryPullMessageACK message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CSQryPullMessageACK.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
    
        /**
         * Decodes a CSQryPullMessageACK message from the specified reader or buffer.
         * @function decode
         * @memberof CSQryPullMessageACK
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {CSQryPullMessageACK} CSQryPullMessageACK
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CSQryPullMessageACK.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.CSQryPullMessageACK();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.list && message.list.length))
                            message.list = [];
                        message.list.push($root.Message.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        message.finished = reader.bool();
                        break;
                    }
                case 3: {
                        message.syncTime = reader.int64();
                        break;
                    }
                case 4: {
                        message.clientOs = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("finished"))
                throw $util.ProtocolError("missing required 'finished'", { instance: message });
            if (!message.hasOwnProperty("syncTime"))
                throw $util.ProtocolError("missing required 'syncTime'", { instance: message });
            return message;
        };
    
        /**
         * Decodes a CSQryPullMessageACK message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof CSQryPullMessageACK
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {CSQryPullMessageACK} CSQryPullMessageACK
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CSQryPullMessageACK.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
    
        /**
         * Verifies a CSQryPullMessageACK message.
         * @function verify
         * @memberof CSQryPullMessageACK
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CSQryPullMessageACK.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.list != null && message.hasOwnProperty("list")) {
                if (!Array.isArray(message.list))
                    return "list: array expected";
                for (var i = 0; i < message.list.length; ++i) {
                    var error = $root.Message.verify(message.list[i]);
                    if (error)
                        return "list." + error;
                }
            }
            if (typeof message.finished !== "boolean")
                return "finished: boolean expected";
            if (!$util.isInteger(message.syncTime) && !(message.syncTime && $util.isInteger(message.syncTime.low) && $util.isInteger(message.syncTime.high)))
                return "syncTime: integer|Long expected";
            if (message.clientOs != null && message.hasOwnProperty("clientOs"))
                if (!$util.isString(message.clientOs))
                    return "clientOs: string expected";
            return null;
        };
    
        /**
         * Creates a CSQryPullMessageACK message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof CSQryPullMessageACK
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {CSQryPullMessageACK} CSQryPullMessageACK
         */
        CSQryPullMessageACK.fromObject = function fromObject(object) {
            if (object instanceof $root.CSQryPullMessageACK)
                return object;
            var message = new $root.CSQryPullMessageACK();
            if (object.list) {
                if (!Array.isArray(object.list))
                    throw TypeError(".CSQryPullMessageACK.list: array expected");
                message.list = [];
                for (var i = 0; i < object.list.length; ++i) {
                    if (typeof object.list[i] !== "object")
                        throw TypeError(".CSQryPullMessageACK.list: object expected");
                    message.list[i] = $root.Message.fromObject(object.list[i]);
                }
            }
            if (object.finished != null)
                message.finished = Boolean(object.finished);
            if (object.syncTime != null)
                if ($util.Long)
                    (message.syncTime = $util.Long.fromValue(object.syncTime)).unsigned = false;
                else if (typeof object.syncTime === "string")
                    message.syncTime = parseInt(object.syncTime, 10);
                else if (typeof object.syncTime === "number")
                    message.syncTime = object.syncTime;
                else if (typeof object.syncTime === "object")
                    message.syncTime = new $util.LongBits(object.syncTime.low >>> 0, object.syncTime.high >>> 0).toNumber();
            if (object.clientOs != null)
                message.clientOs = String(object.clientOs);
            return message;
        };
    
        /**
         * Creates a plain object from a CSQryPullMessageACK message. Also converts values to other types if specified.
         * @function toObject
         * @memberof CSQryPullMessageACK
         * @static
         * @param {CSQryPullMessageACK} message CSQryPullMessageACK
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CSQryPullMessageACK.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.list = [];
            if (options.defaults) {
                object.finished = false;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.syncTime = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.syncTime = options.longs === String ? "0" : 0;
                object.clientOs = "";
            }
            if (message.list && message.list.length) {
                object.list = [];
                for (var j = 0; j < message.list.length; ++j)
                    object.list[j] = $root.Message.toObject(message.list[j], options);
            }
            if (message.finished != null && message.hasOwnProperty("finished"))
                object.finished = message.finished;
            if (message.syncTime != null && message.hasOwnProperty("syncTime"))
                if (typeof message.syncTime === "number")
                    object.syncTime = options.longs === String ? String(message.syncTime) : message.syncTime;
                else
                    object.syncTime = options.longs === String ? $util.Long.prototype.toString.call(message.syncTime) : options.longs === Number ? new $util.LongBits(message.syncTime.low >>> 0, message.syncTime.high >>> 0).toNumber() : message.syncTime;
            if (message.clientOs != null && message.hasOwnProperty("clientOs"))
                object.clientOs = message.clientOs;
            return object;
        };
    
        /**
         * Converts this CSQryPullMessageACK to JSON.
         * @function toJSON
         * @memberof CSQryPullMessageACK
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CSQryPullMessageACK.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
    
        /**
         * Gets the default type url for CSQryPullMessageACK
         * @function getTypeUrl
         * @memberof CSQryPullMessageACK
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CSQryPullMessageACK.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/CSQryPullMessageACK";
        };
    
        return CSQryPullMessageACK;
    })();
    
    $root.Notify = (function() {
    
        /**
         * Properties of a Notify.
         * @exports INotify
         * @interface INotify
         * @property {number|Long} time Notify time
         * @property {number|Long|null} [type] Notify type
         */
    
        /**
         * Constructs a new Notify.
         * @exports Notify
         * @classdesc Represents a Notify.
         * @implements INotify
         * @constructor
         * @param {INotify=} [properties] Properties to set
         */
        function Notify(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }
    
        /**
         * Notify time.
         * @member {number|Long} time
         * @memberof Notify
         * @instance
         */
        Notify.prototype.time = $util.Long ? $util.Long.fromBits(0,0,false) : 0;
    
        /**
         * Notify type.
         * @member {number|Long} type
         * @memberof Notify
         * @instance
         */
        Notify.prototype.type = $util.Long ? $util.Long.fromBits(0,0,false) : 0;
    
        /**
         * Creates a new Notify instance using the specified properties.
         * @function create
         * @memberof Notify
         * @static
         * @param {INotify=} [properties] Properties to set
         * @returns {Notify} Notify instance
         */
        Notify.create = function create(properties) {
            return new Notify(properties);
        };
    
        /**
         * Encodes the specified Notify message. Does not implicitly {@link Notify.verify|verify} messages.
         * @function encode
         * @memberof Notify
         * @static
         * @param {INotify} message Notify message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Notify.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).int64(message.time);
            if (message.type != null && Object.hasOwnProperty.call(message, "type"))
                writer.uint32(/* id 2, wireType 0 =*/16).int64(message.type);
            return writer;
        };
    
        /**
         * Encodes the specified Notify message, length delimited. Does not implicitly {@link Notify.verify|verify} messages.
         * @function encodeDelimited
         * @memberof Notify
         * @static
         * @param {INotify} message Notify message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Notify.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
    
        /**
         * Decodes a Notify message from the specified reader or buffer.
         * @function decode
         * @memberof Notify
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {Notify} Notify
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Notify.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Notify();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.time = reader.int64();
                        break;
                    }
                case 2: {
                        message.type = reader.int64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("time"))
                throw $util.ProtocolError("missing required 'time'", { instance: message });
            return message;
        };
    
        /**
         * Decodes a Notify message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof Notify
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {Notify} Notify
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Notify.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
    
        /**
         * Verifies a Notify message.
         * @function verify
         * @memberof Notify
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Notify.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.time) && !(message.time && $util.isInteger(message.time.low) && $util.isInteger(message.time.high)))
                return "time: integer|Long expected";
            if (message.type != null && message.hasOwnProperty("type"))
                if (!$util.isInteger(message.type) && !(message.type && $util.isInteger(message.type.low) && $util.isInteger(message.type.high)))
                    return "type: integer|Long expected";
            return null;
        };
    
        /**
         * Creates a Notify message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof Notify
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {Notify} Notify
         */
        Notify.fromObject = function fromObject(object) {
            if (object instanceof $root.Notify)
                return object;
            var message = new $root.Notify();
            if (object.time != null)
                if ($util.Long)
                    (message.time = $util.Long.fromValue(object.time)).unsigned = false;
                else if (typeof object.time === "string")
                    message.time = parseInt(object.time, 10);
                else if (typeof object.time === "number")
                    message.time = object.time;
                else if (typeof object.time === "object")
                    message.time = new $util.LongBits(object.time.low >>> 0, object.time.high >>> 0).toNumber();
            if (object.type != null)
                if ($util.Long)
                    (message.type = $util.Long.fromValue(object.type)).unsigned = false;
                else if (typeof object.type === "string")
                    message.type = parseInt(object.type, 10);
                else if (typeof object.type === "number")
                    message.type = object.type;
                else if (typeof object.type === "object")
                    message.type = new $util.LongBits(object.type.low >>> 0, object.type.high >>> 0).toNumber();
            return message;
        };
    
        /**
         * Creates a plain object from a Notify message. Also converts values to other types if specified.
         * @function toObject
         * @memberof Notify
         * @static
         * @param {Notify} message Notify
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Notify.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.time = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.time = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.type = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.type = options.longs === String ? "0" : 0;
            }
            if (message.time != null && message.hasOwnProperty("time"))
                if (typeof message.time === "number")
                    object.time = options.longs === String ? String(message.time) : message.time;
                else
                    object.time = options.longs === String ? $util.Long.prototype.toString.call(message.time) : options.longs === Number ? new $util.LongBits(message.time.low >>> 0, message.time.high >>> 0).toNumber() : message.time;
            if (message.type != null && message.hasOwnProperty("type"))
                if (typeof message.type === "number")
                    object.type = options.longs === String ? String(message.type) : message.type;
                else
                    object.type = options.longs === String ? $util.Long.prototype.toString.call(message.type) : options.longs === Number ? new $util.LongBits(message.type.low >>> 0, message.type.high >>> 0).toNumber() : message.type;
            return object;
        };
    
        /**
         * Converts this Notify to JSON.
         * @function toJSON
         * @memberof Notify
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Notify.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
    
        /**
         * Gets the default type url for Notify
         * @function getTypeUrl
         * @memberof Notify
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Notify.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/Notify";
        };
    
        return Notify;
    })();
    
    $root.CSQryPullHisMessage = (function() {
    
        /**
         * Properties of a CSQryPullHisMessage.
         * @exports ICSQryPullHisMessage
         * @interface ICSQryPullHisMessage
         * @property {number|Long} time CSQryPullHisMessage time
         * @property {number} count CSQryPullHisMessage count
         * @property {string} targetId CSQryPullHisMessage targetId
         * @property {string} channelType CSQryPullHisMessage channelType
         */
    
        /**
         * Constructs a new CSQryPullHisMessage.
         * @exports CSQryPullHisMessage
         * @classdesc Represents a CSQryPullHisMessage.
         * @implements ICSQryPullHisMessage
         * @constructor
         * @param {ICSQryPullHisMessage=} [properties] Properties to set
         */
        function CSQryPullHisMessage(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }
    
        /**
         * CSQryPullHisMessage time.
         * @member {number|Long} time
         * @memberof CSQryPullHisMessage
         * @instance
         */
        CSQryPullHisMessage.prototype.time = $util.Long ? $util.Long.fromBits(0,0,false) : 0;
    
        /**
         * CSQryPullHisMessage count.
         * @member {number} count
         * @memberof CSQryPullHisMessage
         * @instance
         */
        CSQryPullHisMessage.prototype.count = 0;
    
        /**
         * CSQryPullHisMessage targetId.
         * @member {string} targetId
         * @memberof CSQryPullHisMessage
         * @instance
         */
        CSQryPullHisMessage.prototype.targetId = "";
    
        /**
         * CSQryPullHisMessage channelType.
         * @member {string} channelType
         * @memberof CSQryPullHisMessage
         * @instance
         */
        CSQryPullHisMessage.prototype.channelType = "";
    
        /**
         * Creates a new CSQryPullHisMessage instance using the specified properties.
         * @function create
         * @memberof CSQryPullHisMessage
         * @static
         * @param {ICSQryPullHisMessage=} [properties] Properties to set
         * @returns {CSQryPullHisMessage} CSQryPullHisMessage instance
         */
        CSQryPullHisMessage.create = function create(properties) {
            return new CSQryPullHisMessage(properties);
        };
    
        /**
         * Encodes the specified CSQryPullHisMessage message. Does not implicitly {@link CSQryPullHisMessage.verify|verify} messages.
         * @function encode
         * @memberof CSQryPullHisMessage
         * @static
         * @param {ICSQryPullHisMessage} message CSQryPullHisMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CSQryPullHisMessage.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            writer.uint32(/* id 1, wireType 0 =*/8).int64(message.time);
            writer.uint32(/* id 2, wireType 0 =*/16).int32(message.count);
            writer.uint32(/* id 3, wireType 2 =*/26).string(message.targetId);
            writer.uint32(/* id 4, wireType 2 =*/34).string(message.channelType);
            return writer;
        };
    
        /**
         * Encodes the specified CSQryPullHisMessage message, length delimited. Does not implicitly {@link CSQryPullHisMessage.verify|verify} messages.
         * @function encodeDelimited
         * @memberof CSQryPullHisMessage
         * @static
         * @param {ICSQryPullHisMessage} message CSQryPullHisMessage message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CSQryPullHisMessage.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
    
        /**
         * Decodes a CSQryPullHisMessage message from the specified reader or buffer.
         * @function decode
         * @memberof CSQryPullHisMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {CSQryPullHisMessage} CSQryPullHisMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CSQryPullHisMessage.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.CSQryPullHisMessage();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        message.time = reader.int64();
                        break;
                    }
                case 2: {
                        message.count = reader.int32();
                        break;
                    }
                case 3: {
                        message.targetId = reader.string();
                        break;
                    }
                case 4: {
                        message.channelType = reader.string();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("time"))
                throw $util.ProtocolError("missing required 'time'", { instance: message });
            if (!message.hasOwnProperty("count"))
                throw $util.ProtocolError("missing required 'count'", { instance: message });
            if (!message.hasOwnProperty("targetId"))
                throw $util.ProtocolError("missing required 'targetId'", { instance: message });
            if (!message.hasOwnProperty("channelType"))
                throw $util.ProtocolError("missing required 'channelType'", { instance: message });
            return message;
        };
    
        /**
         * Decodes a CSQryPullHisMessage message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof CSQryPullHisMessage
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {CSQryPullHisMessage} CSQryPullHisMessage
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CSQryPullHisMessage.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
    
        /**
         * Verifies a CSQryPullHisMessage message.
         * @function verify
         * @memberof CSQryPullHisMessage
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CSQryPullHisMessage.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (!$util.isInteger(message.time) && !(message.time && $util.isInteger(message.time.low) && $util.isInteger(message.time.high)))
                return "time: integer|Long expected";
            if (!$util.isInteger(message.count))
                return "count: integer expected";
            if (!$util.isString(message.targetId))
                return "targetId: string expected";
            if (!$util.isString(message.channelType))
                return "channelType: string expected";
            return null;
        };
    
        /**
         * Creates a CSQryPullHisMessage message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof CSQryPullHisMessage
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {CSQryPullHisMessage} CSQryPullHisMessage
         */
        CSQryPullHisMessage.fromObject = function fromObject(object) {
            if (object instanceof $root.CSQryPullHisMessage)
                return object;
            var message = new $root.CSQryPullHisMessage();
            if (object.time != null)
                if ($util.Long)
                    (message.time = $util.Long.fromValue(object.time)).unsigned = false;
                else if (typeof object.time === "string")
                    message.time = parseInt(object.time, 10);
                else if (typeof object.time === "number")
                    message.time = object.time;
                else if (typeof object.time === "object")
                    message.time = new $util.LongBits(object.time.low >>> 0, object.time.high >>> 0).toNumber();
            if (object.count != null)
                message.count = object.count | 0;
            if (object.targetId != null)
                message.targetId = String(object.targetId);
            if (object.channelType != null)
                message.channelType = String(object.channelType);
            return message;
        };
    
        /**
         * Creates a plain object from a CSQryPullHisMessage message. Also converts values to other types if specified.
         * @function toObject
         * @memberof CSQryPullHisMessage
         * @static
         * @param {CSQryPullHisMessage} message CSQryPullHisMessage
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CSQryPullHisMessage.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.time = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.time = options.longs === String ? "0" : 0;
                object.count = 0;
                object.targetId = "";
                object.channelType = "";
            }
            if (message.time != null && message.hasOwnProperty("time"))
                if (typeof message.time === "number")
                    object.time = options.longs === String ? String(message.time) : message.time;
                else
                    object.time = options.longs === String ? $util.Long.prototype.toString.call(message.time) : options.longs === Number ? new $util.LongBits(message.time.low >>> 0, message.time.high >>> 0).toNumber() : message.time;
            if (message.count != null && message.hasOwnProperty("count"))
                object.count = message.count;
            if (message.targetId != null && message.hasOwnProperty("targetId"))
                object.targetId = message.targetId;
            if (message.channelType != null && message.hasOwnProperty("channelType"))
                object.channelType = message.channelType;
            return object;
        };
    
        /**
         * Converts this CSQryPullHisMessage to JSON.
         * @function toJSON
         * @memberof CSQryPullHisMessage
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CSQryPullHisMessage.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
    
        /**
         * Gets the default type url for CSQryPullHisMessage
         * @function getTypeUrl
         * @memberof CSQryPullHisMessage
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CSQryPullHisMessage.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/CSQryPullHisMessage";
        };
    
        return CSQryPullHisMessage;
    })();
    
    $root.CSQryPullHisMessageACK = (function() {
    
        /**
         * Properties of a CSQryPullHisMessageACK.
         * @exports ICSQryPullHisMessageACK
         * @interface ICSQryPullHisMessageACK
         * @property {Array.<IMessage>|null} [list] CSQryPullHisMessageACK list
         * @property {boolean} hasMsg CSQryPullHisMessageACK hasMsg
         * @property {number|Long} syncTime CSQryPullHisMessageACK syncTime
         */
    
        /**
         * Constructs a new CSQryPullHisMessageACK.
         * @exports CSQryPullHisMessageACK
         * @classdesc Represents a CSQryPullHisMessageACK.
         * @implements ICSQryPullHisMessageACK
         * @constructor
         * @param {ICSQryPullHisMessageACK=} [properties] Properties to set
         */
        function CSQryPullHisMessageACK(properties) {
            this.list = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }
    
        /**
         * CSQryPullHisMessageACK list.
         * @member {Array.<IMessage>} list
         * @memberof CSQryPullHisMessageACK
         * @instance
         */
        CSQryPullHisMessageACK.prototype.list = $util.emptyArray;
    
        /**
         * CSQryPullHisMessageACK hasMsg.
         * @member {boolean} hasMsg
         * @memberof CSQryPullHisMessageACK
         * @instance
         */
        CSQryPullHisMessageACK.prototype.hasMsg = false;
    
        /**
         * CSQryPullHisMessageACK syncTime.
         * @member {number|Long} syncTime
         * @memberof CSQryPullHisMessageACK
         * @instance
         */
        CSQryPullHisMessageACK.prototype.syncTime = $util.Long ? $util.Long.fromBits(0,0,false) : 0;
    
        /**
         * Creates a new CSQryPullHisMessageACK instance using the specified properties.
         * @function create
         * @memberof CSQryPullHisMessageACK
         * @static
         * @param {ICSQryPullHisMessageACK=} [properties] Properties to set
         * @returns {CSQryPullHisMessageACK} CSQryPullHisMessageACK instance
         */
        CSQryPullHisMessageACK.create = function create(properties) {
            return new CSQryPullHisMessageACK(properties);
        };
    
        /**
         * Encodes the specified CSQryPullHisMessageACK message. Does not implicitly {@link CSQryPullHisMessageACK.verify|verify} messages.
         * @function encode
         * @memberof CSQryPullHisMessageACK
         * @static
         * @param {ICSQryPullHisMessageACK} message CSQryPullHisMessageACK message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CSQryPullHisMessageACK.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.list != null && message.list.length)
                for (var i = 0; i < message.list.length; ++i)
                    $root.Message.encode(message.list[i], writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            writer.uint32(/* id 2, wireType 0 =*/16).bool(message.hasMsg);
            writer.uint32(/* id 3, wireType 0 =*/24).int64(message.syncTime);
            return writer;
        };
    
        /**
         * Encodes the specified CSQryPullHisMessageACK message, length delimited. Does not implicitly {@link CSQryPullHisMessageACK.verify|verify} messages.
         * @function encodeDelimited
         * @memberof CSQryPullHisMessageACK
         * @static
         * @param {ICSQryPullHisMessageACK} message CSQryPullHisMessageACK message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        CSQryPullHisMessageACK.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };
    
        /**
         * Decodes a CSQryPullHisMessageACK message from the specified reader or buffer.
         * @function decode
         * @memberof CSQryPullHisMessageACK
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {CSQryPullHisMessageACK} CSQryPullHisMessageACK
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CSQryPullHisMessageACK.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.CSQryPullHisMessageACK();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1: {
                        if (!(message.list && message.list.length))
                            message.list = [];
                        message.list.push($root.Message.decode(reader, reader.uint32()));
                        break;
                    }
                case 2: {
                        message.hasMsg = reader.bool();
                        break;
                    }
                case 3: {
                        message.syncTime = reader.int64();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            if (!message.hasOwnProperty("hasMsg"))
                throw $util.ProtocolError("missing required 'hasMsg'", { instance: message });
            if (!message.hasOwnProperty("syncTime"))
                throw $util.ProtocolError("missing required 'syncTime'", { instance: message });
            return message;
        };
    
        /**
         * Decodes a CSQryPullHisMessageACK message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof CSQryPullHisMessageACK
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {CSQryPullHisMessageACK} CSQryPullHisMessageACK
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        CSQryPullHisMessageACK.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };
    
        /**
         * Verifies a CSQryPullHisMessageACK message.
         * @function verify
         * @memberof CSQryPullHisMessageACK
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        CSQryPullHisMessageACK.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.list != null && message.hasOwnProperty("list")) {
                if (!Array.isArray(message.list))
                    return "list: array expected";
                for (var i = 0; i < message.list.length; ++i) {
                    var error = $root.Message.verify(message.list[i]);
                    if (error)
                        return "list." + error;
                }
            }
            if (typeof message.hasMsg !== "boolean")
                return "hasMsg: boolean expected";
            if (!$util.isInteger(message.syncTime) && !(message.syncTime && $util.isInteger(message.syncTime.low) && $util.isInteger(message.syncTime.high)))
                return "syncTime: integer|Long expected";
            return null;
        };
    
        /**
         * Creates a CSQryPullHisMessageACK message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof CSQryPullHisMessageACK
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {CSQryPullHisMessageACK} CSQryPullHisMessageACK
         */
        CSQryPullHisMessageACK.fromObject = function fromObject(object) {
            if (object instanceof $root.CSQryPullHisMessageACK)
                return object;
            var message = new $root.CSQryPullHisMessageACK();
            if (object.list) {
                if (!Array.isArray(object.list))
                    throw TypeError(".CSQryPullHisMessageACK.list: array expected");
                message.list = [];
                for (var i = 0; i < object.list.length; ++i) {
                    if (typeof object.list[i] !== "object")
                        throw TypeError(".CSQryPullHisMessageACK.list: object expected");
                    message.list[i] = $root.Message.fromObject(object.list[i]);
                }
            }
            if (object.hasMsg != null)
                message.hasMsg = Boolean(object.hasMsg);
            if (object.syncTime != null)
                if ($util.Long)
                    (message.syncTime = $util.Long.fromValue(object.syncTime)).unsigned = false;
                else if (typeof object.syncTime === "string")
                    message.syncTime = parseInt(object.syncTime, 10);
                else if (typeof object.syncTime === "number")
                    message.syncTime = object.syncTime;
                else if (typeof object.syncTime === "object")
                    message.syncTime = new $util.LongBits(object.syncTime.low >>> 0, object.syncTime.high >>> 0).toNumber();
            return message;
        };
    
        /**
         * Creates a plain object from a CSQryPullHisMessageACK message. Also converts values to other types if specified.
         * @function toObject
         * @memberof CSQryPullHisMessageACK
         * @static
         * @param {CSQryPullHisMessageACK} message CSQryPullHisMessageACK
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        CSQryPullHisMessageACK.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.list = [];
            if (options.defaults) {
                object.hasMsg = false;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.syncTime = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.syncTime = options.longs === String ? "0" : 0;
            }
            if (message.list && message.list.length) {
                object.list = [];
                for (var j = 0; j < message.list.length; ++j)
                    object.list[j] = $root.Message.toObject(message.list[j], options);
            }
            if (message.hasMsg != null && message.hasOwnProperty("hasMsg"))
                object.hasMsg = message.hasMsg;
            if (message.syncTime != null && message.hasOwnProperty("syncTime"))
                if (typeof message.syncTime === "number")
                    object.syncTime = options.longs === String ? String(message.syncTime) : message.syncTime;
                else
                    object.syncTime = options.longs === String ? $util.Long.prototype.toString.call(message.syncTime) : options.longs === Number ? new $util.LongBits(message.syncTime.low >>> 0, message.syncTime.high >>> 0).toNumber() : message.syncTime;
            return object;
        };
    
        /**
         * Converts this CSQryPullHisMessageACK to JSON.
         * @function toJSON
         * @memberof CSQryPullHisMessageACK
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        CSQryPullHisMessageACK.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };
    
        /**
         * Gets the default type url for CSQryPullHisMessageACK
         * @function getTypeUrl
         * @memberof CSQryPullHisMessageACK
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        CSQryPullHisMessageACK.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/CSQryPullHisMessageACK";
        };
    
        return CSQryPullHisMessageACK;
    })();

    return $root;
});
