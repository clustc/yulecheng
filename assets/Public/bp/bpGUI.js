var GUI = {
    /**
         * 创建mask
         */
    createBlockMask: function (withShade) {
        let node = new cc.Node();
        let widget = node.addComponent(cc.Widget);
        widget.top = widget.bottom = widget.left = widget.right = 0;
        widget.isAlignTop = widget.isAlignBottom = widget.isAlignLeft = widget.isAlignRight = true;

        node.addComponent(cc.BlockInputEvents);

        node.setColor(cc.color(0, 0, 0));

        return node;
    },

    /**
     * loading展示(屏蔽点击)
     * @param {Boolean} bShow 显示或隐藏loading界面
     * @param {Boolean} withMask 是否有黑色蒙板
     */
    showLoading: function (bShow, withMask) {
        bp.util.log("showLoading not override!")
    },

    /**
     * 通用提示窗, override
     * @param {string} 
     * @param {string} 
     * @param {function} 
     * @param {function} 
     * @param {Boolean} 
     */
    showMessage: function (title, content, okCbk, cancelCbk, hideCancel) {
        bp.util.log("showMessage not override!")
    },

    /**
     * 比赛通用弹窗
     * @param {string}
     * @param {string}
     * @param {function}
     * @param {function}
     */
    showCompetitionMessage: function (btnType, text, okCbk, cancelCbk) {
        bp.util.log("showCompetitionMessage not override!")
    },

    tipPool: new cc.NodePool(),
    /**
     * 通用Tip提示, need override
     */
    showTip: function (msg) {
        bp.util.log("showTip not override!")
    },

    prefabMap: [],
    /**
     * 异步加载prefab弹窗
     * @param {string} prefabPath 相对resources目录
     * @param {cc.Node} parentNode 弹窗父节点，缺省为当前场景Canvas根节点
     * @param {function} cbk 加载完成回调方法，参数弹窗对象
     */
    pop: function (prefabPath, parentNode, cbk) {
        let prefab = this.prefabMap[prefabPath];
        parentNode = parentNode || cc.director.getScene().getChildByName("Canvas");

        if (prefab) {
            let popNode = cc.instantiate(prefab);
            parentNode.addChild(popNode, 10);
            cbk && cbk(popNode);
        } else {
            this.showLoading(true);
            cc.loader.loadRes(prefabPath, (err, prefab) => {
                this.showLoading(false);
                if (err) {
                    bp.util.log("async load prefab failed : ", prefabPath);
                    return;
                }
                this.prefabMap[prefabPath] = prefab;
                let popNode = cc.instantiate(prefab);
                parentNode.addChild(popNode, 10);
                cbk && cbk(popNode);
            });
        }

    },
};

module.exports = GUI;