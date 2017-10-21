import React from 'react';
import { connect } from 'react-redux';
import Expo, {Location, Permissions} from 'expo';

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
    }

    componentDidMount() {
        this._getLocationAsync()
    }

    async _getLocationAsync() {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
            this.setState({
                error: 'Permission to access location was denied',
            })
        } else {
            let location = await Location.getCurrentPositionAsync({});
            console.log('here is location', location);
            // TODO: make this find out what country the user is in
        }
    }

    handleLoginPress() {
        this.props.navigation.navigate('MessageListScreen');
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

    renderErrorMsg() {
        if (this.props.errorMsg != '') {
            return <Text style={styles.errorMsg}>{this.props.errorMsg}</Text>
        }
    }

    render() {
        return (
            <View style={styles.containerStyle}>
                <KeyboardAvoidingView style={styles.contentContainer} behavior={'padding'}>
                    <Text style={styles.titleText}>SimpleCom</Text>
                    <Text style={styles.textInputTitle}>Domain</Text>
                    <TextInput
                        style={styles.textInputStyle}
                        onChangeText={(text) => this.setState({ domain: text, error: '' })}
                        value={this.state.password}
                        placeholder={'Domain'}
                        placeholderTextColor={'#888'}
                        autoCorrect={false}
                        autoCapitalize={'none'}
                        secureTextEntry={true}
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
    }
})

const mapStateToProps = state => {
    const { loading, errorMsg } = state.auth;

    return { loading, errorMsg };
}

export default connect(mapStateToProps)(LoginScreen);