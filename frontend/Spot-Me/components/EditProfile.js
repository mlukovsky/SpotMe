//Page where users can edit their information

import React, { useState, useEffect, useContext, useCallback } from 'react'
import { View, Text, StyleSheet, StatusBar, Image, ScrollView, TextInput, Dimensions, KeyboardAvoidingView, Button, Alert } from 'react-native'
import SelectBox from 'react-native-multi-selectbox'
import { xorBy } from 'lodash'
import AddImage from '../Shared/Forms/Buttons/AddImage'
import { XCircleBtn } from '../Shared/Forms/Buttons/XCircleBtn'
import { useActionSheet } from '@expo/react-native-action-sheet';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync } from 'expo-image-manipulator';
import RangeSlider from 'rn-range-slider'
import Rail from '../utils/RangeSlider/Rail'
import Thumb from '../utils/RangeSlider/Thumb'
import Notch from '../utils/RangeSlider/Notch'
import RailSelected from '../utils/RangeSlider/RailSelected'
import Label from '../utils/RangeSlider/Label'
import calculateAge from '../utils/CalculateAge'
import axios from 'axios'
import { SERVER_PORT, PLACES_API_KEY } from '@env'
import { EXP_LVL, METHODS } from '../Shared/UserDataEnums'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { SmallXCircleBtn } from '../Shared/Forms/Buttons/XCircleBtn';
import { UserDataContext, CardStackContext } from './Contexts'

const { height, width } = Dimensions.get("screen")

const EditProfile = (props) => {
    const { userData, setUserData } = useContext(UserDataContext)
    let { cardStack, setCardStack } = useContext(CardStackContext)
    setCardStack = (arr) => {
        cardStack = arr;
    }
    setCardStack = (arr) => {
        cardStack.length = 0;
        cardStack = arr;
    }
    const [Bio, setBio] = useState(userData.bio)
    const [Exp, setExp] = useState({ item: userData.expLevel, id: EXP_LVL.find(el => el.item === userData.expLevel).id })
    const [Methods, setMethods] = useState(userData.methods.map(m => ({ item: m, id: METHODS.find(el => el.item === m).id })))
    let [boxes, changeBox] = useState(Array(userData.images.length).fill(true, 0, userData.images.length))
    changeBox = (index) => {
        //replace element at boxes[index] to opposite boolean value
        boxes.splice(index, 1, !boxes[index])
        console.log(boxes)
    }
    let [profilePics, setProfilePics] = useState(userData.images.map(img => ({ uri: img.url, position: img.position, isNew: false })))
    const updatePhotoArray = (uri, pos, deleting) => {
        if (!deleting) {
            setProfilePics(profilePics = profilePics.concat({
                uri: uri,
                position: pos,
                isNew: true
            }))
            setPhotoDeleted(!photoDeleted)
            console.log(profilePics.map(p => p.position))
        }
        else {
            const photoToBeDeleted = profilePics.find(element => element.position === pos)
            profilePics.splice(profilePics.indexOf(photoToBeDeleted), 1)
            setPhotoDeleted(!photoDeleted)
            setProfilePics(profilePics);
            console.log(profilePics.map(p => p.position))
        }
    }

    const [photoDeleted, setPhotoDeleted] = useState(false)
    const [uploadedImages, setUploadedImages] = useState(null)

    const [gymsFound, setGymsFound] = useState(false)
    let [selectedGyms, setSelectedGyms] = useState(userData.gyms)
    setSelectedGyms = (element) => {
        selectedGyms.push(element)
        setGymsFound(!gymsFound)
        console.log(selectedGyms)
    }
    let [searchInput, setSearchInput] = useState('')
    setSearchInput = (str) => {
        searchInput += str;
    }

    function onMultiChange() {
        return (item) => setMethods(xorBy(Methods, [item], 'id'))
    }

    function onChange() {
        return (val) => setExp(val)
    }


    const [distSliderValue, setDistSliderValue] = useState(userData.distancePref || 10)


    const userAge = calculateAge(userData.dob)
    const [low, setLow] = useState(userData.agePref ? userAge + userData.agePref.min : userAge - 5)
    const [high, setHigh] = useState(userData.agePref ? userAge + userData.agePref.max : userAge + 5)
    const renderThumb = useCallback((name) => <Thumb />, []);
    const renderRail = useCallback(() => <Rail />, []);
    const renderRailSelected = useCallback(() => <RailSelected />, []);
    const renderLabel = useCallback(value => <Label text={value} />, []);
    const renderNotch = useCallback(() => <Notch />, []);
    const handleValueChange = useCallback((low, high) => {
        setLow(low);
        setHigh(high);
    }, []);

    const { showActionSheetWithOptions } = useActionSheet();

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

    const deletePhoto = (num) => {
        updatePhotoArray("", num, true);
        changeBox(num);
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

    const showUploadMenu = (choosePhoto, takePhoto, num) => {
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
    //-----------------------------------------------------------------Functions to choose image from library, or open camera-------------------------------------


    const createSaveAlert = () => {
        Alert.alert('Are you sure you want to save changes?', undefined, [{
            text: 'Cancel',
            style: 'cancel'
        },
        {
            text: 'Save',
            onPress: () => updatePhotos(),
        }]);
    }
    const createDiscardAlert = () => {
        Alert.alert('Are you sure you want to discard changes?', undefined, [{
            text: 'Cancel',
            style: 'cancel'
        },
        {
            text: 'Discard',
            style: 'destructive',
            onPress: () => {
                setBio(userData.bio);
                setExp({ item: userData.expLevel, id: EXP_LVL.find(el => el.item === userData.expLevel).id })
                setMethods(userData.methods.map(m => ({ item: m, id: METHODS.find(el => el.item === m).id })))
                setProfilePics(userData.images.map(img => ({ uri: img.url, position: img.position, isNew: false })))
                setPhotoDeleted(false)
                setUploadedImages(null)
                selectedGyms = userData.gyms;
                setDistSliderValue(userData.distPref || 10)
                props.navigation.navigate("Profile")
            }
        }])
    }

    useEffect(() => {
        const discardAlert = props.navigation.addListener('blur', () => {
            setBio(userData.bio);
            setExp({ item: userData.expLevel, id: EXP_LVL.find(el => el.item === userData.expLevel).id })
            setMethods(userData.methods.map(m => ({ item: m, id: METHODS.find(el => el.item === m).id })))
            setProfilePics(userData.images.map(img => ({ uri: img.url, position: img.position, isNew: false })))
            setPhotoDeleted(false)
            setUploadedImages(null)
            selectedGyms = userData.gyms;
            setDistSliderValue(userData.distPref || 10)
        })
        return discardAlert
    }, [props.navigation])

    const updatePhotos = async () => {
        await axios({
            url: `${SERVER_PORT}/image`,
            method: 'put',
            data: {
                images: profilePics,
                id: userData._id
            }
        })
            .then((response) => {
                const data = JSON.parse(response.request._response);
                setUploadedImages(data)
            })
            .catch((err) => console.log(err))
    }

    const updateUser = async () => {
        if (uploadedImages) {
            const expLevel = Exp.item
            const methods = Methods.map(m => m.item)
            await axios({
                url: `${SERVER_PORT}/edituser`,
                method: 'put',
                data: {
                    bio: Bio,
                    expLevel: expLevel,
                    methods: methods,
                    imageData: uploadedImages,
                    id: userData._id,
                    gyms: selectedGyms,
                    distancePref: distSliderValue,
                    agePref: {
                        min: low - userAge,
                        max: high - userAge
                    }
                },
                withCredentials: true
            }).then((response) => {
                setUserData(response.data)
                getCardStack();

            })
                .catch((error) => console.log(error, error.stack))
        }
    }

    async function getCardStack() {
        await axios.get(`${SERVER_PORT}/getQueue`)
            .then((response) => {
                setCardStack(response.data.items);
                props.navigation.navigate("Profile")
            })
            .catch((err) => console.log(err))
    }

    useEffect(() => {
        updateUser();
    }, [uploadedImages])

    async function findGymFromSearch(gymName) {
        if (searchInput.length) {
            await axios.get(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${searchInput}&inputtype=textquery&fields=geometry,formatted_address&key=${PLACES_API_KEY}`)
                .then((response) => {
                    console.log(response.data.candidates)
                    setSelectedGyms({
                        latitude: response.data.candidates[0].geometry.location.lat,
                        longitude: response.data.candidates[0].geometry.location.lng,
                        name: gymName,
                        address: response.data.candidates[0].formatted_address.split(',', 2).join(',')
                    })
                })
                .catch((err) => console.log(err))
        }
    }

    const deleteSelectedGym = (index) => {
        selectedGyms.splice(index, 1);
        setGymsFound(!gymsFound);
        console.log(selectedGyms);
    }


    return (
        <KeyboardAvoidingView behavior='padding' style={styles.container}>
            <ScrollView style={{ backgroundColor: '#202020', flex: 1 }} horizontal={false} keyboardShouldPersistTaps='handled'>
                <View style={{ alignItems: 'flex-start', flex: 1 }}>
                    <Text style={styles.name}>{userData.name}</Text>
                </View>
                <View style={{ flex: 1, flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center' }}>
                    {profilePics.some(element => element.position === 0) ?
                        (<AddImage buttonColor="transparent"
                            titleColor="#FFF"
                            title="+"
                            buttonStyle={
                                styles.imgButton
                            }
                            disabled={true}
                            textStyle={{ fontSize: 34, fontFamily: 'Bodoni 72' }}
                            imageSource={profilePics.find(element => element.position === 0)}
                            deleteButton={<XCircleBtn onPress={() => showDeleteMenu(deletePhoto, 0)} style={styles.deleteButton} />}
                        />)
                        : (
                            <AddImage buttonColor="transparent"
                                titleColor="#FFF"
                                title="+"
                                buttonStyle={
                                    styles.imgButton
                                }
                                onPress={() => showUploadMenu(choosePhoto, takePhoto, 0)}
                                textStyle={{ fontSize: 34, fontFamily: 'Bodoni 72' }}
                            />
                        )
                    }
                    {profilePics.some(element => element.position === 1) ?
                        (<AddImage buttonColor="transparent"
                            titleColor="#FFF"
                            title="+"
                            buttonStyle={
                                styles.imgButton
                            }
                            textStyle={{ fontSize: 34, fontFamily: 'Bodoni 72' }}
                            disabled={true}
                            imageSource={profilePics.find(element => element.position === 1)}
                            deleteButton={<XCircleBtn onPress={() => showDeleteMenu(deletePhoto, 1)} style={styles.deleteButton} />}
                        />)
                        : (<AddImage buttonColor="transparent"
                            titleColor="#FFF"
                            title="+"
                            buttonStyle={
                                styles.imgButton
                            }
                            textStyle={{ fontSize: 34, fontFamily: 'Bodoni 72' }}
                            onPress={() => showUploadMenu(choosePhoto, takePhoto, 1)}
                        />)}

                    {profilePics.some(element => element.position === 2) ?
                        (<AddImage buttonColor="transparent"
                            titleColor="#FFF"
                            title="+"
                            buttonStyle={
                                styles.imgButton
                            }
                            textStyle={{ fontSize: 34, fontFamily: 'Bodoni 72' }}
                            disabled={true}
                            imageSource={profilePics.find(element => element.position === 2)}
                            deleteButton={<XCircleBtn onPress={() => showDeleteMenu(deletePhoto, 2)} style={styles.deleteButton} />}
                        />)
                        : (<AddImage buttonColor="transparent"
                            titleColor="#FFF"
                            title="+"
                            buttonStyle={
                                styles.imgButton
                            }
                            textStyle={{ fontSize: 34, fontFamily: 'Bodoni 72' }}
                            onPress={() => showUploadMenu(choosePhoto, takePhoto, 2)}
                        />)}

                    {profilePics.some(element => element.position === 3) ?
                        (<AddImage buttonColor="transparent"
                            titleColor="#FFF"
                            title="+"
                            buttonStyle={
                                styles.imgButton
                            }
                            textStyle={{ fontSize: 34, fontFamily: 'Bodoni 72' }}
                            disabled={true}
                            imageSource={profilePics.find(element => element.position === 3)}
                            deleteButton={<XCircleBtn onPress={() => showDeleteMenu(deletePhoto, 3)} style={styles.deleteButton} />}
                        />)
                        : (<AddImage buttonColor="transparent"
                            titleColor="#FFF"
                            title="+"
                            buttonStyle={
                                styles.imgButton
                            }
                            textStyle={{ fontSize: 34, fontFamily: 'Bodoni 72' }}
                            onPress={() => showUploadMenu(choosePhoto, takePhoto, 3)}
                        />)}

                    {profilePics.some(element => element.position === 4) ?
                        (<AddImage buttonColor="transparent"
                            titleColor="#FFF"
                            title="+"
                            buttonStyle={
                                styles.imgButton
                            }
                            textStyle={{ fontSize: 34, fontFamily: 'Bodoni 72' }}
                            disabled={true}
                            imageSource={profilePics.find(element => element.position === 4)}
                            deleteButton={<XCircleBtn onPress={() => showDeleteMenu(deletePhoto, 4)} style={styles.deleteButton} />}
                        />)
                        : (<AddImage buttonColor="transparent"
                            titleColor="#FFF"
                            title="+"
                            buttonStyle={
                                styles.imgButton
                            }
                            textStyle={{ fontSize: 34, fontFamily: 'Bodoni 72' }}
                            onPress={() => showUploadMenu(choosePhoto, takePhoto, 4)}
                        />)}

                    {profilePics.some(element => element.position === 5) ?
                        (<AddImage buttonColor="transparent"
                            titleColor="#FFF"
                            title="+"
                            buttonStyle={
                                styles.imgButton
                            }
                            textStyle={{ fontSize: 34, fontFamily: 'Bodoni 72' }}
                            disabled={true}
                            imageSource={profilePics.find(element => element.position === 5)}
                            deleteButton={<XCircleBtn onPress={() => showDeleteMenu(deletePhoto, 5)} style={styles.deleteButton} />}
                        />)
                        : (<AddImage buttonColor="transparent"
                            titleColor="#FFF"
                            title="+"
                            buttonStyle={
                                styles.imgButton
                            }
                            textStyle={{ fontSize: 34, fontFamily: 'Bodoni 72' }}
                            onPress={() => showUploadMenu(choosePhoto, takePhoto, 5)}
                        />)}
                </View>
                <View style={{ marginLeft: 25, marginTop: 15 }}></View>
                <View style={{ marginTop: 15, marginBottom: 30, alignItems: 'center' }}>
                    <Text style={{ textAlign: 'center', color: 'white', fontSize: 16 }}>Search Distance <Text style={{ fontSize: 12, fontWeight: '300' }}>(in miles)</Text></Text>
                    <RangeSlider
                        style={{ backgroundColor: '#202020', width: width * .85, height: 40 }}
                        min={1}
                        max={50}
                        low={distSliderValue}
                        disableRange={true}
                        step={1}
                        floatingLabel={true}
                        renderThumb={renderThumb}
                        renderRail={renderRail}
                        renderRailSelected={renderRailSelected}
                        renderLabel={renderLabel}
                        renderNotch={renderNotch}
                        onValueChanged={(val) => { setDistSliderValue(val); console.log(distSliderValue) }}
                    />
                    <Text style={{ textAlign: 'center', color: 'white', fontSize: 16 }}>{distSliderValue}</Text>
                    <Text style={{ textAlign: 'center', color: 'white', fontSize: 16, marginVertical: 15 }}>Show Ages: </Text>
                    <RangeSlider
                        style={{ backgroundColor: '#202020', width: width * .85, height: 40 }}
                        min={14}
                        max={80}
                        low={low}
                        high={high}
                        step={1}
                        floatingLabel={true}
                        renderThumb={renderThumb}
                        renderRail={renderRail}
                        renderRailSelected={renderRailSelected}
                        renderLabel={renderLabel}
                        renderNotch={renderNotch}
                        onValueChanged={handleValueChange}
                    />
                    <Text style={{ textAlign: 'center', color: 'white', fontSize: 14 }}>{low} - {high}</Text>
                </View>
                <Text style={styles.bio}>Username: {userData.username}</Text>
                <Text style={styles.bio}>Date of Birth: {userData.dob.substr(0, 10)}</Text>
                <Text style={styles.bio}>Bio</Text>
                <View style={{ borderWidth: 2, borderColor: 'gray', borderRadius: 10, width: width * .8, height: 180, alignSelf: 'center', }}>
                    <TextInput placeholder='Bio' autoFocus={false} multiline={true} maxLength={400} numberOfLines={8}
                        style={{ textAlignVertical: 'top', color: 'white' }} onChangeText={e => setBio(e)} value={Bio}>
                    </TextInput>
                </View>
                <Text style={{ color: 'white', fontSize: 16, textAlign: 'center', marginTop: 15 }}>Search for the gyms you go to.</Text>
                <ScrollView contentContainerStyle={{ width, justifyContent: 'center', alignItems: 'center', marginVertical: 15 }} horizontal={true} keyboardShouldPersistTaps='always'>
                    <GooglePlacesAutocomplete
                        placeholder='Search'
                        styles={{
                            container: { width: '100%' },
                            textInputContainer: { width: '100%', borderWidth: 1.5, borderRadius: 5, borderColor: 'black' },
                            textInput: { height: height * .07, width: '100%' },
                            description: { fontWeight: 'bold' }
                        }}
                        onPress={(data, details = null) => {
                            // 'details' is provided when fetchDetails = true
                            //console.log(data, details);
                            setSearchInput(data.description.split(' ').join('%20'))
                            console.log(searchInput)
                            findGymFromSearch(details.structured_formatting.main_text);
                        }}
                        query={{
                            key: PLACES_API_KEY,
                            language: 'en'
                        }}
                    />
                </ScrollView>
                <View style={{ marginBottom: 15, alignSelf: 'center' }}>
                    {(selectedGyms.length > 0) && <Text style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: 'white', fontSize: 16 }}>Selected Gyms:</Text>}
                    {(selectedGyms.length > 0) && selectedGyms.map((gym, index) => {
                        return (
                            <View key={index} style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10, borderBottomWidth: 1, width: width * .9 }}>
                                <Text style={{ fontSize: 14, color: 'white' }}>{gym.name}, {gym.address}</Text>
                                <SmallXCircleBtn style={{ marginLeft: 10, paddingBottom: 7 }} onPress={() => deleteSelectedGym(index)} />
                            </View>
                        )
                    })}
                </View>
                <View style={{ marginVertical: 20, width: '80%', alignSelf: 'center' }}>
                    <Text style={styles.bio}>Experience Level</Text>
                    <SelectBox
                        label="Select your level"
                        options={EXP_LVL}
                        value={Exp}
                        onChange={onChange()}
                        hideInputFilter={true}
                        labelStyle={{ textAlign: 'center', fontSize: 16, color: 'gray' }}
                        arrowIconColor='gray'
                        optionsLabelStyle={{ color: 'white' }}
                        selectedItemStyle={{ color: 'white' }}
                    />
                </View>
                <View style={{ marginVertical: 20, width: '80%', alignSelf: 'center' }}>
                    <Text style={styles.bio}>Passions: </Text>
                    <SelectBox
                        label="Select multiple passions"
                        options={METHODS}
                        selectedValues={Methods}
                        onMultiSelect={onMultiChange()}
                        onTapClose={onMultiChange()}
                        isMulti
                        labelStyle={{ textAlign: 'center', fontSize: 16, color: 'gray' }}
                        arrowIconColor='gray'
                        toggleIconColor='gray'
                        searchIconColor='gray'
                        optionsLabelStyle={{ color: 'white' }}
                        inputFilterStyle={{ color: 'white' }}
                    />
                </View>
                <Button title={"Save"} onPress={createSaveAlert} />
                <Button title={"Discard"} onPress={createDiscardAlert} />
            </ScrollView>
        </KeyboardAvoidingView >



    )
}

const styles = StyleSheet.create({
    container: {
        flex: '1',
        paddingTop: StatusBar.currentHeight
    },
    name: {
        color: 'white',
        fontSize: 30,
        marginTop: 20,
        marginLeft: 25
    },
    mainPicture: {
        height: 115,
        width: 115,
        borderRadius: 115 / 2,
        marginTop: 20,
        marginLeft: 15,
        alignSelf: 'center'
    },
    bio: {
        color: 'white',
        fontSize: 16
    },
    imgButton: {
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
        marginTop: -15,
        left: width * .25
    }
})

export default EditProfile;