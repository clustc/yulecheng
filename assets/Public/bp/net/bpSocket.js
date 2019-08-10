/**
 * socket模块
 * 基于websocket封装
 * 传输数据结构采用protocol buff协议（依赖第三方库protobuf.js,采用插件方式导入）
 * https://www.npmjs.com/package/protobufjs
 */
var ProtocolData = null;    //通用消息头
var ws = {

    ws: null,
    url: "",
    protoModelMap: {},
    recvMsgWhenHide: false, //后台状态时是否收到服务器消息
    _errHandler: null,
    _intervalID: null,
    _serverTime: Date.now(),    //服务器时间 单位ms

    _isReConnecting: false,
    _reconnectCount: 0,
    _isAutoReconnect: true,         //close掉后是否自动重连WS 

    getTime: function () {
        return this._serverTime;
    },

    setTime: function (value) {
        this._serverTime = value;
    },

    loadProtoFiles: function (fileList) {
        if (!(fileList instanceof Array)) {
            fileList = [fileList];
        }
        bp.gui.showLoading(true);
        let loadOneByOne = function () {
            let file = fileList.shift();
            if (!file) {
                bp.gui.showLoading(false);
                bp.event.emit('Event_Proto_Loaded');
                return;
            }

            protobuf.load(file, function (err, root) {
                if (err) {
                    bp.gui.showLoading(false);
                    cc.log(err);
                    return;
                }

                loadOneByOne();
            });
        };

        loadOneByOne();
    },

    connect: function (url) {
        cc.log("[websocket] start to connect server ...");
        // this.close();
        this.ws = new WebSocket(url);
        this.ws.binaryType = "arraybuffer";

        this.url = url;

        var self = this;

        this.ws.onopen = (event) => {
            bp.util.log("[websocket] on open(connected)");
            self._reconnectCount = 0;
            self._isReConnecting = false;
            self.startHeart();
            self._isAutoReconnect = true;
            bp.event.emit("WebSocketOpen");
        };

        this.ws.onclose = (event) => {
            self.stopHeart();
            self.close();
            bp.util.log("[websocket] closed, code:" + event.code + " reason: " + event.reason);

            if (self._isReConnecting) {
                self._reconnectCount++;
            }
            if (self._isAutoReconnect) bp.event.emit("WebSocketClose");
        };

        this.ws.onerror = (event) => {
            bp.util.log("[websocket] error, code:" + event.code + " reason: " + event.reason);
            bp.event.emit("WebSocketError");
        };

        this.ws.onmessage = (event) => {
            self.onMessage(event);
        };
    },

    reconnect: function () {
        this._isReConnecting = true;
        this.connect(this.url);
    },

    isReConnecting: function () {
        return this._isReConnecting;
    },

    getReconnectCount: function () {
        return this._reconnectCount;
    },

    resetReconnectCount: function () {
        this._reconnectCount = 0;
    },

    close: function () {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    },

    /**
     * 获取websocket实例
     */
    getSocket: function () {
        return this.ws;
    },


    /**
     * 获取socket状态
     */
    getState: function () {
        if (this.ws) {
            return this.ws.readyState;
        }
    },

    //设置是否自动重连的方法
    setIsAutoReconnect: function (isAuto) {
        this._isAutoReconnect = isAuto;
    },

    /**
     * 消息处理
     */
    onMessage: function (event) {
        // if (ProtocolData == null) {
        //     bp.util.log("ProtocolData Model not exist! Check has protobuf been inited!")
        //     return;
        // }
        let buffer = new Uint8Array(event.data);
        let message = ProtocolData.decode(buffer);
        let obj = ProtocolData.toObject(message, {
            defaults: true,    // includes default values
        });

        let protocolId = obj.protocolId;
        if (cc.game.isPaused()) {
            //切换后台状态下 收到消息
            if (protocolId != 2) {
                //非心跳消息，忽略
                this.recvMsgWhenHide = true;
                return;
            }
        }

        if (protocolId != 2) {
            bp.util.log("[收到消息]", protocolId);
        }

        if (obj.code != 0) {

        } else {
            let protoId = obj.protocolId;
            let model = this.protoModelMap["" + protoId];
            let data = null;
            if (model) {
                let message = model.decode(obj.body);
                data = model.toObject(message, {
                    defaults: true,    // includes default values
                });
            }
            obj.body = data;
            if (protoId != 2) {
                bp.util.log("  [消息体]", data);
            }
        }
        bp.event.emit("" + protocolId, obj);
    },

    send: function (protoId, data) {
        if (!this.ws) {
            bp.util.log("[websocket] not inited");
            return;
        }

        /*
            CONNECTING	0	连接还没开启。
            OPEN	    1	连接已开启并准备好进行通信。
            CLOSING	    2	连接正在关闭的过程中。
            CLOSED	    3	连接已经关闭，或者连接无法建立。
        */
        let state = this.ws.readyState;
        if (state != WebSocket.OPEN) {
            let states = [
                "connecting",
                "open",
                "closing",
                "closed",
            ]
            bp.util.log("[websocket] not open, current state is " + states[state]);
            return;
        }

        let protoData = {
            protocolId: parseInt(protoId),
            sendTime: this.getTime(),
        }

        let model = this.protoModelMap["" + protoId];
        if (model) {
            let errMsg = model.verify(data);
            if (errMsg) {
                bp.util.log(errMsg);
                return;
            }

            let message = model.create(data);
            let buffer = model.encode(message).finish();

            protoData.body = buffer;
        }

        let message = ProtocolData.create(protoData);
        let buffer = ProtocolData.encode(message).finish();

        bp.util.log("发送消息", protoId, data)
        this.ws.send(buffer);
    },

    /**
     * 开始心跳,5s
     */
    startHeart: function () {
        if (!this._intervalID) {
            this._intervalID = setInterval(() => {
                this.send(1)
            }, 5000);
        }
    },

    /**
     * 停止心跳
     */
    stopHeart: function () {
        if (this._intervalID) {
            clearInterval(this._intervalID);
            this._intervalID = null;
        }
    },



    /**
     * 注册ErrorCode预处理方法
     * @param {function} 函数 func返回值为bool值 返回true，继续处理； 返回false，中断处理
     */
    registerErrorHandler: function (func) {
        this._errHandler = func;
    },

};

module.exports = ws;