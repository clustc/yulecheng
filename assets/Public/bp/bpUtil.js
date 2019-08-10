var Util = {

    _debug: true,

    getDebugMode: function () {
        return this._debug;
    },

    setDebugMode: function (bValue) {
        this._debug = !!bValue;
    },

    /**
     * 动态加载远程图片资源
     */
    loadRemoteImage: function (spt, url) {
        if (!spt || !url) return;

        if (url.indexOf('http') === -1) {
            url = config.HTTPURL.fileUrl + url;
        }

        cc.loader.load({ url: url }, (err, texture) => {
            if (err) {
                bp.util.log('load remote image faild!', url);
                return;
            }
            spt.spriteFrame = new cc.SpriteFrame(texture);
        });
    },

    loadRemoteImageOrDefault: function (spt, url, defaultImg) {
        if (!spt || !url) {
            spt.spriteFrame = defaultImg;
            return;
        }

        if (url.indexOf('http') === -1) {
            url = config.HTTPURL.fileUrl + url;
        }
        cc.loader.load({ url: url }, (err, texture) => {
            if (err) {
                spt.spriteFrame = defaultImg;
                return;
            }
            spt.spriteFrame = new cc.SpriteFrame(texture);
        });
    },


    toString: function (num) {
        return "" + num;
    },

    toNumber: function (str) {
        return +str;
    },

    /**
     * 格式化数字，以万为单位，小数点后取两位
     */
    formatNum: function (num) {
        if (num < 10000) return num;
        let integer = Math.floor(num / 10000);
        let decimal = Math.floor((num % 10000) / 100)
    },

    log: function () {
        if (this._debug) {
            return cc.error.apply(cc, arguments);
        }
    },

    /**
     * 
     */
    openUrl: function (url) {
        if (!url) return;
        window.location.href = url;
    },

    processName: function (name) {
        let len = name.length;
        let reg = /^[^\u4e00-\u9fa5]+$/;
        if (reg.test(name)) {
            //非中文    
            if (len > 11) {
                name = name.slice(0, 8) + "...";
            }
        } else {
            //包含中文
            if (len > 4) {
                name = name.slice(0, 4) + "...";
            }
        }
        return name;
    },

    //获取两个整数范围内的整数（min<result<max）
    roundNumber: function (min, max) {
        let len = max - min;
        let range = Math.floor(Math.random() * len);
        if (range == 0) {
            range += 1;
        }
        return range;
    },

    /**
     * 前后台监听
     */
    patch: function () {
        if (cc.sys.isNative) return;
        if (typeof document["oHidden"] !== "undefined") {
            document.addEventListener("ovisibilitychange", function (event) {
                let visible = document["oHidden"] || event["hidden"];
                let game = cc.game;
                if (visible) {
                    game.emit(game.EVENT_SHOW, game);
                } else {
                    game.emit(game.EVENT_HIDE, game);
                }
            }, false)
        }

        let ua = navigator.userAgent;
        let isWX = /micromessenger/gi.test(ua);
        let isQQBrowser = /mqq/ig.test(ua);
        let isQQ = /mobile.*qq/gi.test(ua);

        if (isQQ || isWX) {
            isQQBrowser = false;
        }
        if (isQQBrowser) {
            let browser = window["browser"] || {};
            browser.execWebFn = browser.execWebFn || {};
            browser.execWebFn.postX5GamePlayerMessage = function (event) {
                let eventType = event.type;
                if (eventType == "app_enter_background") {
                    game.emit(game.EVENT_HIDE, game);
                }
                else if (eventType == "app_enter_foreground") {
                    game.emit(game.EVENT_SHOW, game);
                }
            };
            window["browser"] = browser;
        }
    },

    //判断一个对象是否为空
    isObjectEmpty: function (obj) {
        if (typeof obj != 'object') return false;
        if (JSON.stringify(obj) == "{}") {
            return true;
        } else {
            return false;
        }

    },

    trace: function (count) {
        var caller = arguments.callee.caller;
        var i = 0;
        count = count || 10;
        cc.log("***----------------------------------------  ** " + (i + 1));
        while (caller && i < count) {
            cc.log(caller.toString());
            caller = caller.caller;
            i++;
            cc.log("***---------------------------------------- ** " + (i + 1));
        }
    },

    //获取指定格式的时间(年月日)
    timeHandle1: function () {
        let nowTime = new Date();
        let year = nowTime.getFullYear();
        let month = this.formatTime(nowTime.getMonth() + 1);
        let date = this.formatTime(nowTime.getDate());
        let result = year + '-' + month + '-' + date;
        return result;
    },

    //获取指定格式的时间(小时分钟秒)
    timeHandle2: function () {
        let nowTime = new Date();
        let hour = this.formatTime(nowTime.getHours())
        let minute = this.formatTime(nowTime.getMinutes());
        let seconds = this.formatTime(nowTime.getSeconds());
        let result = hour + ':' + minute + ':' + seconds;
        return result;
    },

    //时间格式转换成时间戳
    timeToTimestamp: function (timestr) {
        var date = new Date(timestr);
        return Date.parse(date);
    },



    formatTime: function (time) {
        if (time < 10) {
            return '0' + time;
        } else {
            return time;
        }
    },

    getLinkUrl: function () {
        var time = new Date().getTime();
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = '//' + document.domain + '/ErrorPage/linkUrl.js?time=' + time;
        document.head.appendChild(script);
    },

    handleADCountDown () {
        window.adCountDown--;
        if (window.adCountDown <= 0) {
            clearInterval(window.adCDHandler);
            window.adCDHandler = -1;
        }
        // console.log('desc num ', window.adCountDown, this.timeHandle2())
    },
    // <!-- 视频广告-->
    getBaiduAD: function () {
        var self = this;
        window.hasAdIndex = false;
        window.isAdverStatus = false;
        window.isLocking = false;
        window.adCountDown = 0;
        window.adCDHandler = -1;

        var readADsLogDate = '';
     //   var sourceType = 6; // 广告 区别 字段

        if (!bp.platform.isBaiduChannel()) return;

        var script = document.createElement("script");
        script.type = "text/javascript";
        var loadBDCall = function () {
            var scr_id = 1725;
            var product_id = 25;
            console.log(' window.loadRewardVideo init.');
            window.loadRewardVideo = function () {
                var request = bp.platform.getRequest();
                if (request['channel'] == '100039') {
                    scr_id = 1725;
                    product_id = 25;
                } else if (request['channel'] == '100042') {
                    scr_id = 1726;
                    product_id = 30;
                }
                console.log('rewardVideo = ', rewardVideo);
                rewardVideo.init({
                    pageColor: '#24B46A',
                    isMuted: true,
                    productId: product_id,
                    srcid: scr_id,
                    onStartPlay: function () {
                        console.log('this is video start');
                        bp.event.emit('Event_baiduAD_play');
                        isAdverStatus = false;
                        readADsLogDate = new Date().getTime();

                        // //调用后端接口
                        // bp.http.request(bp.config.urlAdLog, {
                        //     logId: readADsLogDate, status: 1, type: sourceType
                        // }, null, null, false, false);
                        bp.event.emit('Event_baiduAD_play', readADsLogDate);
                    },
                    onEndPlay: function () {
                        console.log('this is video end');
                        isAdverStatus = true;

                        // //调用后端接口
                        // bp.http.request(bp.config.urlAdLog, {
                        //     logId: readADsLogDate, status: 3, type: sourceType
                        // }, null, null, false, false);
                        bp.event.emit('Event_baiduAD_end', readADsLogDate);
                        readADsLogDate = null;
                    },
                    onAdClose: function (data) {
                        // type:
                        // NAVIDEO: 表示是视频页面
                        // NAVIDEO_TAIL: 表示是尾帧页面
                        console.log('guanbi')
                        if (rewardVideo.destroy) rewardVideo.destroy();
                        setTimeout(() => loadRewardVideo(), 3000);
                        hasAdIndex = false;
                        window.isLocking = true;
                        window.adCountDown = 8;
                        window.adCDHandler = setInterval(() => {
                            self.handleADCountDown();
                        }, 1000);
                        bp.event.emit('Event_baiduAD_close',readADsLogDate);
                        isAdverStatus = false;

                        //调用后端接口
                        // if (readADsLogDate) {
                        //     bp.http.request(bp.config.urlAdLog, {
                        //         logId: readADsLogDate, status: 2, type: sourceType
                        //     }).showLoading(false).showMessage(false).request();
                        // }
                    },
                    onAdClick: function (data) {
                        // type:
                        // NAVIDEO: 表示是视频页面
                        // NAVIDEO_TAIL: 表示是尾帧页面
                        console.log('this is ad click', data);
                    },
                }).then(function (res) {
                    console.log('init res = ', res);
                    if (res.errno) {
                        window.isLocking = false;
                        window.hasAdIndex = false;
                        try {
                            parent && parent.closeNoAdver('暂无广告');
                        } catch (e) {
                        }
                        console.log('error:', res.errmsg);
                        return;
                    }
                    window.hasAdIndex = true;
                    setTimeout(() => {
                        window.isLocking = false;
                    }, 5000);
                    window.adCountDown = 5;
                    if (window.adCDHandler === -1) {
                        window.adCDHandler = setInterval(() => {
                            self.handleADCountDown();
                        }, 1000);
                    }
                });
            };
        }
        if (script.readyState) {  //IE
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" || script.readyState == "complete") {
                    script.onreadystatechange = null; //解除引用
                    loadBDCall();
                    bp.event.emit('Event_loadBDADS');
                }
            };
        } else {  //Others
            script.onload = function () {
                loadBDCall();
                bp.event.emit('Event_loadBDADS');
            };
        }

        script.src = 'https://na0.bdstatic.com/static/cover/static/rewardVideo/index-1.0.0.js?time=' + 2015;
        document.head.appendChild(script);
    },

    timestampToTime: function (timestamp) {
        var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
        var Y = date.getFullYear() + '-';
        var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        var D = date.getDate() + ' ';
        var h = date.getHours() + ':';
        var m = date.getMinutes() + ':';
        var s = date.getSeconds();
        return Y + M + D + h + m + s;
    },

    timestampToTimeHour: function (timestamp) {
        var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
        var h = date.getHours() + ':';
        var m = date.getMinutes() + ':';
        var s = date.getSeconds();
        return h + m + s;
    },

    /**
     * @param {string} 传入的字符串
     * @param {array}  需要被剔除的字符串数组
     */
    stringOut (str, replaceStrArr) {
        for (let i = 0; i < replaceStrArr.length; i++) {
            str = str.replace(replaceStrArr[i], '')
        }
        return str;
    },

    /**
    * 格式化时间 YY MM DD hh mm ss ms 
    * @param {String} format 
    * @param {Number} time //时间单位 毫秒
    */
    timeFormat (time, format) {

        let twoC = function (num) {
            if (num < 10) {
                return '0' + num;
            }
            return '' + num;
        };

        let date = new Date(time);
        let year = date.getFullYear();
        let month = twoC(date.getMonth() + 1);
        let day = twoC(date.getDate());

        let hour = twoC(date.getHours());
        let minute = twoC(date.getMinutes());
        let second = twoC(date.getSeconds());
        let ms = date.getMilliseconds();

        if (!format) {
            return year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
        }

        format = format.replace('YY', year);
        format = format.replace('MM', month);
        format = format.replace('DD', day);
        format = format.replace('hh', hour);
        format = format.replace('mm', minute);
        format = format.replace('ss', second);
        format = format.replace('ms', ms);

        return format;
    },


};

Util.patch();

module.exports = Util;