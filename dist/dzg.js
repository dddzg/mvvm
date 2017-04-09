class Dzg {
    constructor(config) {
        this.el = config.el;
        this.data = config.data;
        this.domRoot = document.querySelector(this.el);
        this.parseAndRender(this.domRoot);
    }
    /**
     * 有API解释一下
     * <div>
     *  123
     *  <p> 132 </p>
     * </div>
     * 像这样的例子 对于div来说 children 只有一个 p
     * 但是childNodes有三个  text p text 最后一个text为空
     *
     * @param {HTMLElement} root
     *
     * @memberOf Dzg
     */
    parseAndRender(root) {
        // console.log(root,root.childElementCount);
        // console.log(root.children);
        // console.log(root.childNodes);
        for (let i = 0; i < root.childNodes.length; ++i) {
            Dzg.nowNode = root.childNodes.item(i);
            if (Dzg.nowNode.nodeName === Dzg.nodeName.text) {
                this.parseText(Dzg.nowNode);
            }
            // else{
            //     console.log(Dzg.nowNode.nodeName,Dzg.nodeName.text);
            // }
            if (Dzg.nowNode.hasChildNodes()) {
                this.parseAndRender(Dzg.nowNode);
            }
        }
        // for (let i=0;i<root.childElementCount;++i){
        //     let child=root.children.item(i) as HTMLElement;
        //     if (child.childElementCount){
        //         this.parseAndRender(child);
        //     }else{
        //         console.log(child);
        //     }
        // }
    }
    /**
     * node有各种api:
     * nodeValue,textContent,data。
     * 感觉还是nodeValue比较好
     *
     * @param {Node} node
     *
     * @memberOf Dzg
     */
    parseText(node) {
        node.nodeValue = node.nodeValue = node.nodeValue.replace(/{{(.*)}}/g, (a, b) => {
            return this.data[b];
        });
    }
}
Dzg.nodeName = {
    text: '#text'
};
