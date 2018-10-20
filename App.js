import React from 'react';
import { Provider, connect } from 'react-redux';
import { createStackNavigator } from 'react-navigation';
import {
  reduxifyNavigator,
  createReactNavigationReduxMiddleware,
} from 'react-navigation-redux-helpers';
import { Routes } from './src/nav/Router';
import getStore from './src/state/Store';
import Expo from 'expo';

const AppNavigator = createStackNavigator(Routes, {
  initialRouteName: 'LoginScreen',
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

// Note: createReactNavigationReduxMiddleware must be run before reduxifyNavigator
const middleware = createReactNavigationReduxMiddleware(
  "root",
  state => state.nav,
);
const App = reduxifyNavigator(AppNavigator, "root");
const mapStateToProps = (state) => ({
  state: state.nav,
});
const AppWithNavigationState = connect(mapStateToProps)(App);

const store = getStore(navReducer, middleware);

class Root extends React.Component {
  // state = {
  //   appIsReady: false,
  // }
  
  render() {
    // if (!this.state.appIsReady) {
    //     return <Expo.AppLoading />
    // }
    return (
        <Provider store={store}>
            <AppWithNavigationState />
        </Provider>
    )
  }
}

export default Root;