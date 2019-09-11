import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router,Route,Link } from './react-router-dom';
import Counter from './component/counter'



ReactDOM.render(
        <Router>
            <Link  to="/count/12">count</Link>
            <Route  path="/count/:id" component={Counter} />
        </Router>
, document.querySelector('#root'));










