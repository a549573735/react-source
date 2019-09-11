import React from 'react';
import {connect,PureComponent} from '../react-redux';
import actions from '../store/actions/counter1';
class Counter extends React.Component{
    render(){
        console.log('render1');
        return (
            <div>
                <p>{this.props.number}</p>
                <button onClick={()=>this.props.add(5)} >+</button>
            </div>
        )
    }
}

export default connect(state=>state.counter1,actions)(Counter);