import * as types from '../action-types';

export default {
    add(payload) {
        
        return {
            type: types.COUNTER_ADD_1, payload
        }
    },
    add2() {
        return {
            type: types.COUNTER_ADD_1, payload: new Promise(resolve => {
                setTimeout(() => {
                    resolve(5);
                }, 2000)
            })
        }
    }
}