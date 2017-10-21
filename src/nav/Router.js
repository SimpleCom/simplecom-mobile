import { StackNavigator } from 'react-navigation';

import LoginScreen from '../screens/LoginScreen';
import MessageListScreen from '../screens/MessageListScreen';
import LockScreen from '../screens/LockScreen';

export const Routes = {
    LoginScreen: {
        screen: LoginScreen,
        mode: 'card',
        navigationOptions: {
            gesturesEnabled: false,
            header: null,
        }
    },
    MessageListScreen: {
        screen: MessageListScreen,
        mode: 'card',
        navigationOptions: {
            gesturesEnabled: false,
            header: null,
        }
    },
    LockScreen: {
        screen: LockScreen,
        mode: 'card',
        navigationOptions: {
            gesturesEnabled: false,
            header: null,
        }
    }
}