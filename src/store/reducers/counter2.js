import *  as types from '../action-types';
export default function(state={number:0},action){

    switch(action.type){
        case types.COUNTER_ADD_2:
           return {...state,number:state.number+action.payload};
        default:
           return state;   
    }
}