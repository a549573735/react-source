import { createStore,applyMiddleware }from '../redux';
import reducers from './reducers';


let logger=store=>next=>action=>{
    console.log('before1');
    next(action);
    console.log('after1');
}

let logger2=(store)=>{
        return  (next)=>{
            return (action)=>{
                console.log('before2');
                next(action);
                console.log('after2');
            }
        }
}


let store=applyMiddleware(logger2,logger)(createStore)(reducers);
//let store=createStore({},reducers);


export default store