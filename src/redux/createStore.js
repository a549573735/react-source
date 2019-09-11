


function createStore(initState,reducer){
    let state=initState;
    let listeners=[];

    function getState(){
        return JSON.parse(JSON.stringify(state));
    }

    function subscribe(fn){
        listeners.push(fn);
        return ()=>{
            listeners=listeners.filter(item=>item!=fn);
        }
    }
    
    function dispatch(actions){
        state=reducer(state,actions);
        listeners.forEach(listener=>listener())
    }

    dispatch({type:"@@/REDUCER_INIT"})
    return {
        dispatch,
        subscribe,
        getState
    }
}




export default createStore;