"use strict";
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var Dzg = (function () {
    function Dzg(config) {
        if (config === void 0) { config = {
            el: '#root',
            method: {},
            data: {}
        }; }
        this.mapHtml = new Map();
        this.prefix = 'dzg-';
        this.el = config.el;
        var that = this;
        this.method = config.method; // 调用时 绑定this.data
        this.domRoot = document.querySelector(this.el);
        this.data = this.buildProxy(config.data);
        this.parseAndRender(this.domRoot);
        // this.method.plus()
        // config.method.plus.bind(this.data)()
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
     * @param {HTMLElement} root
     *
     * @memberOf Dzg
     */
    Dzg.prototype.parseAndRender = function (root) {
        for (var i = 0; i < root.childNodes.length; ++i) {
            Dzg.nowNode = root.childNodes[i];
            // text的情况
            if (Dzg.nowNode.nodeName === Dzg.nodeType.text) {
                // <div>123</div>不会再这一层解析
                this.parseText(Dzg.nowNode);
            }
            else {
                if (Dzg.nowNode.attributes) {
                    /**
                     * 类似于 <div dzg-onclick="plus"></div>
                     * 记得把事件委托到root结点 统一处理
                     */
                    this.parseTagWithAttributes(Dzg.nowNode);
                }
            }
            // else{
            //     console.log(Dzg.nowNode.nodeName,Dzg.nodeName.text);
            // }
            if (Dzg.nowNode.hasChildNodes()) {
                this.parseAndRender(Dzg.nowNode); // 递归
            }
            // if (child.nodeType)
        }
    };
    Dzg.prototype.parseAttribute = function (attr) {
        var name = attr.nodeName;
        var reg = RegExp(this.prefix + "(.+)", 'i');
        var result = name.match(reg);
        if (result) {
            var key = result[1], type = void 0;
            if (key === 'if')
                type = 1; // if类型
            else if (key.slice(0, 2) === 'on') {
                key = key.slice(2);
                type = 2; // on事件类型
            }
            else
                type = 3; // 绑定变量上去
            return {
                key: key,
                type: type,
                value: attr.nodeValue
            };
        }
        return {
            key: name,
            type: 0,
            value: attr.nodeValue
        };
    };
    Dzg.prototype.parseTagWithAttributes = function (node) {
        var attributes = node.attributes;
        var length = node.attributes.length;
        // console.log(node.attributes.removeNamedItem(attributes[0].nodeName))
        // node.setAttribute('dzg', '123')
        // console.log(node.attributes)
        var removeList = [];
        // let addList = new Map < string, string >()
        for (var i = 0; i < length; ++i) {
            var attr = attributes[i];
            var _a = this.parseAttribute(attr), key = _a.key, type = _a.type, value = _a.value;
            // console.log(key, type, value)
            // console.log(attr)
            if (type !== 0)
                removeList.push(attr.nodeName);
            if (value === null)
                continue;
            if (type === 1) {
            }
            else if (type === 2) {
                if (value !== null) {
                    // console.log(this.method)
                    if (value in this.method)
                        node.addEventListener(key, this.method[value].bind(this.data));
                }
            }
            else if (type === 3) {
                // console.log(key, type, value)
                node.setAttribute(key, this.getValueByString(value));
                this.createInitBinding(value, node.getAttributeNode(key));
                // if (value !== null) addList.set(key, value)
            }
        }
        removeList.forEach(function (value) { return node.removeAttribute(value); });
        // addList.forEach((value, key) => node.setAttribute(key, value))
        console.log(removeList);
        // let root = document.getElementById('root')
    };
    /**
     * node有各种api:
     * nodeValue,textContent,data。
     * 感觉还是nodeValue比较好
     *
     * @param {Node} node
     *
     * @memberOf Dzg
     */
    Dzg.prototype.parseText = function (node) {
        var _this = this;
        if (node.nodeValue === null)
            return;
        node.nodeValue =
            node.nodeValue.replace(/{{(.*)}}/g, function (_, initKey) { return _this.createInitBinding(initKey, node); });
        // 把{{变量}}把变量全部提取出来
    };
    Dzg.prototype.getValueByString = function (initKey) {
        var _a = this.getObject(initKey), target = _a.target, key = _a.key;
        return target[key];
    };
    Dzg.prototype.createInitBinding = function (initKey, node) {
        // initKey可能是xx.yy
        var _a = this.getObject(initKey), target = _a.target, key = _a.key;
        var initQue = this.mapHtml.get(target) || [];
        initQue.push(node);
        this.mapHtml.set(target, initQue);
        return target[key];
    };
    /**
     * 解析xx.yy.zz
     * @param key
     */
    Dzg.prototype.parseKey = function (key) {
        return key.split('.');
    };
    Dzg.prototype.getObject = function (key) {
        var keyArray = this.parseKey(key);
        var length = keyArray.length;
        var target = this.data;
        for (var i = 0; i < length - 1; ++i) {
            var k = keyArray[i];
            target = target[k];
        }
        return {
            target: target,
            key: keyArray[length - 1]
        };
    };
    Dzg.prototype.buildProxy = function (data) {
        if (data === void 0) { data = {}; }
        try {
            for (var _a = __values(Object.entries(data)), _b = _a.next(); !_b.done; _b = _a.next()) {
                var _c = __read(_b.value, 2), k = _c[0], v = _c[1];
                if (Util.isObject(v)) {
                    data[k] = this.buildProxy(v);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_b && !_b.done && (_d = _a.return)) _d.call(_a);
            }
            finally { if (e_1) throw e_1.error; }
        }
        var that = this;
        data = new Proxy(data, {
            get: function (target, key, receiver) {
                return Reflect.get(target, key, receiver);
            },
            set: function (target, key, value, receiver) {
                console.log(that.mapHtml);
                if (value === target[key]) {
                    return false;
                }
                else {
                    var Queue = that.mapHtml.get(data) || [];
                    Queue && Queue.forEach(function (Value) {
                        Value.nodeValue = value;
                    });
                    return Reflect.set(target, key, value, receiver);
                }
            }
        });
        return data;
        var e_1, _d;
    };
    return Dzg;
}());
Dzg.nodeType = {
    text: '#text'
};
var Util = (function () {
    function Util() {
    }
    Util.isObject = function (data) {
        return data !== null && (typeof data === 'object');
    };
    return Util;
}());
