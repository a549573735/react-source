

// // 父组件之间数据传递 可以用 props  context   createContext    Provider.value  
// { // Conponent.Consumer
//     value=>{
//         (<div>{value}</div>)
//     }
// }


// 老版本 父级 需要配置 传递给子集的  属性类型 
// childContextTypes = {
//     color:PropTypes.string,
//     changeColor:PropTypes.func
// }// 另外设置属性 getChildContext 
// getChildContext(){
//     return {color:this.state.color,changeColor:this.changeColor};
// }

// contextTypes = { //子集需要配置 上下文的类型 然后从 constructor   
//     color:PropTypes.string,
//     changeColor:PropTypes.func
// }