
import { Element } from './element'
import $ from 'jquery';
import types from './types';
let diffQueue = []; //差异队列
let updateDepth = 0; //更新的级别

class Unit {
    constructor(element) {
        this._currentElement = element;
    }
    
    getMarkUp() {
        throw Error('不能调用此方法')
    }
}


class TextUnit extends Unit {
    getMarkUp(reactId) {
        this.reactId = reactId;
        return `<span data-reactid="${this.reactId}">${this._currentElement}</span>`
    }

    update(nextElement) {

        if (this._currentElement !== nextElement) {
            this._currentElement = nextElement;
            $(`[data-reactid="${this.reactId}"]`).html(this._currentElement);
        }
    }
}

class NativeUnit extends Unit {

    getMarkUp(reactId) {
        this.reactId = reactId;
        this._renderChildrenUnits = [];
        let { type, props } = this._currentElement;
        let tagStart = `<${type} data-reactid="${this.reactId}" `;
        let childStr = ``;
        let tagEnd = `</${type}>`
        for (let name in props) {
            if (/^on[A-Z]/.test(name)) {
                let eventName = name.slice(2).toLowerCase();
                $(document).delegate(`[data-reactid="${this.reactId}"]`, `${eventName}.${this.reactId}`, props[name]);
            } else if (name === 'style') {
                let styleObj = props[name];
                let styleStr = Object.entries(styleObj).map(([key, val]) => {
                    key = key.replace(/[A-Z]/, (matched) => `-${matched.toLowerCase()}`);
                    return `${key}:${val}`
                }).join(';');
                tagStart += ` style="${styleStr}"`;
            } else if (name === 'className') {
                tagStart += `class="${props[name]}"`
            } else if (name === 'children') {
                let children = props[name];
                children.forEach((child, index) => {
                    let childUnit = createUnit(child);
                    childUnit._mountIndex = index;
                    this._renderChildrenUnits.push(childUnit);
                    let childMarkUp = childUnit.getMarkUp(`${this.reactId}.${index}`);
                    childStr += childMarkUp;
                })
            } else {
                tagStart += `${name}="${props[name]}"`;
            }
        }
        return tagStart + ' > ' + childStr + tagEnd;
    }

    updateDOMProperties(oldProps, newProps) {
   
        for (let propsName in oldProps) {
            if (!newProps.hasOwnProperty(propsName)) {
                $(`[data-reactid="${this.reactId}]"`).removeAttr(propsName);
            }
            if (/^on[A-Z]/.test(propsName)) {
                $(document).undelegate(`.${this.reactId}`);
            }
        }

        for (let propsName in newProps) {
            if (propsName === 'children') {
                continue;
            } else if (/^on[A-Z]/.test(propsName)) {
                let eventName = propsName.slice(2).toLowerCase();
                setTimeout(()=>{
                    $(document).delegate(`[data-reactid="${this.reactId}"]`,`${eventName}.${this.reactId}`, newProps[propsName])
                })
            } else if (propsName === 'style') {
                let styleObj = newProps[propsName];
                Object.entries(styleObj).map(([key, val]) => {
                    $(`[data-reactid="${this.reactId}"]`).css(key, val);
                })
            } else if (propsName === 'className') {
                $(`[data-reactid="${this.reactId}"]`).prop('class', newProps[propsName])
            } else {
                $(`[data-reactid="${this.reactId}"]`).prop(propsName, newProps[propsName])
            }
        }
    }

    update(nextElement) {
        let oldProps = this._currentElement.props;
        let newProps = nextElement.props;
        this.updateDOMProperties(oldProps, newProps);
        this.updateDOMChildren(nextElement.props.children);
    }

    updateDOMChildren(nextChildrenElements) {
        updateDepth++;
        this.diff(diffQueue, nextChildrenElements);
        updateDepth--;
        if (updateDepth === 0) {
            this.patch(diffQueue);
            diffQueue = [];
        }
    }

    patch(diffQueue) {
        let deleteChildren = []; // 存放所有要删除的节点
        let deleteMap = {};   // 这里暂存能复用的节点
        for (let i = 0; i < diffQueue.length; i++) {
            let difference = diffQueue[i];
            if (difference.type === types.MOVE || difference.type === types.REMOVE) {
                let fromIndex = difference.fromIndex;
                let oldChild = difference.parentNode.children().eq(fromIndex);
                if(!deleteMap[difference.parentId]){
                    deleteMap[difference.parentId]={};
                }
                deleteMap[difference.parentId][fromIndex] = oldChild;
                deleteChildren.push(oldChild);
            }
        }

        $.each(deleteChildren, (idx, item) =>$(item).remove())

        for (let i = 0; i < diffQueue.length; i++) {
            let difference = diffQueue[i];
            switch (difference.type) {
                case types.INSERT:
                    this.insertChildAt(difference.parentNode, difference.toIndex, difference.markUp)
                    break;
                case types.MOVE:
                    this.insertChildAt(difference.parentNode, difference.toIndex, deleteMap[difference.parentId][difference.fromIndex])
                    break;
                default:
                    break;
            }
        }
    }

    insertChildAt(parentNode, toIndex, markUp) {
        let oldChild = parentNode.children().get(toIndex);
        oldChild ? $(markUp).insertBefore(oldChild) : $(markUp).appendTo(parentNode);
    }


    diff(diffQueue, nextChildrenElements) {
        let oldChildrenUnitMap = this.getOldChildrenMap(this._renderChildrenUnits);
        let { newChildUnitsArr, newChildUnitsMap } = this.getNewChildrenUnit(oldChildrenUnitMap, nextChildrenElements);
        let lastIndex = 0; //上一个已经确定的索引;
        for (let i = 0; i < newChildUnitsArr.length; i++) {
            let newUnit = newChildUnitsArr[i];
            let newKey = (newUnit._currentElement.props && newUnit._currentElement.props.key) || i.toString();
            let oldChild = oldChildrenUnitMap[newKey];
            if (oldChild === newUnit) {   //如果说新老一致的话 说明复用老节点;
                if (oldChild._mountIndex < lastIndex) {
                    diffQueue.push({
                        parentId: this.reactId,
                        parentNode: $(`[data-reactid="${this.reactId}"]`),
                        type: types.MOVE,
                        fromIndex: oldChild._mountIndex,
                        toIndex: i
                    })
                }
                lastIndex = Math.max(oldChild._mountIndex, lastIndex);
            } else {
                if (oldChild) {
                    diffQueue.push({
                        parentId: this.reactId,
                        parentNode: $(`[data-reactid="${this.reactId}"]`),
                        type: types.REMOVE,
                        fromIndex: oldChild._mountIndex
                    })
                    this._renderChildrenUnits=this._renderChildrenUnits.filter(item=>item!==oldChild);
                    $(document).undelegate(`.${oldChild.reactId}`);
                };
                diffQueue.push({
                    parentId: this.reactId,
                    parentNode: $(`[data-reactid="${this.reactId}"]`),
                    type: types.INSERT,
                    toIndex: i,
                    markUp: newUnit.getMarkUp(`${this.reactId}.${i}`)
                });
            }
            newUnit._mountIndex = i;
        }

        for (let oldKey in oldChildrenUnitMap) {
            if (!newChildUnitsMap.hasOwnProperty(oldKey)) {
                let oldChild=oldChildrenUnitMap[oldKey];
                diffQueue.push({
                    parentId: this.reactId,
                    parentNode: $(`[data-reactid="${this.reactId}"]`),
                    type: types.REMOVE,
                    fromIndex: oldChild._mountIndex
                })
                this._renderChildrenUnits=this._renderChildrenUnits.filter(item=>item!==oldChild);
                $(document).undelegate(`.${oldChild.reactId}`);
            }
        }

    }

    getNewChildrenUnit(oldChildrenUnitMap, nextChildrenElements) {
        let newChildUnitsArr = [];
        let newChildUnitsMap = {};
        nextChildrenElements.forEach((newElement, index) => {
            let newKey = (newElement.props && newElement.props.key) || index.toString();
            let oldUnit = oldChildrenUnitMap[newKey];
            let oldElement = oldUnit && oldUnit._currentElement;
            if (shouldDeepCompare(oldElement, newElement)) {
                oldUnit.update(newElement);
                newChildUnitsArr.push(oldUnit);
                newChildUnitsMap[newKey] = oldUnit;
            } else {
                let newUnit = createUnit(newElement);
                newChildUnitsArr.push(newUnit);
                newChildUnitsMap[newKey] = newUnit;
                this._renderChildrenUnits[index]=newUnit;
            }
        })
        return {
            newChildUnitsArr,
            newChildUnitsMap
        }
    }

    getOldChildrenMap(childrenUnits = []) {
        return childrenUnits.reduce((pre, cur, index) => {
            let key = (cur && cur._currentElement && cur._currentElement.props && cur._currentElement.props.key) || index.toString();
            pre[key] = cur;
            return pre;
        }, {})
    }


  


}


class CompositeUnit extends Unit {

    update(nextElement, partialState) {
        this._currentElement = nextElement || this._currentElement;

        let nextState = Object.assign(this._componentInstace.state, partialState)
        let nextProps = this._componentInstace.props;
        if (this._componentInstace.componentShouldUpdate && !this._componentInstace.componentShouldUpdate(nextState, nextProps)) {
            return;
        }
        let preElement = this._renderUnit._currentElement;

        let currentElement = this._componentInstace.render();

        if (shouldDeepCompare(preElement, currentElement)) {

            this._renderUnit.update(currentElement);

            this._componentInstace.componentDidUpdate && this._componentInstace.componentDidUpdate();
        } else {
            this._renderUnit = createUnit(currentElement);
            let markUp = this._renderUnit.getMarkUp(this.reactId);
            $(`[data-reactid="${this.reactId}"]`).replaceWith(markUp)
            // console.log() 
        }

    }

    getMarkUp(reactid) {

        this.reactId = reactid;
        let { type: Component, props } = this._currentElement;
        this._componentInstace = new Component(props);

        //给 component 组件调用update 方法;
        this._componentInstace._currentUnit = this;

        this._componentInstace.componentWillMount && this._componentInstace.componentWillMount();

        let renderElment = this._componentInstace.render();

        this._renderUnit = createUnit(renderElment);

        $(document).on('mounted', () => {
            this._componentInstace.componentDidMount && this._componentInstace.componentDidMount();
        })

        return this._renderUnit.getMarkUp(this.reactId);
    }
}


function createUnit(element) {

    if (typeof element === 'string' || typeof element === 'number') {
        return new TextUnit(element);
    }
    if (element instanceof Element && typeof element.type === 'string') {
        return new NativeUnit(element);
    }
    if (element instanceof Element && typeof element.type === 'function') {
        return new CompositeUnit(element);
    }
}

function shouldDeepCompare(oldElement, newElement) {
    if (oldElement != null && newElement != null) {
        let oldType = typeof oldElement;
        let newType = typeof newElement;
        if ((oldType === 'string' || oldType === 'number') && (newType === 'string' || newType === 'number')) {
            return true;
        }
        if (oldElement instanceof Element && newElement instanceof Element) {
            return oldElement.type === newElement.type;
        }
    }
    return false;
}


export {
    createUnit
}