"use strict";
var TTT = (function () {
    function TTT(data) {
        this.data = data;
        var that = this;
        // console.log(Object.(that))
        // this['a'] = this.data.a
        // for (let [k, v] of Object.entries(this.data)) {
        //   let that = this
        //   Object.defineProperty(this, k, {
        //     get() {
        //       return that.data[k]
        //     },
        //     set(x: any) {
        //       that.data[k] = x
        //     }
        //   })
        // }
    }
    return TTT;
}());
var tt = new TTT({ a: 100 });
var ddd = new Proxy(tt, {
    get: function (target, key, receiver) {
        return tt.data[key];
    },
    set: function (target, key, value, receiver) {
        return Reflect.set(target, key, value, receiver);
    }
});
// let pp = {data: {a: 1}}
console.log(tt.a);
console.log(ddd.a);
// console.log(tt.a)
// console.log(tt.data.a)
// let data: any = {}
// let pp: any = new Proxy(data, {
//   get(target, key, receiver) {
//     return Reflect.get(target, key, receiver)
//   },
//   set(target, key, value, receiver) {
//     return Reflect.set(target, key, value, receiver)
//   }
// })
// data.a = 2
// console.log(pp.a)
// pp.a = 3
// console.log(data.a)
// console.log(pp.a) 
