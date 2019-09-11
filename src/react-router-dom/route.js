import React, { Component } from 'react'
import RouterContext from './context';
import pathToRegexp from 'path-to-regexp';

export class Route extends Component {
    static contextType=RouterContext;
    render() {
        let {pathname} =this.context.location;
        let {path,component:Component,exact=false}=this.props;
        let paramNames=[];
        let regexp=pathToRegexp(path,paramNames,{end:exact});
        let result = pathname.match(regexp);
        if(result){
            return <Component />
        }
        return null;
    }
}

export default Route
