export default function bindActionCreators(actions,dispatch){
     let bindActionCreator=(action,dispatch)=>{
         return (...args)=>dispatch(action(...args));
     }
     if(typeof actions === 'function'){
       return   bindActionCreator(actions,dispatch)
     }

     let bindActions={};
     for (let key in actions){
        bindActions[key]=bindActionCreator(actions[key],dispatch)
     }
     return bindActions
}