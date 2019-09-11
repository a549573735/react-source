import React,{Component} from 'react';


export default function createContext(initState){
    
    class Provider extends Component{
        static value;
        constructor(props){
            super(props);
            Provider.value=props.value;
            this.state={value:props.value}
        }
        
        static getDerivedStateFromProps(nextProps,prevState){
            Provider.value=nextProps.value;
            return prevState;
        }

        render(){
            return this.props.children  
        }
    }

    class Consumer extends Component{
         render(){
             return this.props.children(Provider.value)
         }
    }
    
    return {
            Provider,
            Consumer
    }
}



