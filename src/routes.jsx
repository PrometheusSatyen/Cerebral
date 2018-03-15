'use strict';

import React from 'react';
import {Route} from 'react-router-dom';
import App from './components/App';
import Overview from './components/views/Overview';

export default (
    <Route path="/" component={App}>
        <IndexRoute component={Overview}/>
    </Route>
);