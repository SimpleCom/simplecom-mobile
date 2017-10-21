import React from 'react';
import { Provider, connect } from 'react-redux';
import { StackNavigator, addNavigationHelpers } from 'react-navigation';
import { Routes } from './src/nav/Router';
import getStore from './src/state/Store';
import Expo from 'expo';

import { BackHandler } from 'react-native';

const keys = '';
let routeName = 'MessageListScreen';

async () => {
  try {
    keys = await Expo.SecureStore.getItemAsync('keys');
  } catch (error) {
    console.log('error grabbing values', error);
  }
  if (keys !== null && keys !== undefined) {
    // This means the user has logged in, route to lockscreen
    routeName = 'LockScreen'
  }
}

const AppNavigator = StackNavigator(Routes, {
  initialRouteName: routeName,
  headerMode: 'screen',
  mode: 'card',
  navigationOptions: {
    gesturesEnabled: false,
  }
})

const navReducer = (state, action) => {
  const newState = AppNavigator.router.getStateForAction(action, state);
  return newState || state;
}

@connect(state => ({
  nav: state.nav
}))
class AppWithNavigationState extends React.Component {
  state = {
    appIsReady: false,
  }

  handleBackPress = () => {
    const { dispatch, nav } = this.props;
    const navigation = addNavigationHelpers({
      dispatch,
      state: nav,
    })
    navigation.goBack();
    return true;
  }

  componentWillMount() {
    
  }

  componentDidMount() {
    BackHandler.addEventListener('backPress', this.handleBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('backPress', this.handleBackPress);
  }
  
  render() {
    return (
      <AppNavigator
        navigation={addNavigationHelpers({
          dispatch: this.props.dispatch,
          state: this.props.nav
        })}
      />
    )
  }
}

const store = getStore(navReducer);

class App extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <AppWithNavigationState />
      </Provider>
    )
  }
}

export default App;