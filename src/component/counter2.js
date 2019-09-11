import React from 'react';
import {connect,PureComponent} from '../react-redux';
import actions from '../store/actions/counter2';
class Counter extends React.Component{
    render(){
        console.log('render2');
        return (
            <div>
                <p>{this.props.number}</p>
                <button onClick={()=>this.props.add(3)} >+</button>
            </div>
        )
    }
}

export default connect(state=>state.counter2,actions)(Counter);