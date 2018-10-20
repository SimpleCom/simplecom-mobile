import React from 'react';
import { connect } from 'react-redux';
import { addListItem, setListContents } from '../actions';
import Expo, { Location, Permissions } from 'expo';
import { JSEncrypt } from 'jsencrypt';
import CryptoJS from 'crypto-js';
import { NO_SYNC_COUNTRIES } from '../countries';
import { GOOGLE_MAPS_API_KEY } from '../secret';
import { RNS3 } from 'react-native-aws3';
import { NavigationActions, StackActions } from 'react-navigation';

import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    Image,
    AppState,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Keyboard
} from 'react-native';
import { Button } from '../components/common';
import SelectMultiple from 'react-native-select-multiple';
import MsgListItem from '../components/MsgListItem';


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
        pic64: '',
        imageCaption: '',
        location: '',
        lists: [],
        numMsgs: 0,
    }

    async componentWillMount() {
        const { status } = await Expo.Permissions.askAsync(Expo.Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === 'granted' });
        this._getLocationAsync()
    }

    async componentDidMount() {
        console.log('mounting');
        let lists = await Expo.SecureStore.getItemAsync('lists');
        lists = JSON.parse(lists);
        let newList = lists.map(e => {
            let obj = {
                label: e.name,
                value: e.id,
            }
            return obj;
        })
        this.setState({
            lists: newList,
        })
        // On load we want to restore any list on the device
        let which = this.props.navigation.state.params.which;
        let savedList = await Expo.SecureStore.getItemAsync(`${which}listContents`);
        if (savedList) {
            let json = JSON.parse(savedList);
            this.props.setListContents(json, true, which);
        }
        let num = await Expo.SecureStore.getItemAsync(`${which}Num`);
        if (num !== null && num !== undefined) {
            num = parseInt(num);
            this.setState({
                numMsgs: num,
            })
        }
        AppState.addEventListener('change', (currentAppState) => this.handleAppStateChange(currentAppState));
    }

    handleAppStateChange(currentAppState) {
        if (currentAppState === 'inactive' || currentAppState === 'background') {
            const resetAction = StackActions.reset({
                index: 0,
                key: null,
                actions: [
                    NavigationActions.navigate({ routeName: 'LockScreen' })
                ]
            })
            this.props.navigation.dispatch(resetAction);
        }
    }

    async _getLocationAsync() {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
            this.setState({
                error: 'Permission to access location was denied',
            })
        } else {
            let location = await Location.getCurrentPositionAsync({});
            this.setState({ location: location });
            const { params } = this.props.navigation.state;
            const { d } = params;
            if (d) {
                this.dSend(location);
            }
        }
    }

    dSend = async (location) => {
        console.log('doing dsend', location);
        const userId = await Expo.SecureStore.getItemAsync('userId');
        // Generate a key to use for AES encryption.
        const key = this.generateKey();
        // Stringify location for encryption
        const locationString = JSON.stringify(location);
        const encryptedLocation = await CryptoJS.AES.encrypt(locationString, key);
        // // convert the object to a string.
        const encryptedLocationString = encryptedLocation.toString();
        const timestamp = Date.now();
        await Expo.FileSystem.writeAsStringAsync(Expo.FileSystem.documentDirectory + `D-${timestamp}`, encryptedLocationString);

        const encrypt = new JSEncrypt();
        const which = this.props.navigation.state.params.which;
        let info = await Expo.SecureStore.getItemAsync(`${which}Info`);
        info = JSON.parse(info);
        encrypt.setPublicKey(info.rsaPublicKey);
        encrypt.encrypt(key);
        await Expo.FileSystem.writeAsStringAsync(Expo.FileSystem.documentDirectory + `D-K-${timestamp}`, key);
        const awsOptions = {
            keyPrefix: `${userId}/${which}/`,
            bucket: info.s3Bucket,
            region: 'us-west-1',
            accessKey: info.awsAccessKey,
            secretKey: info.awsSecret,
            successActionStatus: 201,
        }
        console.log('awsoptions', awsOptions);
        const firstFile = {
            uri: Expo.FileSystem.documentDirectory + `D-${timestamp}`,
            name: `D-${timestamp}.txt`,
            type: 'text/plain',
        }
        RNS3.put(firstFile, awsOptions).then(async resp => {
            if (resp.status !== 201) {
                console.log('failed to upload to s3');
            } else {
                console.log('first file uploaded, trying second');
                const secondFile = {
                    uri: Expo.FileSystem.documentDirectory + `D-K-${timestamp}`,
                    name: `D-K-${timestamp}.txt`,
                    type: 'text/plain',
                }
                RNS3.put(secondFile, awsOptions).then(async respAgain => {
                    console.log('rns3 pushed again', respAgain);
                    if (respAgain.status !== 201) {
                        console.log('failed second upload to s3');
                    } else {
                        console.log('all done uploading!');
                        await Expo.FileSystem.deleteAsync(Expo.FileSystem.documentDirectory + `D-${timestamp}`);
                        await Expo.FileSystem.deleteAsync(Expo.FileSystem.documentDirectory + `D-K-${timestamp}`);
                    }
                })
            }
        })
    }

    showModal(status, type) {
        this.setState({
            modalVisible: status,
            modalType: type,
        })
    }

    generateKey() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 244; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
      }

    async handleCameraCapture() {
        let options = {
            quality: Platform.OS === 'ios' ? 0.5 : 1,
            exif: false,
            base64: true,
        }
        let request = await this.camera.takePictureAsync(options)

        this.setState({
            modalType: 'reviewpic',
            picUri: request.uri,
            pic64: request.base64,
        })
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
        Keyboard.dismiss();
        this.setState({
            pictureUploading: true,
        })
        let userId = await Expo.SecureStore.getItemAsync('userId');
        // Generate a key to use for AES encryption.
        let key = this.generateKey();
        // Grab the string of the image caption.
        let caption = this.state.imageCaption;
        // Encrypt the caption with AES.
        caption = await CryptoJS.AES.encrypt(caption, key);
        // Convert the object to a string.
        caption = caption.toString();
        // retrieve the iterating number thing
        let num = 1;
        let msgNbr = 1;
        let timestamp = 0;
        let index = this.state.selectedMsgIndex;
        if (this.props.listContents[index].num) {
            num = this.props.listContents[index].num;
        }
        if (this.props.listContents[index].msgNbr) {
            msgNbr = this.props.listContents[index].msgNbr;
        }
        if (this.props.listContents[index].timestamp) {
            timestamp = this.props.listContents[index].timestamp;
        }
        // Grab the string of the image
        let pic64 = this.state.pic64;
        // Encrypt the string of the image using AES
        pic64 = await CryptoJS.AES.encrypt(pic64, key);
        // Delete the image from the phone.
        await Expo.FileSystem.deleteAsync(imageURI);
        // Convert the encrypted object to a string.
        pic64 = pic64.toString();
        let obj = {
            pic: pic64,
            cap: caption,
        }
        // Write the object as a txt file.
        obj = JSON.stringify(obj);
        await Expo.FileSystem.writeAsStringAsync(Expo.FileSystem.documentDirectory + `M${msgNbr}P${num}-${timestamp}`, obj)

        // Get ready to use jsencrypt
        let encrypt = new JSEncrypt();
        // Find out which bucket etc.
        let which = this.props.navigation.state.params.which;
        let info = await Expo.SecureStore.getItemAsync(`${which}Info`);
        info = JSON.parse(info);
        // Set the RSA key on jsencrypt
        encrypt.setPublicKey(info.rsaPublicKey)
        // Encrypt the AES key with RSA.
        let encrypted = encrypt.encrypt(key);
        await Expo.FileSystem.writeAsStringAsync(Expo.FileSystem.documentDirectory + `M${msgNbr}K${num}-${timestamp}`, key);
        let awsOptions = {
            keyPrefix: `${userId}/${which}/`,
            bucket: info.s3Bucket,
            region: 'us-west-1',
            accessKey: info.awsAccessKey,
            secretKey: info.awsSecret,
            successActionStatus: 201
        }
        let firstFile = {
            uri: Expo.FileSystem.documentDirectory + `M${msgNbr}P${num}-${timestamp}`,
            name: `M-${msgNbr}-P-${num}.txt`,
            type: 'text/plain'
        }
        RNS3.put(firstFile, awsOptions).then(async resp => {
            if (resp.status !== 201) {
                console.log('failed to upload to s3');
            } else {
                console.log('first file uploaded, trying second');
                let secondFile = {
                    uri: Expo.FileSystem.documentDirectory + `M${msgNbr}K${num}-${timestamp}`,
                    name: `M-${msgNbr}-K-${num}.txt`,
                    type: 'text/plain',
                }
                RNS3.put(secondFile, awsOptions).then(async respAgain => {
                    console.log('rns3 pushed again', respAgain);
                    if (respAgain.status !== 201) {
                        console.log('failed second upload to s3');
                    } else {
                        console.log('all done uploading!')
                        await Expo.FileSystem.deleteAsync(Expo.FileSystem.documentDirectory + `M${msgNbr}P${num}-${timestamp}`)
                        await Expo.FileSystem.deleteAsync(Expo.FileSystem.documentDirectory + `M${msgNbr}K${num}-${timestamp}`)
                        this.setState({
                            modalVisible: false,
                            modalType: '',
                            selectedMsgIndex: 0,
                            picUri: '../../assets/splash.png',
                            pic64: '',
                            imageCaption: '',
                            numMsgs: 0,
                        })
                        num++
                        let listContents = this.props.listContents;
                        listContents[index].num = num;
                        this.props.setListContents(listContents, true, which);
                        this.setState({
                            pictureUploading: false
                        })
                    }
                })
            }
        })
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

    async handleNewMessage() {
        const timestamp = Date.now();
        let numMsgs = this.state.numMsgs;
        if (this.state.selectedLists.length >= 1 && this.state.newListName !== '') {
            let obj = {
                name: this.state.newListName,
                recipients: this.state.selectedLists,
                num: 0,
                msgNbr: numMsgs,
                timestamp,
            }
            this.setState({
                modalVisible: false,
                modalType: '',
                selectedLists: [],
                newListName: ''
            })
            this.props.addListItem(obj, this.props.listContents, this.props.navigation.state.params.which);
            numMsgs++;
            let which = this.props.navigation.state.params.which;
            await Expo.SecureStore.setItemAsync(`${which}Num`, numMsgs.toString());
            this.setState({
                numMsgs: numMsgs,
            })
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
        this.showModal(true, 'camera');
        this.setState({
            modalVisible: true,
            modalType: 'camera',
            selectedMsgIndex: index,
        })
    }

    async handleSendPress(item, index) {
        if (item.message) {
            console.log('item', item);
            const lists = item.recipients.map((element) => {
                return element.value;
            });
            let which = this.props.navigation.state.params.which;
            let key = this.generateKey();
            let num = item.num;
            let message = {
                message: item.message,
                lists,
            };
            let msgNbr = item.msgNbr;
            const { timestamp } = item;
            let userId = await Expo.SecureStore.getItemAsync('userId');
            console.log('message', message);
            message = JSON.stringify(message);

            message = await CryptoJS.AES.encrypt(message, key);
            message = message.toString();
            await Expo.FileSystem.writeAsStringAsync(Expo.FileSystem.documentDirectory + `M${msgNbr}T${num}-${timestamp}`, message);

            let encrypt = new JSEncrypt();
            let info = await Expo.SecureStore.getItemAsync(`${which}Info`);
            info = JSON.parse(info);
            encrypt.setPublicKey(info.rsaPublicKey);
            encrypt.encrypt(key);
            await Expo.FileSystem.writeAsStringAsync(Expo.FileSystem.documentDirectory + `M${msgNbr}K${num}-${timestamp}`, key);
            let awsOptions = {
                keyPrefix: `${userId}/${which}/`,
                bucket: info.s3Bucket,
                region: 'us-west-1',
                accessKey: info.awsAccessKey,
                secretKey: info.awsSecret,
                successActionStatus: 201
            }
            console.log('awsOptions: ', awsOptions);
            let firstFile = {
                uri: Expo.FileSystem.documentDirectory + `M${msgNbr}T${num}-${timestamp}`,
                name: `M-${msgNbr}-T-${num}.txt`,
                type: 'text/plain'
            }
            RNS3.put(firstFile, awsOptions).then(resp => {
                console.log('rns3 pushed', resp);
                if (resp.status !== 201) {
                    console.log('failed to upload to s3');
                } else {
                    let secondFile = {
                        uri: Expo.FileSystem.documentDirectory + `M${msgNbr}K${num}-${timestamp}`,
                        name: `M-${msgNbr}-K-${num}.txt`,
                        type: 'text/plain',
                    }
                    RNS3.put(secondFile, awsOptions).then(async respAgain => {
                        console.log('rns3 pushed again', respAgain);
                        if (respAgain.status !== 201) {
                            console.log('failed second upload to s3');
                        } else {
                            console.log('all done uploading!');
                            await Expo.FileSystem.deleteAsync(Expo.FileSystem.documentDirectory + `M${msgNbr}T${num}-${timestamp}`);
                            await Expo.FileSystem.deleteAsync(Expo.FileSystem.documentDirectory + `M${msgNbr}K${num}-${timestamp}`);
                            let listContents = this.props.listContents;
                            listContents.splice(index, 1);
                            this.props.setListContents(listContents, true, which);
                            const resetAction = StackActions.reset({
                                index: 0,
                                key: null,
                                actions: [
                                    NavigationActions.navigate({ routeName: 'MessageListScreen', params: { which: which } })
                                ]
                            })
                            this.props.navigation.dispatch(resetAction);
                        }
                    })
                }
            })
        }
    }

    handleSyncPress() {
        if (this.state.location) {
            if (this.state.location.coords) {
                let lat = this.state.location.coords.latitude;
                let lng = this.state.location.coords.longitude;
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
                                    this.props.navigation.navigate('LoginScreen', { locationChecked: true });
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

    handleTextPress(item, index) {
        this.setState({
            modalVisible: true,
            modalType: 'textEdit',
            selectedMsgIndex: index,
            msgText: (item.message) ? item.message : '',
        })
    }

    renderPictureButtons = (uploading) => {
        let pic = this.state.picUri;
        if (uploading) {
            return (
                <ActivityIndicator size={'large'} />
            );
        }
        return (
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
        );
    }

    renderModalContent() {
        if (this.state.modalType === 'newmsg') {
            const list = this.state.lists;
            return (
                <KeyboardAvoidingView
                    behavior={'padding'}
                    enabled={Platform.OS === 'ios' ? true : false}
                    style={styles.modalStyle}
                >
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
                </KeyboardAvoidingView>
            )
        }
        if (this.state.modalType === 'textEdit') {
            return (
                <KeyboardAvoidingView
                    behavior={'padding'}
                    enabled={Platform.OS === 'ios' ? true : false}
                    style={styles.modalStyle}
                >
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
                </KeyboardAvoidingView>
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
            const { pictureUploading } = this.state;
            return (
                <KeyboardAvoidingView
                    style={styles.modalStyle}
                    behavior={'padding'}
                    enabled={Platform.OS === 'ios' ? true : false}
                    keyboardVerticalOffset={50}
                >
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
                    {this.renderPictureButtons(pictureUploading)}
                </KeyboardAvoidingView>
            )
        }
    }

    render() {
        return (
            <View style={styles.containerStyle}>
                <View style={styles.headerStyle}>
                    <Image
                        source={require('../../assets/simplecomlong.png')}
                        style={styles.logo}
                    />
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.buttonContainer}>
                        <Button style={styles.buttonExtra} onPress={() => this.handleSyncPress()}>Sync</Button>
                        <Button style={styles.buttonExtra} onPress={() => this.showModal(true, 'newmsg')}>+ Message</Button>
                    </View>
                    {this.props.listContents.map((element, index) => <MsgListItem item={element} textPress={() => this.handleTextPress(element, index)} sendPress={() => this.handleSendPress(element, index)} picturePress={() => this.handlePicturePress(index)} key={index} />)}
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
    },
    logo: {
        height: 40,
        width: 200,
        alignSelf: 'center',
    }
})

const mapStateToProps = state => {
    const { listContents } = state.list;
    console.log('here is listContents', listContents);

    return { listContents };
}

export default connect(mapStateToProps, { addListItem, setListContents })(MessageListScreen)