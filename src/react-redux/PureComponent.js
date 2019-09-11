import React, { Component } from 'react'
import { is } from 'immutable'
export class PureComponent extends Component {
    static isPureComponent=true;

    shouldComponentUpdate(nextProps, nextState){
        const oldProps = this.props || {};
        const oldState = this.state || {};
        nextState = nextState || {};
        nextProps = nextProps || {};

        if (Object.keys(oldProps).length !== Object.keys(nextProps).length || Object.keys(oldState).length !== Object.keys(nextState).length) {
            return true;
        }

        for (const key in nextProps) {
            if (!is(oldProps[key], nextProps[key])) {
                return true;
            }
        }
        
        for (const key in nextState) {
            if (!is(oldState[key], nextState[key])) {
                return true;
            }
        }
        return false;
    }

    
}

export default PureComponent
