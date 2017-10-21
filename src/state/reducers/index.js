import { combineReducers } from 'redux';

import AuthReducer from './AuthReducer';
import ListReducer from './ListReducer';

export default function getRootReducer(navReducer) {
    return combineReducers({
        nav: navReducer,
        auth: AuthReducer,
        list: ListReducer,
    })
}