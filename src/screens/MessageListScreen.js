import React from 'react';
import { connect } from 'react-redux';
import { addListItem, setListContents } from '../actions';
import Expo from 'expo';

import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    FlatList,
    TouchableOpacity,
    Image
} from 'react-native';
import { Button } from '../components/common';
import SelectMultiple from 'react-native-select-multiple';
import MsgListItem from '../components/MsgListItem';

const sodium = require('libsodium-wrappers');

class MessageListScreen extends React.Component {
    state = {
        modalVisible: false,
        modalType: '',
        selectedLists: [],
        newListName: '',
        msgText: '',
        selectedMsgIndex: 0,
        cameraType: Expo.Camera.Constants.Type.back,
        picUri: '../../assets/splash.png',
        imageCaption: '',
    }

    async componentWillMount() {
        const { status } = await Expo.Permissions.askAsync(Expo.Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === 'granted' });
    }

    async componentDidMount() {
        // On load we want to restore any list on the device
        // TODO: do this in redux and return list for which screen you're on
        let savedList = await Expo.SecureStore.getItemAsync('listContents');
        console.log('savedList', savedList);
        if (savedList !== (undefined || null)) {
            let json = JSON.parse(savedList);
            this.props.setListContents(json);
        }
    }

    showModal(status, type) {
        this.setState({
            modalVisible: status,
            modalType: type,
        })
    }

    // async encrypt(pKey, payload) {
    //     await sodium.ready;
    //     return sodium.crypto_box_seal(payload, pKey);
    // }

    async handleCameraCapture() {
        let options = {
            quality: 0.5,
            exif: false,
        }
        let request = await this.camera.takePictureAsync(options)
        console.log('here is request', request);

        this.setState({
            modalType: 'reviewpic',
            picUri: request.uri,
        })
        // await Expo.FileSystem.deleteAsync(request.uri);
    }

    async handleDiscardPress() {
        await Expo.FileSystem.deleteAsync(this.state.picUri);
        this.setState({
            modalVisible: false,
            modalType: '',
            picUri: '../../assets/splash.png',
            imageCaption: '',
        })
    }

    async handleImageSave(imageURI) {
        await Expo.FileSystem.writeAsStringAsync(`${Expo.FileSystem.cacheDirectory}cap.txt`, this.state.imageCaption);

    }

    handleModalCancel() {
        this.setState({
            modalVisible: false,
            modalType: '',
            selectedLists: [],
            newListName: ''
        })
    }

    handleMsgCancel() {
        this.setState({
            modalVisible: false,
            modalType: '',
            msgText: '',
            selectedMsgIndex: 0,
        })
    }

    handleMsgSave() {
        let listContents = this.props.listContents;
        listContents[this.state.selectedMsgIndex].message = this.state.msgText;
        this.setState({
            modalVisible: false,
            modalType: '',
            msgText: '',
            selectedMsgIndex: 0,
        })
        this.props.setListContents(listContents, true);
    }

    handleNewMessage() {
        if (this.state.selectedLists.length >= 1 && this.state.newListName !== '') {
            let obj = {
                name: this.state.newListName,
                recipients: this.state.selectedLists,
            }
            this.setState({
                modalVisible: false,
                modalType: '',
                selectedLists: [],
                newListName: ''
            })
            this.props.addListItem(obj, this.props.listContents);
        } else {
            if (this.state.selectedLists.length === 0) {
                this.setState({
                    modalError: 'Please select a list',
                })
            } else if (this.state.newListName === '') {
                this.setState({
                    modalError: 'Please give your message a name'
                })
            }
        }
    }

    async handlePicturePress(index) {
        // let options = {
        //     quality: 0.5,
        //     exif: false,
        // }
        // let result = await Expo.ImagePicker.launchCameraAsync(options)
        // console.log('here is result', result);
        // await Expo.FileSystem.deleteAsync(result.uri);
        // let thisthing = await Expo.FileSystem.readAsStringAsync(result.uri);
        this.showModal(true, 'camera');
        this.setState({
            modalVisible: true,
            modalType: 'camera',
            selectedMsgIndex: index,
        })
    }

    handleSendPress() {

    }

    handleSyncPress() {

    }

    handleTextPress(item, index) {
        this.setState({
            modalVisible: true,
            modalType: 'textEdit',
            selectedMsgIndex: index,
            msgText: (item.message) ? item.message : '',
        })
    }

    renderModalContent() {
        if (this.state.modalType === 'newmsg') {
            const list = [
                { label: 'Family', value: 1 },
                { label: 'Friends', value: 2 },
                { label: 'Management', value: 3 },
                { label: 'Church', value: 4 },
            ]
            return (
                <View style={styles.modalStyle}>
                    <Text style={styles.modalInputTitle}>Name:</Text>
                    <TextInput
                        style={styles.textInputStyle}
                        onChangeText={(text) => this.setState({ newListName: text })}
                        value={this.state.newListName}
                        placeholder={'Enter Name...'}
                        placeholderTextColor={'#888'}
                        autoCorrect={true}
                        autoCapitalize={'words'}
                        keyboardType={'default'}
                        underlineColorAndroid={'transparent'}
                    />
                    <SelectMultiple
                        items={list}
                        selectedItems={this.state.selectedLists}
                        onSelectionsChange={(selections) => this.setState({ selectedLists: selections })}
                        style={{ width: '100%' }}
                    />
                    <Text style={styles.errorText}>{this.state.modalError}</Text>
                    <View style={styles.buttonContainer}>
                        <Button onPress={() => this.handleModalCancel()}>Cancel</Button>
                        <Button onPress={() => this.handleNewMessage()}>Submit</Button>
                    </View>
                </View>
            )
        }
        if (this.state.modalType === 'textEdit') {
            return (
                <View style={styles.modalStyle}>
                    <Text style={styles.modalInputTitle}>Message Content:</Text>
                    <TextInput
                        style={styles.msgInputStyle}
                        onChangeText={(text) => this.setState({ msgText: text })}
                        value={this.state.msgText}
                        placeholder={'Enter Message...'}
                        placeholderTextColor={'#888'}
                        autoCorrect={true}
                        autoCapitalize={'sentences'}
                        keyboardType={'default'}
                        underlineColorAndroid={'transparent'}
                        multiline={true}
                    />
                    <View style={styles.buttonContainer}>
                        <Button onPress={() => this.handleMsgCancel()}>Cancel</Button>
                        <Button onPress={() => this.handleMsgSave()}>Save</Button>
                    </View>
                </View>
            )
        }
        if (this.state.modalType === 'camera') {
            const { hasCameraPermission } = this.state;
            if (hasCameraPermission === null) {
                return (
                    <View style={styles.modalStyle}>
                        <Text style={styles.errorText}>Please enable camera permissions</Text>
                        <Button onPress={() => this.showModal(false, '')}>Close</Button>
                    </View>
                )
            }
            return (
                <View style={styles.cameraModalStyle}>
                    <Expo.Camera
                        style={{ flex: 1, height: '100%', width: '100%' }}
                        type={this.state.cameraType}
                        ref={ref => this.camera = ref}
                    >
                        <View style={{ flex: 1, backgroundColor: 'transparent', flexDirection: 'row' }}>
                            <Button
                                style={styles.modalCancelButton}
                                onPress={() => this.showModal(false, '')}
                            >
                                Cancel
                            </Button>
                            <Button
                                style={styles.modalCaptureButton}
                                textStyle={{ fontWeight: 'bold' }}
                                onPress={() => this.handleCameraCapture()}
                            >
                                Capture
                            </Button>
                        </View>
                    </Expo.Camera>
                </View>
            )
        }
        if (this.state.modalType === 'reviewpic') {
            let pic = this.state.picUri;
            return (
                <View style={styles.modalStyle}>
                    <Image
                        source={{ uri: this.state.picUri }}
                        resizeMode='contain'
                        style={{ width: '100%', height: 300 }}
                    />
                    <Text style={styles.modalInputTitle}>Caption:</Text>
                    <TextInput
                        style={styles.textInputStyle}
                        onChangeText={(text) => this.setState({ imageCaption: text })}
                        value={this.state.imageCaption}
                        placeholder={'Enter Caption...'}
                        placeholderTextColor={'#888'}
                        autoCorrect={true}
                        autoCapitalize={'sentences'}
                        keyboardType={'default'}
                        underlineColorAndroid={'transparent'}
                    />
                    <View style={styles.buttonContainer}>
                        <Button
                            style={styles.buttonExtra}
                            onPress={() => this.handleDiscardPress()}
                        >
                            Discard
                        </Button>
                        <Button
                            style={styles.buttonExtra}
                            onPress={() => this.handleImageSave(pic)}
                        >
                            Save
                        </Button>
                    </View>
                </View>
            )
        }
    }

    render() {
        return (
            <View style={styles.containerStyle}>
                <View style={styles.headerStyle}>
                    <Text style={styles.headerText}>SimpleCom</Text>
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.buttonContainer}>
                        <Button style={styles.buttonExtra} onPress={() => this.handleSyncPress()}>Sync</Button>
                        <Button style={styles.buttonExtra} onPress={() => this.showModal(true, 'newmsg')}>+ Message</Button>
                    </View>
                    {(this.props.listContents) ? this.props.listContents.map((element, index) => <MsgListItem item={element} textPress={() => this.handleTextPress(element, index)} sendPress={() => this.handleSendPress(element)} picturePress={() => this.handlePicturePress(index)} key={index} />) : <View />}
                </View>
                <Modal
                    animationType={'fade'}
                    transparent={false}
                    visible={this.state.modalVisible}
                    onRequestClose={() => this.showModal(false, '')}
                >
                    {this.renderModalContent()}
                </Modal>
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
        paddingTop: 10,
    },
    headerStyle: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    headerText: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-around',
        paddingTop: 10,
    },
    buttonExtra: {
        width: '45%',
    },
    modalStyle: {
        borderColor: '#676769',
        borderRadius: 10,
        borderWidth: 1,
        marginTop: '20%',
        backgroundColor: '#fff',
        height: '80%',
        width: '95%',
        paddingBottom: 10,
        paddingHorizontal: 5,
        paddingTop: 10,
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center'
    },
    cameraModalStyle: {
        flex: 1,
    },
    textInputStyle: {
        height: 38,
        width: '100%',
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 4,
        marginVertical: 5,
        padding: 5,
        fontSize: 16,
    },
    msgInputStyle: {
        height: '80%',
        width: '100%',
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 4,
        marginVertical: 5,
        padding: 5,
        fontSize: 16,
    },
    modalInputTitle: {
        fontSize: 18,
        alignSelf: 'flex-start',
        backgroundColor: 'transparent',
        paddingLeft: 5,
    },
    errorText: {
        fontSize: 16,
        color: '#a00',
        textAlign: 'center',
    },
    modalCaptureButton: {
        position: 'absolute',
        zIndex: 1,
        bottom: 50,
        left: '39%',
        height: 60,
    },
    modalCancelButton: {
        position: 'absolute',
        zIndex: 1,
        top: 25,
        left: 5,
    }
})

const mapStateToProps = state => {
    const { listContents } = state.list;
    console.log('here is listContents', listContents);

    return { listContents };
}

export default connect(mapStateToProps, { addListItem, setListContents })(MessageListScreen)