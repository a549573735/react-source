
import React from 'react';
import ReduxContext from './context';
import  {  bindActionCreators } from '../redux'
import  { is } from 'immutable'

export default function connect(stateMap, actionsMap) {
    return (WrappedComponent) => {
        return class WrapperComponent extends React.Component {
            static contextType =ReduxContext;
            constructor(props,context) {
                super(props,context)
                this.state=stateMap(context.store.getState());
                if(typeof actionsMap === "function"){
                    this.actions=actionsMap(context.store.dispatch);
                }else {
                    this.actions=bindActionCreators(actionsMap,context.store.dispatch);
                }
            }

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

            componentDidMount(){
                this.unSubscribe= this.context.store.subscribe(()=>this.setState(stateMap(this.context.store.getState())))
            }    

            componentWillUnmount(){
                this.unSubscribe();
            }
            
            render() {
                
                return <WrappedComponent {...this.state} {...this.actions} />
            }
        }
    }
}