import $ from 'jquery';
import { createUnit } from './unit2.js';
import { createElement } from  './element';
import { Component } from './component';
let React ={
    render,
    rootIndex:1,
    createElement,
    Component
}

function render(element,container){
    let unit = createUnit(element);
    let markUp = unit.getMarkUp(React.rootIndex);
    $(container).html(markUp);
    $(document).trigger('mounted');
}

export default React;