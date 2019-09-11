import $ from 'jquery';
import { createElement}  from './element';
import {createUnit} from './units';
import { Component} from './component'
let react={
    createElement,
    reactId:0,
    render,
    createUnit,
    Component
}


function render(element,container){

    let  unit= createUnit(element);

    let  markUp= unit.getMarkUp(react.reactId);


    $(container).html(markUp);
    $(document).trigger('mounted');
}


export default  react;