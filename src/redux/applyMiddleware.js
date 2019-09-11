

export default function applyMiddleware(...middlewares){
     return (createStore)=>reducer=>{
         let dispatch;
         let store=createStore({},reducer);
         middlewares=middlewares.map(middleware=>middleware({getState:store.getState,dispatch:(...args)=>dispatch(...args)}));
         dispatch=middlewares.reduce((a,b)=>(...args)=>a(b(...args)))(store.dispatch)
         return {
            ...store,
            dispatch
         }
    }
}

