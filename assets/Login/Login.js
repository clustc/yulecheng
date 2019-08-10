cc.Class({
    extends: cc.Component,

    properties: {
        btnLogin:cc.Node,
        prefabLoginPop:cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        cc.director.setDisplayStats(false);

        this.btnLogin.on('click', this.onBtnLoginClicked, this);

        
        let list = [
            cc.url.raw('resources/protocol/CmdProtocol.proto'),
            cc.url.raw('resources/protocol/CoreProtocol.proto'),
            cc.url.raw('resources/protocol/GameProtocol.proto'),
        ];

        bp.socket.loadProtoFiles(list);
    },

    onBtnLoginClicked(){
        let pop = cc.instantiate(this.prefabLoginPop);
        this.node.addChild(pop);
    },
});
