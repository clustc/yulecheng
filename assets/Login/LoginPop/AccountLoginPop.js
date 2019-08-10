cc.Class({
    extends: cc.Component,

    properties: {
        btnClose:cc.Node,
        btnLogin:cc.Node,
        txtPassport:cc.EditBox,
        txtPassword:cc.EditBox,
    },

    start () {
        this.btnClose.on('click', this.onBtnCloseClicked, this);
        this.btnLogin.on('click', this.onBtnLoginClicked, this);

    },

    onBtnCloseClicked(){
        this.node.destroy();
    },

    onBtnLoginClicked(){
        let passport = this.txtPassport.string;
        let password = this.txtPassword.string;

        cc.log(passport, password);

        cc.director.loadScene('Hall');
    },

    // update (dt) {},
});
