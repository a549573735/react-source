import React  from './react';


function sayHello() {
    alert('hello');
}


class Counter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            number: 0,
            isNew: false,
            text:'',
            lists:[]
        }
    }
    componentWillMount() {
        console.log('componentWillMount');
    }

    componentDidMount() {
        console.log('componentDidMount');
        // setInterval(()=>this.setState({number:this.state.number+1}),5000)
        // this.setState({number:this.state.number+1})
        // setTimeout(() => {
        //     this.setState({ isNew: true })
        // }, 1000)
    }

    // componentDidUpdate() {
    //     console.log('componentDidUpdate');
    // }

    // componentShouldUpdate(nextState, nextProps) {
    //     console.log('componentShouldUpdate');
    //     return true;
    // }

    handleClick = () => {
        this.setState({lists: [...this.state.lists,this.state.text],text:''})
    }

    onChange=(e)=>{
        this.setState({ text: e.target.value  })
    }

    onDel=(index)=>{
        let lists=[...this.state.lists.slice(0,index),...this.state.lists.slice(index+1)];
        this.setState({ lists: lists })
    }

    render() {
        let lists = this.state.lists.map((item,index)=>{
            return React.createElement('li',{},item,React.createElement('button',{onClick:()=>this.onDel(index)},'X'));
        });
        let input = React.createElement('input',{onKeyup:this.onChange,value:this.state.text });
        let button = React.createElement('button',{onClick:this.handleClick},"+");
        return React.createElement('div',{},input,button,
        React.createElement('ul',{},...lists));
    }
}

// let element=( <div>
//         <button id="sayHello" style={{color:'red',backgroundColor:'yellow'}} onClick={sayHello}></button>
// </div> )

// let element= React.createElement('button',{
//     id:'sayHello',style:{color:'red',backgroundColor:'yellow'}, aa:123, className:'123',onClick:sayHello},'say',
//     React.createElement('b',{},'hello'));


let Element = React.createElement(Counter, { name: '计数器' });

React.render(Element, document.getElementById('root'));





