import { SET_LIST_CONTENTS } from './types';
import Expo from 'expo';

export const addListItem = (newItem, currentList) => {
    console.log('firing addlistitem');
    return (dispatch) => {
        console.log('here is newitem', newItem);
        console.log('here is currentlist', currentList);
        currentList.push(newItem);
        let string = JSON.stringify(currentList);
        Expo.SecureStore.setItemAsync('listContents', string);
        dispatch({ type: SET_LIST_CONTENTS, payload: currentList });
    }
}

export const setListContents = (list, save) => {
    return (dispatch) => {
        dispatch({ type: SET_LIST_CONTENTS, payload: list });
        if (save) {
            let string = JSON.stringify(list);
            Expo.SecureStore.setItemAsync('listContents', string);
        }
    }
}