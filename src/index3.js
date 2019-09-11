
import React, { Component ,createContext } from 'react'
import { createStore } from './redux/index';
import ReactDOM from 'react-dom'


let T = createContext();

//T.Consumer  T.Provider T.displayName


let reducer = (state, actions) => {
    switch (actions.type) {
        case "ADD":
            return { ...state, ...actions.payload }
            break;
        case "MUINS":
            return { ...state, ...actions.payload }
            break;
        default:
            return state
    }
}

let store=createStore(reducer,{number:0})

class Index extends Component {

    muinsClick=()=>{
        let {number} = store.getStore();
        store.dispatch({type:"MUINS",payload:{number:number-1}});
        this.setState({})
    }

    addClick=()=>{
        let {number} = store.getStore();
        store.dispatch({type:"ADD",payload:{number:number+1}})
        this.setState({})
    }

    render() {
        let {number} = store.getStore();
        return (
            <div>
                {number}
                <button onClick={this.addClick}>添加</button>
                <button onClick={this.muinsClick}>删除</button>
            </div>
        )
    }
}

function render(){
    ReactDOM.render(<Index />,document.getElementById('root'))
}

// store.subscribe(render)

render();






