//Fifth step of registration process
import { React, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Dimensions, Image } from 'react-native';
import { LeftArrowBtn, RightArrowBtn } from '../../Shared/Forms/Buttons/ArrowButtons';
import { XCircleBtn } from '../../Shared/Forms/Buttons/XCircleBtn';
import axios from 'axios';
import { SERVER_PORT } from '@env';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync } from 'expo-image-manipulator';
import AddImage from '../../Shared/Forms/Buttons/AddImage';
const { height, width } = Dimensions.get("screen")
import { useActionSheet } from '@expo/react-native-action-sheet';




const Photos = (props) => {

    let [boxes, changeBox] = useState([false, false, false, false, false, false])
    changeBox = (index) => {
        //replace element at boxes[index] to opposite boolean value
        boxes.splice(index, 1, !boxes[index])
        console.log(boxes)
    }
    let [registerProfilePics, setProfilePics] = useState([])
    const updatePhotoArray = (uri, pos, deleting) => {
        if (!deleting) {
            setProfilePics(registerProfilePics = registerProfilePics.concat({
                uri: uri,
                position: pos
            }))
            setPhotoDeleted(!photoDeleted)
            console.log(registerProfilePics.map(p => p.position))
        }
        else {
            const photoToBeDeleted = registerProfilePics.find(element => element.position === pos)
            registerProfilePics.splice(registerProfilePics.indexOf(photoToBeDeleted), 1)
            setPhotoDeleted(!photoDeleted)
            setProfilePics(registerProfilePics);
            console.log(registerProfilePics.map(p => p.position))
        }
    }

    const [photoDeleted, setPhotoDeleted] = useState(false)
    const { username, password, name, dob, bio, expLevel, methods, provider, uri } = props.route.params

    //Send inputted photos to backend


    const goNextForm = () => {
        if (registerProfilePics.length) {
            props.navigation.navigate('ChooseGym', {
                username: username, password: password, name: name, dob: dob, bio: bio, expLevel: expLevel,
                methods: methods, registerProfilePics: registerProfilePics, provider: provider || undefined, uri: uri || undefined
            })
        }
    }

    const resizePhoto = async (imageUri, num) => {
        const manipResult = await manipulateAsync(
            imageUri,
            [{
                resize: {
                    height: 1350,
                    width: 1080
                }
            }],
            { base64: true }
        )
        updatePhotoArray('data:image/jpeg;base64,' + manipResult.base64, num, false);
        changeBox(num);
    }



    //-----------------------------------------------------------------Functions to choose image from library, or open camera-------------------------------------
    const choosePhoto = async (num) => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        })
        if (!result.cancelled) resizePhoto(result.uri, num)
    }

    const takePhoto = async (num) => {
        const permission = await ImagePicker.requestCameraPermissionsAsync()
        if (permission.granted) {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,

            })
            if (!result.cancelled) resizePhoto(result.uri, num)
        }
    }

    const deletePhoto = (num) => {
        updatePhotoArray("", num, true);
        changeBox(num);
    }
    //-----------------------------------------------------------------Functions to choose image from library, or open camera-------------------------------------

    const { showActionSheetWithOptions } = useActionSheet();
    const handlePress = (choosePhoto, takePhoto, num) => {
        const options = ["Choose From Photos", "Open Camera", "Cancel"];
        const cancelButtonIndex = 2
        showActionSheetWithOptions({
            options,
            cancelButtonIndex
        }, (selectedIndex) => {
            switch (selectedIndex) {
                case 0:
                    choosePhoto(num)
                    break;
                case 1:
                    takePhoto(num)
                    break;
                case cancelButtonIndex:
                    break;
            }
        })
    }

    const showDeleteMenu = (deletePhoto, num) => {
        const options = ["Delete", "Cancel"];
        const destructiveButtonIndex = 0;
        const cancelButtonIndex = 1;
        showActionSheetWithOptions({
            options,
            cancelButtonIndex,
            destructiveButtonIndex
        }, (selectedIndex) => {
            switch (selectedIndex) {
                case destructiveButtonIndex:
                    deletePhoto(num);
                    break;
                case cancelButtonIndex:
                    break;
            }
        })
    }


    return (
        <View style={styles.container}>
            <View style={{ marginTop: 10, marginBottom: 20 }}>
                <Text style={{ fontSize: 34, fontFamily: 'Bodoni 72' }}>Add Photos of Yourself.</Text>
            </View>
            <View style={styles.imageContainer}>
                {registerProfilePics.some(element => element.position === 0) ?
                    (<AddImage buttonColor="transparent"
                        titleColor="#000"
                        title="+"
                        buttonStyle={
                            styles.button
                        }
                        disabled={true}
                        textStyle={{ fontSize: 34, fontFamily: 'Bodoni 72' }}
                        imageSource={registerProfilePics.find(element => element.position === 0)}
                        deleteButton={<XCircleBtn onPress={() => showDeleteMenu(deletePhoto, 0)} style={styles.deleteButton} />}
                    />)
                    : (
                        <AddImage buttonColor="transparent"
                            titleColor="#000"
                            title="+"
                            buttonStyle={
                                styles.button
                            }
                            onPress={() => handlePress(choosePhoto, takePhoto, 0)}
                            textStyle={{ fontSize: 34, fontFamily: 'Bodoni 72' }}
                        />
                    )}

                {registerProfilePics.some(element => element.position === 1) ?
                    (<AddImage buttonColor="transparent"
                        titleColor="#000"
                        title="+"
                        buttonStyle={
                            styles.button
                        }
                        textStyle={{ fontSize: 34, fontFamily: 'Bodoni 72' }}
                        disabled={true}
                        imageSource={registerProfilePics.find(element => element.position === 1)}
                        deleteButton={<XCircleBtn onPress={() => showDeleteMenu(deletePhoto, 1)} style={styles.deleteButton} />}
                    />)
                    : (<AddImage buttonColor="transparent"
                        titleColor="#000"
                        title="+"
                        buttonStyle={
                            styles.button
                        }
                        textStyle={{ fontSize: 34, fontFamily: 'Bodoni 72' }}
                        onPress={() => handlePress(choosePhoto, takePhoto, 1)}
                    />)}

                {registerProfilePics.some(element => element.position === 2) ?
                    (<AddImage buttonColor="transparent"
                        titleColor="#000"
                        title="+"
                        buttonStyle={
                            styles.button
                        }
                        textStyle={{ fontSize: 34, fontFamily: 'Bodoni 72' }}
                        disabled={true}
                        imageSource={registerProfilePics.find(element => element.position === 2)}
                        deleteButton={<XCircleBtn onPress={() => showDeleteMenu(deletePhoto, 2)} style={styles.deleteButton} />}
                    />)
                    : (<AddImage buttonColor="transparent"
                        titleColor="#000"
                        title="+"
                        buttonStyle={
                            styles.button
                        }
                        textStyle={{ fontSize: 34, fontFamily: 'Bodoni 72' }}
                        onPress={() => handlePress(choosePhoto, takePhoto, 2)}
                    />)}

                {registerProfilePics.some(element => element.position === 3) ?
                    (<AddImage buttonColor="transparent"
                        titleColor="#000"
                        title="+"
                        buttonStyle={
                            styles.button
                        }
                        textStyle={{ fontSize: 34, fontFamily: 'Bodoni 72' }}
                        disabled={true}
                        imageSource={registerProfilePics.find(element => element.position === 3)}
                        deleteButton={<XCircleBtn onPress={() => showDeleteMenu(deletePhoto, 3)} style={styles.deleteButton} />}
                    />)
                    : (<AddImage buttonColor="transparent"
                        titleColor="#000"
                        title="+"
                        buttonStyle={
                            styles.button
                        }
                        textStyle={{ fontSize: 34, fontFamily: 'Bodoni 72' }}
                        onPress={() => handlePress(choosePhoto, takePhoto, 3)}
                    />)}

                {registerProfilePics.some(element => element.position === 4) ?
                    (<AddImage buttonColor="transparent"
                        titleColor="#000"
                        title="+"
                        buttonStyle={
                            styles.button
                        }
                        textStyle={{ fontSize: 34, fontFamily: 'Bodoni 72' }}
                        disabled={true}
                        imageSource={registerProfilePics.find(element => element.position === 4)}
                        deleteButton={<XCircleBtn onPress={() => showDeleteMenu(deletePhoto, 4)} style={styles.deleteButton} />}
                    />)
                    : (<AddImage buttonColor="transparent"
                        titleColor="#000"
                        title="+"
                        buttonStyle={
                            styles.button
                        }
                        textStyle={{ fontSize: 34, fontFamily: 'Bodoni 72' }}
                        onPress={() => handlePress(choosePhoto, takePhoto, 4)}
                    />)}

                {registerProfilePics.some(element => element.position === 5) ?
                    (<AddImage buttonColor="transparent"
                        titleColor="#000"
                        title="+"
                        buttonStyle={
                            styles.button
                        }
                        textStyle={{ fontSize: 34, fontFamily: 'Bodoni 72' }}
                        disabled={true}
                        imageSource={registerProfilePics.find(element => element.position === 5)}
                        deleteButton={<XCircleBtn onPress={() => showDeleteMenu(deletePhoto, 5)} style={styles.deleteButton} />}
                    />)
                    : (<AddImage buttonColor="transparent"
                        titleColor="#000"
                        title="+"
                        buttonStyle={
                            styles.button
                        }
                        textStyle={{ fontSize: 34, fontFamily: 'Bodoni 72' }}
                        onPress={() => handlePress(choosePhoto, takePhoto, 5)}
                    />)}
            </View>

            <RightArrowBtn onPress={goNextForm} style={{ position: 'absolute', bottom: height * .07, right: 30 }} />
            <LeftArrowBtn onPress={() => { props.navigation.goBack() }} style={{ position: 'absolute', bottom: height * .07, left: 30 }} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageContainer: {
        height: '60%',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    button: {
        width: '31.5%',
        height: '39.375%',
        alignSelf: 'center',
        borderWidth: 1.5,
        borderColor: '#adb5bd',
        borderRadius: 6,
        padding: 3,
        marginHorizontal: 3,
        borderStyle: 'dashed',

    },
    deleteButton: {
        ...StyleSheet.absoluteFillObject,
        alignSelf: 'flex-end',
        marginTop: -10,
        left: width * .25
    }
});

export default Photos;