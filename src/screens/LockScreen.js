import React from 'react';
import { connect } from 'react-redux';
import Expo from 'expo';

import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../components/common';

class LockScreen extends React.Component {
    state = {
        count: 0,
        entered1: '',
        entered2: '',
        entered3: '',
        entered4: '',
        entered5: '',
        entered6: '',
    }

    handleButtonPress(which) {
        let count = this.state.count;
        count++;
        let theState = this.state;
        theState[`entered${count}`] = which;
        theState.count = count;
        this.setState(theState);
    }

    handleClearPress() {
        this.setState({
            count: 0,
            entered1: '',
            entered2: '',
            entered3: '',
            entered4: '',
            entered5: '',
            entered6: '',
        })
    }

    async handleSubmitPress() {
        let s = await Expo.SecureStore.getItemAsync('sInfo');
        let p = await Expo.SecureStore.getItemAsync('pInfo');
        s = JSON.parse(s);
        p = JSON.parse(p);
        s = s.passcode;
        p = p.passcode;
        console.log("here is s", s);
        console.log('here is p', p);
        let st = this.state;
        let code = st.entered1 + st.entered2 + st.entered3 + st.entered4 + st.entered5 + st.entered6;
        console.log('here is code', code);
        if (code == p) {
            this.props.navigation.navigate('MessageListScreen', { which: 'p' });
        }
        if (code == s) {
            this.props.navigation.navigate('MessageListScreen', { which: 's' });
        }
    }

    renderEntered(pos) {
        return (
            <View style={styles.enteredBox}>
                <Text style={styles.enteredLetter}>{this.state[`entered${pos}`]}</Text>
            </View>
        )
    }

    render() {
        return (
            <View style={styles.containerStyle}>
                <View style={styles.contentContainer}>
                    <Text style={styles.titleStyle}>SimpleCom</Text>
                    <View style={styles.enteredContainer}>
                        {this.renderEntered(1)}
                        {this.renderEntered(2)}
                        {this.renderEntered(3)}
                        {this.renderEntered(4)}
                        {this.renderEntered(5)}
                        {this.renderEntered(6)}
                    </View>
                    <View style={styles.buttonContainer}>
                        <View style={styles.buttonRow}>
                            <Button
                                style={styles.buttonStyle}
                                textStyle={styles.buttonText}
                                onPress={() => this.handleButtonPress(0)}
                            >
                                0
                            </Button>
                            <Button
                                style={styles.buttonStyle}
                                textStyle={styles.buttonText}
                                onPress={() => this.handleButtonPress(1)}
                            >
                                1
                            </Button>
                            <Button
                                style={styles.buttonStyle}
                                textStyle={styles.buttonText}
                                onPress={() => this.handleButtonPress(2)}
                            >
                                2
                            </Button>
                            <Button
                                style={styles.buttonStyle}
                                textStyle={styles.buttonText}
                                onPress={() => this.handleButtonPress(3)}
                            >
                                3
                            </Button>
                        </View>
                        <View style={styles.buttonRow}>
                            <Button
                                style={styles.buttonStyle}
                                textStyle={styles.buttonText}
                                onPress={() => this.handleButtonPress(4)}
                            >
                                4
                            </Button>
                            <Button
                                style={styles.buttonStyle}
                                textStyle={styles.buttonText}
                                onPress={() => this.handleButtonPress(5)}
                            >
                                5
                            </Button>
                            <Button
                                style={styles.buttonStyle}
                                textStyle={styles.buttonText}
                                onPress={() => this.handleButtonPress(6)}
                            >
                                6
                            </Button>
                            <Button
                                style={styles.buttonStyle}
                                textStyle={styles.buttonText}
                                onPress={() => this.handleButtonPress(7)}
                            >
                                7
                            </Button>
                        </View>
                        <View style={styles.buttonRow}>
                            <Button
                                style={styles.buttonStyle}
                                textStyle={styles.buttonText}
                                onPress={() => this.handleButtonPress(8)}
                            >
                                8
                            </Button>
                            <Button
                                style={styles.buttonStyle}
                                textStyle={styles.buttonText}
                                onPress={() => this.handleButtonPress(9)}
                            >
                                9
                            </Button>
                            <Button
                                style={styles.buttonStyle}
                                textStyle={styles.buttonText}
                                onPress={() => this.handleButtonPress('A')}
                            >
                                A
                            </Button>
                            <Button
                                style={styles.buttonStyle}
                                textStyle={styles.buttonText}
                                onPress={() => this.handleButtonPress('B')}
                            >
                                B
                            </Button>
                        </View>
                        <View style={styles.buttonRow}>
                            <Button
                                style={styles.buttonStyle}
                                textStyle={styles.buttonText}
                                onPress={() => this.handleButtonPress('C')}
                            >
                                C
                            </Button>
                            <Button
                                style={styles.buttonStyle}
                                textStyle={styles.buttonText}
                                onPress={() => this.handleButtonPress('D')}
                            >
                                D
                            </Button>
                            <Button
                                style={styles.buttonStyle}
                                textStyle={styles.buttonText}
                                onPress={() => this.handleButtonPress('E')}
                            >
                                E
                            </Button>
                            <Button
                                style={styles.buttonStyle}
                                textStyle={styles.buttonText}
                                onPress={() => this.handleButtonPress('F')}
                            >
                                F
                            </Button>
                        </View>
                        <Button
                            style={styles.submitButton}
                            onPress={() => this.handleClearPress()}
                        >
                            Clear
                        </Button>
                        <Button
                            style={styles.submitButton}
                            onPress={() => this.handleSubmitPress()}
                        >
                            Submit
                        </Button>
                    </View>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    containerStyle: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 25,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: '3%',
        justifyContent: 'space-around',
    },
    titleStyle: {
        fontSize: 50,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    enteredContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
    },
    enteredBox: {
        width: '15%',
        height: 50,
        borderWidth: 1,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    enteredLetter: {
        backgroundColor: 'transparent',
        fontSize: 30,
    },
    buttonContainer: {
        width: '100%',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 5,
    },
    buttonStyle: {
        width: '20%',
        height: 50,
    },
    buttonText: {
        fontSize: 24,
        backgroundColor: 'transparent',
    },
    submitButton: {
        width: '90%',
        height: 50,
        marginTop: 10,
    }
})

const mapStateToProps = state => {
    return {};
}

export default connect(mapStateToProps)(LockScreen)