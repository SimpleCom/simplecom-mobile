// This is where authentication actions are created.

import {
    ATTEMPT_LOG_IN,
    LOG_IN_FAIL,
    LOG_IN_SUCCESS,
    LOG_OUT
} from './types';

export const loginWithUsername = (domain, username, password, navigation) => {
    return (dispatch) => {
        console.log('logging in with username');
        let request = fetch(
            'http://api' + domain,
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
                response.json().then(async (responseJson) => {
                    console.log('login responseJson', responseJson);
                    
                })
            }
        })
    }
}