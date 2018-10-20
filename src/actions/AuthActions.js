// This is where authentication actions are created.
import {
    ATTEMPT_LOG_IN,
    LOG_IN_FAIL,
    LOG_IN_SUCCESS,
    LOG_OUT,
    SET_LOADING
} from './types';
import Expo from 'expo';
import { NavigationActions, StackActions } from 'react-navigation';


export const loginWithUsername = (domain, username, password, navigation) => {
    return (dispatch) => {
        dispatch({ type: SET_LOADING, payload: true })
        console.log('logging in with username');
        console.log('https://api.' + domain + '/sync/')
        fetch(
            'https://api.' + domain + '/sync/',
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uname: username,
                    pass: password,
                })
            }
        ).then((resp) => {
            console.log("here is response from login", resp);
            if (resp.ok === false) {
                dispatch({ type: LOG_IN_FAIL });
            } else {
                resp.json().then(async (responseJson) => {
                    console.log('login responseJson', responseJson);
                    let lists = JSON.stringify(responseJson.lists);
                    let sInfo = JSON.stringify(responseJson.s);
                    let pInfo = JSON.stringify(responseJson.p);
                    let { dpasscode } = responseJson.p;
                    console.log('dpasscode', dpasscode);
                    let userId = responseJson.userId.toString();
                    await Expo.SecureStore.setItemAsync('lists', lists);
                    await Expo.SecureStore.setItemAsync('sInfo', sInfo);
                    await Expo.SecureStore.setItemAsync('pInfo', pInfo);
                    await Expo.SecureStore.setItemAsync('dpasscode', dpasscode);
                    await Expo.SecureStore.setItemAsync('userId', userId);
                    dispatch({ type: SET_LOADING, payload: false })
                    let pNum = await Expo.SecureStore.getItemAsync('pNum');
                    if (pNum !== null && pNum !== undefined) {
                        let pNum = 0;
                        pNum = pNum.toString();
                        console.log('about to save to async', pNum);
                        await Expo.SecureStore.setItemAsync('pNum', pNum);
                    }
                    let sNum = await Expo.SecureStore.getItemAsync('sNum');
                    if (sNum !== null && sNum !== undefined) {
                        let sNum = 0;
                        sNum = sNum.toString();
                        console.log('about to save to async', sNum);
                        await Expo.SecureStore.setItemAsync('sNum', sNum);
                    }
                    if (navigation) {
                        const resetAction = StackActions.reset({
                            index: 0,
                            key: null,
                            actions: [
                                NavigationActions.navigate({ routeName: 'LockScreen' })
                            ]
                        })
                        navigation.dispatch(resetAction);
                    }
                })
            }
        })
    }
}