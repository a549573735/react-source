import * as types from '../action-types';

export default {
    add(payload) {
        return {
            type: types.COUNTER_ADD_2, payload
        }
    },
    add2() {
        return {
            type: types.COUNTER_ADD_2, payload: new Promise(resolve => {
                setTimeout(() => {
                    resolve(5);
                }, 2000)
            })
        }
    }
}