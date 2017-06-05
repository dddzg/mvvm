interface Data {
	[index: string]: any
}
interface DzgConfig {
	el: string,
	data: Data,
  method: any,
}

class Dzg implements DzgConfig {
	static nodeType= {
		text: '#text'
	}
	static nowNode: Node
	el: string
	data: Data
	domRoot: HTMLElement
	mapHtml: Map<Data, Node[]> = new Map()
  method: any
  prefix= 'dzg-'
	constructor(config: DzgConfig) {
		this.el = config.el
		let that = this
    this.method = config.method // 调用时 绑定this.data
		this.domRoot = document.querySelector(this.el) as HTMLElement
    this.data = this.buildProxy(config.data)
		this.parseAndRender(this.domRoot)

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
	parseAndRender(root: HTMLElement) {
		for (let i = 0; i < root.childNodes.length; ++i) {
			Dzg.nowNode = root.childNodes[i]
			// text的情况
			if (Dzg.nowNode.nodeName === Dzg.nodeType.text) { 
        // <div>123</div>不会再这一层解析
				this.parseText(Dzg.nowNode)
			}else {
        if (Dzg.nowNode.attributes) {
          /**
           * 类似于 <div dzg-onclick="plus"></div>
           * 记得把事件委托到root结点 统一处理 
           */
          this.parseTagWithAttributes(Dzg.nowNode)
        }
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
  parseAttribute(attr: Attr) {
    let name = attr.nodeName
    let reg = RegExp(`${this.prefix}(.+)`, 'i')
    let result = name.match(reg)
    if (result) {
      let key = result[1], type
      if (key === 'if') type = 1 // if类型
      else if (key.slice(0, 2) === 'on') {
        key = key.slice(2)
        type = 2 // on事件类型
      }
      else type = 3  // 绑定变量上去
      return {
        key,
        type,
        value: attr.nodeValue
      }
    }
    return {
      key: name,
      type: 0 , // 可以考虑symbol
      value: attr.nodeValue
    }
  }
  parseTagWithAttributes(node: Node) {
    let attributes = node.attributes
    let length = node.attributes.length
    for (let i = 0; i < length; ++i) {
      let attr = attributes[i]
      let {key, type, value} = this.parseAttribute(attr)
      console.log(key, type, value)
      if (type === 2) {
        if (value !== null) {
          console.log(this.method)
          if (value in this.method)
          node.addEventListener(key, this.method[value].bind(this.data))
        }
      }
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
	  node.nodeValue.replace(/{{(.*)}}/g, (initData, initKey) => {
			// initKey可能会是xx.yy
      let {target, key} = this.getObject(initKey)
		  let initQue = this.mapHtml.get(target) || []
		  initQue.push(node)
		  this.mapHtml.set(target, initQue)
		  return target[key]
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
        console.log(that.mapHtml)
        if (value === target[key]) {
          return false
        } else {
          let Queue = that.mapHtml.get(data) || []
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