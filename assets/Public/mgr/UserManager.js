/**
 * 用户信息管理模块（单例）
 * 用于存储玩家游戏数据
 * 数据驱动（数据更新时，抛出变更事件，用于通知注册模块更新相应数据）
 */
var UserManager = {
    /**
     * 是否已登录
     */
    bLoign:false,
    isLogin(){
        return this.bLoign;
    },

    logOut(){
        this.bLoign = false;
        this.clear();
        cc.director.loadScene('Login');
    },

    /**
     * 清空玩家数据
     */
    clear(){
        this.name = '';
        this._coin = '';
    },


    /**
     * 姓名
     */
    _name:'',
    get name(){
        return this._name;
    },

    set name(value){
        return this._name = value;
    },
    
    /**
     * 金额
     */
    _coin:999,
    get coin(){
        return this._coin;
    },
    set coin(value){
        this._coin = value;
        bp.event.emit('Event_Coin_Changed');
    }

};

module.exports = UserManager;
