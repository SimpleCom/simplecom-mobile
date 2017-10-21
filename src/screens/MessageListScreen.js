import React from 'react';
import { connect } from 'react-redux';

import { View, Text, StyleSheet } from 'react-native';

class MessageListScreen extends React.Component {
    render() {
        return (
            <View style={styles.containerStyle}>
                <View style={styles.contentContainer}>
                    <Text>This is the list screen</Text>
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
        paddingHorizontal: '3%',
    }
})

const mapStateToProps = state => {
    return {};
}

export default connect(mapStateToProps)(MessageListScreen)