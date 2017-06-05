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
        this.mapHtml = new Map();
        this.el = config.el;
        var that = this;
        this.data = this.buildProxy(config.data);
        this.domRoot = document.querySelector(this.el);
        this.parseAndRender(this.domRoot);
        config.method.plus();
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
            Dzg.nowNode = root.childNodes.item(i);
            // text的情况
            if (Dzg.nowNode.nodeName === Dzg.nodeType.text) {
                // <div>123</div>不会再这一层解析
                this.parseText(Dzg.nowNode);
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
            node.nodeValue.replace(/{{(.*)}}/g, function (initData, key) {
                // key可能会是xx.yy
                var obj = _this.getObject(key);
                var initQue = _this.mapHtml.get(obj.target) || [];
                initQue.push(node);
                _this.mapHtml.set(obj.target, initQue);
                return obj.target[obj.key];
            });
        // 把{{变量}}把变量全部提取出来
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
