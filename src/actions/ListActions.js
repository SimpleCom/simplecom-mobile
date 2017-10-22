import { SET_LIST_CONTENTS } from './types';
import Expo from 'expo';

export const addListItem = (newItem, currentList, which) => {
    console.log('firing addlistitem');
    return (dispatch) => {
        console.log('here is newitem', newItem);
        console.log('here is currentlist', currentList);
        currentList.push(newItem);
        let string = JSON.stringify(currentList);
        Expo.SecureStore.setItemAsync(`${which}listContents`, string);
        dispatch({ type: SET_LIST_CONTENTS, payload: currentList });
    }
}

export const setListContents = (list, save, which) => {
    return (dispatch) => {
        dispatch({ type: SET_LIST_CONTENTS, payload: list });
        if (save) {
            let string = JSON.stringify(list);
            Expo.SecureStore.setItemAsync(`${which}listContents`, string);
        }
    }
}