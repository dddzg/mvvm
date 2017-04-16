class Dzg {
    constructor(config) {
        this.map = new Map();
        this.el = config.el;
        let that = this;
        this.data = new Proxy(config.data, {
            get(target, key, receiver) {
                return Reflect.get(target, key, receiver);
            },
            set(target, key, value, receiver) {
                if (value === target[key]) {
                    return false;
                }
                else {
                    let Queue = that.map.get(key);
                    Queue.forEach((Value, index) => {
                        Value.nodeValue = value;
                    });
                    return Reflect.set(target, key, value, receiver);
                }
            }
        });
        this.domRoot = document.querySelector(this.el);
        this.parseAndRender(this.domRoot);
        // this.proxy.message='123'
        // console.log(this.proxy.message);
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
            //text的情况
            if (Dzg.nowNode.nodeName === Dzg.nodeName.text) {
                this.parseText(Dzg.nowNode);
            }
            // else{
            //     console.log(Dzg.nowNode.nodeName,Dzg.nodeName.text);
            // }
            if (Dzg.nowNode.hasChildNodes()) {
                this.parseAndRender(Dzg.nowNode); //递归
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
        node.nodeValue =
            node.nodeValue.replace(/{{(.*)}}/g, (initData, key) => {
                let initQue = this.map.get(key) || [];
                initQue.push(node);
                this.map.set(key, initQue);
                this.data.message = '123545';
                return this.data[key];
            });
        //把{{变量}}把变量全部提取出来 
    }
}
Dzg.nodeName = {
    text: '#text'
};
