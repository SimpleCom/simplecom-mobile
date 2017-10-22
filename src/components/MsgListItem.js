import React from 'react';

import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../components/common';

class MsgListItem extends React.Component {
    render() {
        let item = this.props.item;
        if (!item.message) {
            return (
                <View style={styles.view}>
                    <Text style={styles.name}>{item.name}</Text>
                    <View style={styles.buttonContainer}>
                        <Button onPress={this.props.textPress}>Text</Button>
                        <Button
                            style={{ borderColor: '#ccc' }}
                            textStyle={{ color: '#ccc' }}
                        >
                            Send
                            </Button>
                        <Button onPress={this.props.picturePress}>Picture</Button>
                    </View>
                </View>
            )
        }
        return (
            <View style={styles.view}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={styles.buttonContainer}>
                    <Button onPress={this.props.textPress}>Text</Button>
                    <Button onPress={this.props.sendPress}>Send</Button>
                    <Button onPress={this.props.picturePress}>Picture</Button>
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    view: {
        padding: 5,
        marginVertical: 10,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        paddingBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
})

export default MsgListItem;