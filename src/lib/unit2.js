import $ from 'jquery';
import { Element } from './element'
import types from './types';

let diffQueue = [];
let updateDepth = 0;

class Unit {
    constructor(element) {
        this._currentElement = element;
    }
    getMarkUp() {
        throw Error('此方法不能调用')
    }
}

class TextUnit extends Unit {
    getMarkUp(reactId) {
        this._reactId = reactId;
        return `<span data-reactid="${reactId}">${this._currentElement}</span>`
    }

    update(nextElement) {
        if (this._currentElement !== nextElement) {
            this._currentElement = nextElement;
            $(`[data-reactid="${this._reactId}"]`).html(this._currentElement)
        }
    }
}


class NativeUnit extends Unit {

    getMarkUp(reactid) {
        this._reactId = reactid;
        let { type, props } = this._currentElement;
        let tagStart = `<${type} data-reactid="${this._reactId}" `;
        let childString = ``;
        let tagEnd = `</${type}>`;
        this._childrenUnits = [];
        for (let name in props) {
            if (/^on[A-Z]/.test(name)) {
                let eventName = name.slice(2).toLowerCase();
                $(document).delegate(`[data-reactid="${this._reactId}"]`, `${eventName}.${this._reactId}`, props[name]);
            } else if (name === 'style') {
                let styleObj = props[name];
                let styleStr = Object.entries(styleObj).map(([key, val]) => {
                    key = key.replace(/[A-Z]/, (matched) => `-${matched.toLowerCase()}`)
                    return `${key}:${val}`
                }).join(';');

                tagStart += (` ${name}="${styleStr}"`);
            } else if (name === 'className') {
                tagStart += (` class="${props[name]}"`);
            } else if (name === 'children') {
                let children = props[name];
                children.forEach((child, index) => {
                    let childUnit = createUnit(child);
                    childUnit._mountIndex = index;
                    this._childrenUnits.push(childUnit);
                    let markUp = childUnit.getMarkUp(`${this._reactId}.${index}`);
                    childString += markUp;
                })
            } else {
                tagStart += (` ${name}="${props[name]}"`)
            }
        }
        return tagStart + '>' + childString + tagEnd;
    }

    update(newElement) {
        //获取老的是 属性
        let oldProps = this._currentElement.props;
        // 获取新的属性
        let newProps = newElement.props;
  
        this.updateDomChildren(newElement.props.children) // 更新新的子集
        this.updateProperties(oldProps, newProps); // 先更新父级的属性
    }

    updateProperties(oldProps, newProps) {

        for (let name in oldProps) {
            //判断新的属性里里面包不包含旧的属性
            if (!newProps.hasOwnProperty(name)) {
                //如果不包含 那就删除该属性
                $([`data-reactid="${this._reactId}"`]).removeAttr(name);
            }
            //如果有事件每次更新时需要吧旧的事件 取消绑定 然后在更新的时候重新绑定 这样不会出现多次绑定的情况
            if (/^on[A-Z]/.test(name)) {
                console.log('删除事件',this._reactId);
                $(document).undelegate(`.${this._reactId}`);
            }
        }
        // 循环新的属性

        for (let name in newProps) {
            if (name === 'children') { //如果是子集 先跳出循环
                continue;
            } else if (/^on[A-Z]/.test(name)) { // 如果是事件  重新给元素绑定新的事件
                let eventName = name.slice(2).toLowerCase();
                //  console.log('更新事件',this._reactId,eventName);
                //  $(document).delegate(`[data-reactid="${this._reactId}"]`,`${eventName}.${this._reactId}`, newProps[name])
                setTimeout(()=> {
                    console.log('更新事件',this._reactId,eventName);
                    $(document).delegate(`[data-reactid="${this._reactId}"]`,`${eventName}.${this._reactId}`, newProps[name])
                })
                
            } else if (name === 'style') { //如果是style
                let styleObj = newProps[name]; //获取新的样式属性
                Object.entries(styleObj).forEach(([key, val]) => { //循环样式对象 给旧的属性添加样式
                    $(`[data-reactid="${this._reactId}"]`).css(key, val);
                });
            } else {
                // 给旧的对象添加属性
                $(`[data-reactid="${this._reactid}"]`).prop(name, newProps[name]);
            }
        }
    }

    updateDomChildren(newChildrenElement) {
        updateDepth++
        this.diff(diffQueue, newChildrenElement) //调用diff 对比更新
        updateDepth--;
        if (updateDepth === 0) {
            this.patch(diffQueue);
            diffQueue = [];
        }
    }

    patch(diffQueue) {
        let deleteChildren = [];
        let deleteMap = {};

        for (let i = 0; i < diffQueue.length; i++) {
            let difference = diffQueue[i];
            if (difference.type === types.MOVE || difference.type===types.REMOVE) {
                let fromIndex = difference.fromIndex;
                let oldChild = difference.parentNode.children().get(fromIndex);
                if(!deleteMap[difference.parentId]){
                    deleteMap[difference.parentId]={}
                }
              
                deleteMap[difference.parentId][fromIndex] = oldChild;
                deleteChildren.push(oldChild);
            }
        }
        
        $.each(deleteChildren, (index, item) => {
            console.log($(item).data('reactid'),'删除事件');
            $(document).undelegate(`.${$(item).data('reactid')}`)
            $(item).remove();
        })

        for (let i = 0; i < diffQueue.length; i++) {
            let difference = diffQueue[i];
            switch (difference.type) {
                case types.INSERT:
                    this.insertChildAt(difference.parentNode,difference.toIndex,difference.markUp)
                    break;
                case types.MOVE:
                    this.insertChildAt(difference.parentNode,difference.toIndex,deleteMap[difference.parentId][difference.fromIndex])
                    break;
                default:
                    break;
            }
        }
    }

    insertChildAt(parent,index,node){
        let oldChild=parent.children().get(index);
        oldChild?$(node).insertBefore(oldChild):$(node).appendTo(parent);
    }

    diff(diffQueue, newChildrenElement) {
        let oldChildrenUnitMap = this.getOldChildrenMap(this._childrenUnits); // this._childrenUnits 改属性是在创建父级uint时 把子集的 unit 添加到里面;  
        let { newChildrenUnits, newChildrenUnitsMap } = this.getNewChildren(oldChildrenUnitMap, newChildrenElement);
        let lastIndex = 0; //上一个已经确定位置的索引

        for (let i = 0; i < newChildrenUnits.length; i++) {
            let newUnit = newChildrenUnits[i];
            let newKey = (newUnit._currentElement.props && newUnit._currentElement.props.key) || i.toString();
            let oldUnit = oldChildrenUnitMap[newKey];
            if (oldUnit === newUnit) {
                if (oldUnit._mountIndex < lastIndex) {
                    diffQueue.push({
                        parentId: this._reactId,
                        parentNode: $(`[data-reactid="${this._reactId}"]`),
                        type: types.MOVE,
                        fromIndex: oldUnit._mountIndex,
                        toIndex: i,
                    })
                    this._childrenUnits=this._childrenUnits.filter(item=>item!=oldUnit)
                    //$(document).undelegate(`.${oldUnit._reactId}`)
                }
                lastIndex = Math.max(lastIndex, oldUnit._mountIndex);
            } else {
                if(oldUnit){
                    diffQueue.push({
                        parentId: this._reactId,
                        parentNode: $(`[data-reactid="${this._reactId}"]`),
                        type: types.REMOVE,
                        fromIndex: oldUnit._mountIndex
                    })
                }
                diffQueue.push({
                    parentId: this._reactId,
                    parentNode: $(`[data-reactid="${this._reactId}"]`),
                    type: types.INSERT,
                    markUp: newUnit.getMarkUp(`${this._reactId}.${i}`),
                    toIndex: i
                })
            }
            newUnit._mountIndex = i;
        }

        for (let key in oldChildrenUnitMap) {
            let oldUnit = oldChildrenUnitMap[key];
            if (!newChildrenUnitsMap.hasOwnProperty(key) ) {
                diffQueue.push({
                    parentId: this._reactId,
                    parentNode: $(`[data-reactid="${this._reactId}"]`),
                    type: types.REMOVE,
                    fromIndex: oldUnit._mountIndex
                })
                this._childrenUnits=this._childrenUnits.filter(item=>item!=oldUnit)
                // $(document).undelegate(`.${oldUnit._reactId}`) 
                // 这个位置 把事件去掉回导致删到最后一个元素的时候 事件不会触发
            }
        }
    }



    getNewChildren(oldChildren, newChildrenElement) {
        let newChildrenUnits = [];
        let newChildrenUnitsMap = {};
        newChildrenElement.forEach((newElement, index) => {
            // 在新的子集里面 遍历寻找 旧的key unit(单元)是否存在 如果存在就放入数组中 
            let newKey = (newElement.props && newElement.props.key) || index.toString();
            let oldUnit = oldChildren[newKey];
            let oldElement = oldUnit && oldUnit._currentElement;
            //然后用旧的element 和 新的 newElement 做对比 type 是否一致  如果一致就直接更新子集里面的属性
            if (shouldDeepCompare(oldElement, newElement)) {
                oldUnit.update(newElement);
                newChildrenUnitsMap[newKey] = oldUnit;
                newChildrenUnits.push(oldUnit)  //把属性添加到数组中  以便后面复用
            } else {// 如果type 不一致  就创建一个新的属性 然后放入数组中 最后返回改数组 生产的新的 单元对象
                let newUnit = createUnit(newElement);
                newChildrenUnits.push(newUnit)
                newChildrenUnitsMap[newKey] = newUnit;
                this._childrenUnits[index]=newUnit;
            }
        })
        return { newChildrenUnits, newChildrenUnitsMap };
    }
    //遍历旧的的子集  给每个子集添加一个key属性 用来和新 unit单元 做对比
    getOldChildrenMap(childrenUnits = []) {
        let oldMap = {};
        for (let i = 0; i < childrenUnits.length; i++) {
            let unit = childrenUnits[i];
            let key = (unit._currentElement.props && unit._currentElement.props.key) || i.toString();
            oldMap[key] = unit;
        }
        return oldMap;
    }
}


class CompositeUnit extends Unit {

    update(nextElement, partialState) {

        this._currentElement = nextElement || this._currentElement;

        //拿到这个组件上的实例  把state 属性  和传进来的 partialState 更新属性合并; 得到一个新的属性
        let nextState = Object.assign(this._componentInstance.state, partialState);
        // 拿到这个实例上面的props 属性
        let nextProps = this._componentInstance.props;
        //判断改组件 是否存在componentShouldUpdate方法  并调用改方法 里面传入 最新的state 和最新的props
        if (this._componentInstance.componentShouldUpdate && !this._componentInstance.componentShouldUpdate(nextState, nextProps)) {
            return;
        }
        // 拿到上一个渲染的单元
        let preUnit = this._renderedUnit;
        //拿到上一个渲染的 element 可能是字符串 也可以能是一个 对象
        let preElemnt = preUnit._currentElement;
        // 拿到当前更新后的实例render的element 可能是一个字符串 也可能是一个对象
        let currentElement = this._componentInstance.render()
        //判断新旧两个element的 type 是否一致 需不需要深度比较更新 如果不存在 默认返回true 
        if (shouldDeepCompare(preElemnt, currentElement)) {
            //如果是一样的类型 那么就把这个新的属性交给 旧的单元里面去更新 属性就好 不用去做删除增加dom的操作。
            preUnit.update(currentElement);

            this._componentInstance.componentDidUpdate && this._componentInstance.componentDidUpdate();
        } else { //如果不需要深度比较
            //  把这个 当前这个element 单元化;
            this._renderedUnit = createUnit(currentElement);
            // 然后把这个单元 获取 dom标签字符串
            let currentMarkUp = this._renderedUnit.getMarkUp(this._reactId);
            // 通过reactid 查找要替换的dom 然后和新的dom 做replace 替换
            $(`[data-reactid=${this._reactId}]`).replaceWith(currentMarkUp);
        }
    }


    getMarkUp(reactId) {
        this._reactId = reactId;

        let { type: Component, props } = this._currentElement;
        // 实例化传入的 Counter 组件
        let componentInstance = this._componentInstance = new Component(props);

        //把当前单元挂在到这个实例化组件的 _currentUnit 属性上;
        this._componentInstance._currentUnit = this;

        // 执行将要更新的 函数
        componentInstance.componentWillMount && componentInstance.componentWillMount();
        //执行实例组件里面的render方法 生成一个elment 对象 里面包含 type 和 props
        let renderElement = componentInstance.render();
        // 吧得到的对象 又单元化 得到render 里面<div></div>的单元 最简单的是textUnit 或者也是其他单元 NativeUnit
        let renderedUnit = createUnit(renderElement);
        //把这个单元挂在到  this 上面
        this._renderedUnit = renderedUnit;
        // 注册一个mounted 事件 当调用$.html 的时候触发
        $(document).on('mounted', () => {
            componentInstance.componentDidMount && componentInstance.componentDidMount();
        })
        //返回一个这个单元的dom 元素标签 
        return renderedUnit.getMarkUp(this._reactId);
    }

}


const createUnit = (element) => {
    if (typeof element === 'string' || typeof element == 'number') {
        return new TextUnit(element)
    }

    if (element instanceof Element && typeof element.type === 'string') {
        return new NativeUnit(element)
    }

    if (element instanceof Element && typeof element.type === 'function') {
        return new CompositeUnit(element)
    }
}

//判断两个元素的类型是否一致
function shouldDeepCompare(oldElemnt, newElement) {
    if (oldElemnt != null && newElement != null) {
        let oldType = typeof oldElemnt;
        let newType = typeof newElement;

        //如果两个element 的type是string 或者数字 那么就是同一种属性 可以直接更新
        if ((oldType === 'string' || oldType === 'number') && (newType === 'string' || newType === 'number')) {
            return true;
        }

        if (oldElemnt instanceof Element && newElement instanceof Element) {
            return oldElemnt.type === newElement.type;
        }
    }
    return false;
}


export {
    createUnit
}



