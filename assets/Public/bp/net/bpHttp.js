var platform = require("bpPlatform");

var http = {

    /**
     * 
     */
    getRequest: function () {
        var url = location.search;
        var theRequest = new Object();
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            var strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
            }
        }
        cc.log('获取url参数', theRequest);
        return theRequest;
    },

    /**
     * http请求
     */
    request: function (url, params, sucCbk, errCbk, bShowLoading, bShowErrorMsg) {
        if (!url) {
            bp.util.log('url is null');
            return;
        }
        bShowErrorMsg = !!bShowErrorMsg;
        bShowLoading = !!bShowLoading;

        var success = (data) => {
            sucCbk && sucCbk(data);
        };

        var error = (errStr, code) => {
            if (errCbk) {
                errCbk(errStr, code);
            } else {
                if (bShowErrorMsg) {
                    bp.gui.showMessage("", errStr, null, null, true);
                }
            }
        };

        let xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.setRequestHeader("Authorization", platform.accessToken);
        xhr.setRequestHeader("App-Version", platform.appVersion);
        xhr.setRequestHeader("Repeated-Submission", String(new Date().getTime()));
        xhr.setRequestHeader("App-Channel", platform.wapChannelId);
        xhr.timeout = 15 * 1000; // 15秒超时

        xhr.ontimeout = () => {
            bShowLoading && bp.gui.showLoading(false);
            error && error("连接超时");
        };

        xhr.onerror = () => {
            bShowLoading && bp.gui.showLoading(false);
            error && error("未连接到网络，请检查您的网络设置");
        };

        xhr.onreadystatechange = () => {
            bShowLoading && bp.gui.showLoading(false);
            if (xhr.readyState !== 4) return;
            if (xhr.status >= 200 && xhr.status <= 207) {
                if (xhr.responseText) {
                    // cc.log("receiveURL = ", url, xhr.responseText);
                    var result = JSON.parse(xhr.responseText);
                    if (result.code === 200) {
                        success(result.data);
                    }
                    else if (result.code === 401) {
                        var relogin = function () {
                            cc.sys.localStorage.setItem(bp.platform.token, ""); // 删除accessToken
                            error && error("登录信息已失效，请重新登录", 401);
                            bp.platform.userInfo = null;
                        }
                        if (bp.platform.userInfo && (bp.platform.wapChannelId.indexOf('100039') !== -1 || bp.platform.wapChannelId.indexOf('100042') !== -1)) {
                            bp.http.request((bp.config.urlIsTourist + bp.platform.userInfo.userId), {}, (data) => {
                                if (data) {
                                    cc.sys.localStorage.setItem(bp.platform.token, ""); // 删除accessToken
                                    cc.openUrl("/loginPages/bdLoginPromp.html?bdto=" + "inside-touristlandlord");
                                } else {
                                    relogin();
                                }
                            }, () => {
                                relogin();
                            })
                        } else {
                            if (window.linkUrl) {
                                if (linkUrl.isVistorChannel(bp.platform.wapChannelId)) {
                                    bp.http.request((bp.config.urlIsTourist + bp.platform.userInfo.userId), {}, (msg) => {
                                        if (msg) {
                                            cc.openUrl(linkUrl.getBackUrlByLimit(bp.platform.wapChannelId, bp.platform.gameType))
                                        }
                                    }, () => {
                                        relogin();
                                    })
                                } else {
                                    relogin();
                                }
                            } else {
                                relogin();
                            }
                        }
                    }
                    else {
                        error && error(result.message, result.code);
                    }
                }
                else {
                    error && error("其他错误", xhr.status);
                }
            }
            else {
                error && error("主公，您的网络有点小异常", xhr.status);
            }
        };

        bShowLoading && bp.gui.showLoading(true);

        if (params) {
            xhr.send(JSON.stringify(params));
        } else {
            xhr.send();
        }
    },

    //新埋点请求时调用
    requestFormData: function (url, params) {
        if (!url) {
            bp.util.log('url is null');
            return;
        }
        let xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);
        xhr.timeout = 15 * 1000;

        xhr.onreadystatechange = () => {
            if (xhr.readyState !== 4) return;
            if (xhr.status >= 200 && xhr.status <= 207) {
                if (xhr.responseText) {
                    var result = JSON.parse(xhr.responseText);
                    if (result.code > -1) {
                    }
                    else {
                        console.error(result.message);
                    }
                }
                else {
                    console.error("请求埋点失败");
                }
            }
            else {
                console.error("主公，您的网络有点小异常", xhr.status);
            }
        };
        var data = new FormData();
        data.append("appName", "wf_game");
        data.append("json", JSON.stringify(params));
        xhr.send(data);
    },

};

module.exports = http;