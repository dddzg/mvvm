interface Data {
	[index: string]: any
}
interface DzgConfig {
	el: string,
	data: Data
}

class Dzg implements DzgConfig {
	static nodeType= {
		text: '#text'
	}
	static nowNode: Node
	el: string
	data: Data
	domRoot: HTMLElement
	mapHtml: WeakMap<{target: Data, key: any}, Node[]> = new WeakMap()

	constructor(config: DzgConfig) {
		this.el = config.el
		let that = this
    this.data = this.buildProxy(config.data)
		this.domRoot = document.querySelector(this.el) as HTMLElement
		this.parseAndRender(this.domRoot)

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
	parseAndRender(root: HTMLElement) {
		for (let i = 0; i < root.childNodes.length; ++i) {
			Dzg.nowNode = root.childNodes.item(i)
			// text的情况
			if (Dzg.nowNode.nodeName === Dzg.nodeType.text) { 
        // <div>123</div>不会再这一层解析
				this.parseText(Dzg.nowNode)
			}
			// else{
			//     console.log(Dzg.nowNode.nodeName,Dzg.nodeName.text);
			// }

			if (Dzg.nowNode.hasChildNodes()) {
				this.parseAndRender(Dzg.nowNode as HTMLElement)  // 递归
			}
			// if (child.nodeType)
		}
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
	parseText(node: Node) {
	  if (node.nodeValue === null) return
	  node.nodeValue =
	  node.nodeValue.replace(/{{(.*)}}/g, (initData, key) => {
			// key可能会是xx.yy
      let obj = this.getObject(key)
		  let initQue = this.mapHtml.get(obj) || []
		  initQue.push(node)
		  this.mapHtml.set(obj, initQue)
		  return obj.target[obj.key]
	  })
	  // 把{{变量}}把变量全部提取出来
	}
  /**
   * 解析xx.yy.zz
   * @param key 
   */
  parseKey(key: string) {
    return key.split('.')
  }
  getObject(key: string) {
    let keyArray = this.parseKey(key)
    let length = keyArray.length
    let target = this.data
    for (let i = 0; i < length - 1; ++i) {
      let k = keyArray[i]
      target = target[k]
    }
    return {
      target: target,
      key: keyArray[length - 1]
    }
  }
  buildProxy(data: Data= {}) {
    for (let [k, v] of Object.entries(data)){
      if (Util.isObject(v)) {
        data[k] = this.buildProxy(v)
      }
    }
    let that = this
    data = new Proxy(data, {
      get(target, key, receiver) {
        return Reflect.get(target, key, receiver)
      },
      set(target, key, value, receiver) {
        if (value === target[key]) {
          return false
        } else {
          let Queue = that.mapHtml.get({target, key})
          Queue && Queue.forEach((Value) => {
            Value.nodeValue = value
          })
          return Reflect.set(target, key, value, receiver)
        }
      }
    })
    return data
  }
}


class Util {
  static isObject(data: any) {
    return data !== null && (typeof data === 'object')
  }
}