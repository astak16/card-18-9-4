function observe(data){
    if(!data || typeof data !== 'object')return
    Object.keys(data).forEach(key=>{
        let value = data[key]
        if(typeof value === 'object'){
            observe(value)
        }
        let subject = new Subject()
        Object.defineProperty(data,key,{
            configurable:true,
            enumerable:true,
            get(){
                if(currentObserver){
                    currentObserver.subscribeTo(subject)
                }
                return value
            },
            set(newValue){
                value = newValue
                subject.notify()
            }
        })

    })
}
let currentObserver = null
let id = 0
class Subject{
    constructor(){
        this.id = id++
        this.observers = []
    }
    addObserver(observer){
        this.observers.push(observer)
    }
    notify(){
        this.observers.forEach(observer=>{
            observer.update()
        })
    }
}
class Observers{
    constructor(obj,key,cb){
        this.observers ={}
        // this.vm = vm
        this.obj = obj
        this.key = key
        this.cb = cb
        this.value = this.getValue()
    }
    update(){
        let oldValue = this.value
        let newValue = this.getValue()
        console.log(oldValue,newValue)
        if(newValue !== oldValue)
            this.value = newValue
            this.cb.call(this.obj,newValue,oldValue)
    }
    subscribeTo(subject){
        if(!this.observers[subject.id]){
            subject.addObserver(this)
            this.observers[subject.id] = subject
        }
    }
    getValue(){
        currentObserver = this
        let value = this.obj[this.key]
        currentObserver = null
        return value
    }
}
class Compile{
    constructor(vm){
        this.vm = vm
        this.node = vm.el
        this.init(vm.data)
        this.compile()
        // observe(this.obj)
    }
    init(data){
        this.data = data
        this.obj = {}
        this.upOneLevel()
    }
    upOneLevel(){
        Object.keys(this.data).map(key=>{
            this.obj = this.data[key]
        })
    }
    compile(){
        this.traverse(this.node)
    }
    traverse(node){
        if(node.nodeType === 1){
            this.compileNode(node)
            node.childNodes.forEach(childNode=>{
                this.traverse(childNode)
            })
        }else if(node.nodeType === 3){
            this.renderText(node)
        }
    }
    renderText(textNode){
        let reg = /{{(.+?)}}/g
        let match
        while(match = reg.exec(textNode.textContent)){
            let raw = match[0]
            let key = match[1]
            textNode.textContent = textNode.textContent.replace(raw,this.obj[key])
            new Observers(this.obj,key,function(newValue,oldValue){
                textNode.textContent = textNode.textContent.replace(oldValue,newValue)
            })
        }
    }
    compileNode(directiveNode){
        let attrs = [...directiveNode.attributes]
        attrs.forEach(attr=>{
            let {name,value} = attr
            if(this.isModelDirective(name)){
                this.bindModel(directiveNode,value)
            }else if(this.isEventDirective(name)){
                this.bindEvent(directiveNode,attr)
            }
        })
    }
    bindModel(modelNode,value){
        modelNode.value = this.obj[value]
        // new Observers(this.obj,value,function(newValue){
        //     modelNode.value = newValue
        // })
        modelNode.addEventListener('input',(e)=> {
            this.obj[value] = e.target.value
        })
    }
    bindEvent(eventNode,attr){
        let eventType = attr.name.substr(5)
        let methodName = attr.value
        eventNode.addEventListener(eventType,this.vm.methods[methodName])
    }
    isModelDirective(attrName){
        return attrName.includes('v-model')
    }
    isEventDirective(attrName){
        return attrName.includes('v-on')
    }
}

class MVVM{
    constructor(options){
        this.init(options)
        observe(this.data)
        new Compile(this)
    }
    init(options){
        this.el = document.querySelector(options.el)
        this.data = options.data
        this.methods = options.methods
        this.upOneLevel(this.data)

        for(let key in this.methods) {
            this.methods[key] = this.methods[key].bind(this)
        }
    }
    upOneLevel(data){
        Object.keys(data).forEach(key=>{
            Object.defineProperty(this,key,{
                configurable:true,
                enumerable:true,
                get:()=>{
                    return this.data[key]
                },
                set:(newValue)=>{
                    this.data[key] = newValue
                }
            })
        })
    }
}