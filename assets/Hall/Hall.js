const userMgr = require('UserManager');


cc.Class({
    extends: cc.Component,

    properties: {
        btnBack:cc.Node,
        lblCoin:cc.Label,
        lblName:cc.Label,
    },

    onLoad(){
        let list = [
            cc.url.raw('Resources/protocol/CmdProtocol'),
            cc.url.raw('Resources/protocol/CoreProtocol'),
            cc.url.raw('Resources/protocol/GameProtocol'),
        ];

        bp.socket.loadProtoFiles(list);
    },  

    start () {
        this.btnBack.on('click', this.onBtnBackClicked, this);
        bp.event.on('Event_Coin_Changed', this.updateCoin, this);



        this.updateCoin();
        this.updateName();

        userMgr.coin = 11111;
    },

    onDestroy(){
        bp.event.offTarget(this);
    },

    onBtnBackClicked(){
        userMgr.logOut();
    },

    updateCoin(){
        this.lblCoin.string = userMgr.coin;
    },

    updateName(){
        this.lblName.string= userMgr.name;
    },

});
