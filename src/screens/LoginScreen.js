import React from 'react';
import { connect } from 'react-redux';
import { loginWithUsername } from '../actions';
import Expo, { Location, Permissions } from 'expo';
import { NO_SYNC_COUNTRIES } from '../countries';
import { GOOGLE_MAPS_API_KEY } from '../secret';
import { NavigationActions } from 'react-navigation';

import {
    View,
    Text,
    StyleSheet,
    TextInput,
    KeyboardAvoidingView,
    ActivityIndicator
} from 'react-native';
import { Button } from '../components/common';

class LoginScreen extends React.Component {
    state = {
        username: '',
        password: '',
        domain: '',
        allowSync: false,
    }

    async componentWillMount() {
        let pInfo;
        try {
            pInfo = await Expo.SecureStore.getItemAsync('pInfo');
        } catch (error) {
            console.log('error grabbing values', error);
        }
        console.log('here is pInfo', pInfo);
        if (pInfo !== null && pInfo !== undefined) {
            // This means the user has logged in, route to lockscreen
            const resetAction = NavigationActions.reset({
                index: 0,
                key: null,
                actions: [
                    NavigationActions.navigate({ routeName: 'LockScreen' })
                ]
            })
            if (this.props.navigation.state) {
                if (!this.props.navigation.state.params) {
                    this.props.navigation.dispatch(resetAction);
                }
            }
        } else {
            this._getLocationAsync()
        }
    }

    async _getLocationAsync() {
        if (!this.props.navigation.state.params) {
            let { status } = await Permissions.askAsync(Permissions.LOCATION);
            if (status !== 'granted') {
                this.setState({
                    error: 'Permission to access location was denied',
                })
            } else {
                let location = await Location.getCurrentPositionAsync({});
                console.log('here is location', location);
                if (location) {
                    if (location.coords) {
                        let lat = location.coords.latitude;
                        let lng = location.coords.longitude;
                        fetch(
                            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
                        ).then(resp => {
                            resp.json().then(respJson => {
                                console.log("here is respjson", respJson);
                                if (respJson.results) {
                                    if (respJson.results[0]) {
                                        let allow = true;
                                        let index = 0;
                                        let addressComponents = respJson.results[0].address_components;
                                        addressComponents.map((e, i) => {
                                            if (e.types) {
                                                e.types.map(element => {
                                                    if (element == "country") {
                                                        index = i;
                                                    }
                                                })
                                            }
                                        })
                                        let country = addressComponents[index].long_name;
                                        console.log('here is country', country);
                                        NO_SYNC_COUNTRIES.map(element => {
                                            if (element == country) {
                                                allow = false;
                                            }
                                        })
                                        console.log('here is allow', allow);
                                        if (allow) {
                                            this.setState({ allowSync: true });
                                        }
                                    } else {
                                        console.log('NO DEAL');
                                    }
                                }
                            })
                        })
                    }
                }
            }
        }
    }

    handleLoginPress() {
        if (this.state.allowSync) {
            this.props.loginWithUsername(this.state.domain, this.state.username, this.state.password, this.props.navigation)
        } else if (this.props.navigation.state) {
            if (this.props.navigation.state.params.locationChecked) {
                this.props.loginWithUsername(this.state.domain, this.state.username, this.state.password, this.props.navigation)
            }
        }
    }

    renderButtons() {
        if (this.props.loading) {
            return <ActivityIndicator />
        } else {
            return (
                <View>
                    <Button style={{ marginTop: 10 }} onPress={() => this.handleLoginPress()}>Log In</Button>
                </View>
            )
        }
    }

    renderCancelButton() {
        if (this.props.navigation.state.params) {
            if (this.props.navigation.state.params.locationChecked) {
                return (
                    <Button
                    style={styles.cancelButton}
                    onPress={() => this.props.navigation.goBack()}
                >Cancel</Button>
                )
            }
        }
    }

    renderErrorMsg() {
        if (this.props.errorMsg != '') {
            return <Text style={styles.errorMsg}>{this.props.errorMsg}</Text>
        }
    }

    renderSyncMsg() {
        if (this.props.navigation.state.params) {
            if (this.props.navigation.state.params.locationChecked) {
                return (
                    <Text style={styles.syncMsg}>Please log in to continue syncing</Text>
                )
            }
        }
    }

    render() {
        return (
            <View style={styles.containerStyle}>
                {this.renderCancelButton()}
                <KeyboardAvoidingView style={styles.contentContainer} behavior={'padding'}>
                    {this.renderSyncMsg()}
                    <Text style={styles.titleText}>SimpleCom</Text>
                    <Text style={styles.textInputTitle}>Domain</Text>
                    <TextInput
                        style={styles.textInputStyle}
                        onChangeText={(text) => this.setState({ domain: text, error: '' })}
                        value={this.state.domain}
                        placeholder={'Domain'}
                        placeholderTextColor={'#888'}
                        autoCorrect={false}
                        autoCapitalize={'none'}
                        underlineColorAndroid={'transparent'}
                    />
                    <Text style={styles.textInputTitle}>Username</Text>
                    <TextInput
                        style={styles.textInputStyle}
                        onChangeText={(text) => this.setState({ username: text, error: '' })}
                        value={this.state.email}
                        placeholder={'Username'}
                        placeholderTextColor={'#888'}
                        autoCorrect={false}
                        autoCapitalize={'none'}
                        keyboardType={'default'}
                        underlineColorAndroid={'transparent'}
                    />
                    <Text style={styles.textInputTitle}>Password</Text>
                    <TextInput
                        style={styles.textInputStyle}
                        onChangeText={(text) => this.setState({ password: text, error: '' })}
                        value={this.state.password}
                        placeholder={'Password'}
                        placeholderTextColor={'#888'}
                        autoCorrect={false}
                        autoCapitalize={'none'}
                        secureTextEntry={true}
                        underlineColorAndroid={'transparent'}
                        onSubmitEditing={() => this.handleLoginPress()}
                    />
                    {this.renderErrorMsg()}
                    {this.renderButtons()}
                </KeyboardAvoidingView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    containerStyle: {
        paddingTop: 22,
        backgroundColor: '#fff',
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: "3%"
    },
    titleText: {
        fontSize: 36,
        fontWeight: 'bold',
    },
    textInputTitle: {
        fontSize: 18,
        marginVertical: 5,
        fontWeight: '400',
        alignSelf: 'flex-start',
    },
    textInputStyle: {
        height: 38,
        width: '100%',
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 4,
        marginVertical: 5,
        padding: 5,
    },
    errorMsg: {
        color: '#a00',
        fontSize: 18,
    },
    cancelButton: {
        position: 'absolute',
        zIndex: 1,
        top: 25,
        left: 5,
    },
    syncMsg: {
        fontSize: 18,
        paddingBottom: 10,
    }
})

const mapStateToProps = state => {
    const { loading, errorMsg } = state.auth;

    return { loading, errorMsg };
}

export default connect(mapStateToProps, { loginWithUsername })(LoginScreen);