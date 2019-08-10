/**
 * 消息系统
 * bp.event.on();
 * bp.event.emit();
 * bp.event.offTarget();
 *      
 */
const fastRemoveAt = cc.js.array.fastRemoveAt;

function CallBackList() {
    this.callbacks = [];
    this.targets = [];
};

var proto = CallBackList.prototype;

proto.add = function (callback, target) {
    if (this.has(callback, target)) {
        return false;
    }
    this.callbacks.push(callback);
    this.targets.push(target || null);

    return true;
};

proto.has = function (callback, target) {
    var len = this.callbacks.length;
    for (var i = 0; i < len; i++) {
        if (this.callbacks[i] == callback && this.targets[i] == target) {
            return true;
        }
    }
    return false;
};

proto.removeTarget = function (target) {
    var len = this.targets.length;
    for (var i = 0; i < len; ++i) {
        if (this.targets[i] == target) {
            fastRemoveAt(this.targets, i);
            fastRemoveAt(this.callbacks, i);
            --i;
            --len;
        }
    }
}

proto.envoke = function (type, data) {
    var len = this.targets.length;
    for (var i = 0; i < len; ++i) {
        var callback = this.callbacks[i];
        var target = this.targets[i];
        if (callback && target) {
            callback.call(target, type, data);
        }
    }
}


var Event = {
    _map: cc.js.createMap(true),

    //注册监听事件
    on: function (type, callback, target) {
        this._map[type] = this._map[type] || new CallBackList();
        this._map[type].add(callback, target);
    },

    //抛消息
    emit: function (type, data) {
        var callbacklist = this._map[type];
        if (callbacklist) {
            callbacklist.envoke(type, data);
        }
    },

    //移除监听对象
    offTarget: function (target) {
        for (var type in this._map) {
            var callbacklist = this._map[type];
            if (callbacklist) {
                callbacklist.removeTarget(target);
            }
        }
    },

    //取消对某事件的监听
    offEvent: function (type) {
        delete this._map[type];
    },

};

module.exports = Event;