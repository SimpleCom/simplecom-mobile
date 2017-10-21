import {
    SET_LIST_CONTENTS
} from '../../actions/types';

const initialState = {
    listContents: [],
}

export default (state = initialState, action) => {
    switch (action.type) {
        case SET_LIST_CONTENTS:
            return { ...state, listContents: action.payload }
        default:
            return state;
    }
}