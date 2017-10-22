import {
    ATTEMPT_LOG_IN,
    LOG_IN_FAIL,
    LOG_IN_SUCCESS,
    SET_LOADING
} from '../../actions/types';

const initialState = {
    user: {},
    errorMsg: '',
    loading: false,
}

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_LOADING:
            return { ...state, loading: action.payload }
        case LOG_IN_SUCCESS:
            return { ...state, ...initialState, user: action.payload }
        case LOG_IN_FAIL:
            return { ...state, ...initialState, errorMsg: 'Login failed, please try again.' }
        default:
            return state;
    }
}