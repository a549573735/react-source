import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from './react-redux'
import Counter1 from './component/counter1';
import Counter2 from './component/counter2';
import store from './store'




ReactDOM.render(<Provider store={store}>
            <Counter1 />
            <Counter2 />
    </Provider>,document.getElementById('root'));




