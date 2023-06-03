import React, { useState, useEffect, useContext } from 'react';
import { Platform, Text, View, StyleSheet, Dimensions, Image, ScrollView, StatusBar } from 'react-native';
import * as Location from 'expo-location';
import { RightArrowBtn, LeftArrowBtn } from '../../Shared/Forms/Buttons/ArrowButtons';
import { PLACES_API_KEY, SERVER_PORT } from '@env'
import axios from 'axios'

import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { SmallXCircleBtn } from '../../Shared/Forms/Buttons/XCircleBtn';
import { LoginContext, CardStackContext, UserDataContext } from '../Contexts';

const { height, width } = Dimensions.get('screen')
export default function ChooseGym(props) {
    const [uploadedImages, setUploadedImages] = useState(null)
    const [location, setLocation] = useState(null);
    let [nearbyGyms, setNearbyGyms] = useState([])
    setNearbyGyms = (element) => {
        nearbyGyms.push(element)
    }
    const [gymsFound, setGymsFound] = useState(false)
    let [selectedGyms, setSelectedGyms] = useState([])
    setSelectedGyms = (element) => {
        selectedGyms.push(element)
        setGymsFound(!gymsFound)
        console.log(selectedGyms)
    }
    let [searchInput, setSearchInput] = useState('')
    setSearchInput = (str) => {
        searchInput += str;
    }

    const [sliderValue, setSliderValue] = useState(5)
    let [searchRadius, setSearchRadius] = useState(8047)
    setSearchRadius = (num) => {
        searchRadius = num
    }

    const { loggedIn, setLoggedIn } = useContext(LoginContext)
    const { cardStack, setCardStack } = useContext(CardStackContext)
    const { userData, setUserData } = useContext(UserDataContext)

    const { username, password, name, dob, bio, expLevel, methods, registerProfilePics, provider, uri } = props.route.params;

    // Coordinates for Hunter 
    const INITIAL_POSITION = {
        latitude: 40.7678,
        longitude: -73.9645,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    }
    //-------------------------------------------------------------------------------------REGISTRATION ROUTES---------------------------------------------------------
    const registerUser = async () => {
        if (uploadedImages) {
            await axios({
                url: `${SERVER_PORT}/register`,
                method: 'post',
                data: {
                    username: username,
                    password: password,
                    name: name,
                    dob: dob,
                    bio: bio,
                    expLevel: expLevel,
                    methods: methods,
                    imageData: uploadedImages,
                    provider: provider || undefined,
                    uri: uri || undefined,
                    gyms: selectedGyms
                },
                withCredentials: true
            }).then((response) => {
                console.log(response.data)
                loginUser()
            })
                .catch((error) => console.log(error, error.stack))
        }
    }

    async function getCardStack() {
        await axios.get(`${SERVER_PORT}/getQueue`)
            .then((response) => {
                setCardStack(response.data.items)
                props.navigation.navigate("BottomTabs")
            })
            .catch((err) => console.log(err))
    }


    const loginUser = async () => {
        if (!(provider && uri)) {
            await axios({
                url: `${SERVER_PORT}/login`,
                method: 'post',
                data: {
                    username: username,
                    password: password
                },
                withCredentials: true
            }).then((response) => {
                setLoggedIn(true)
                setUserData(response.data)
                getCardStack()
            })
                .catch((error) => console.log(error, error.stack))
        }
        else {
            await axios({
                url: `${SERVER_PORT}/login/oauth`,
                method: 'post',
                data: {
                    uri: uri
                },
                withCredentials: true
            }).then((response) => {
                setLoggedIn(true)
                setUserData(response.data)
                getCardStack();
            })
                .catch((error) => console.log(error, error.stack))
        }
    }

    const uploadPhoto = async () => {
        await axios({
            url: `${SERVER_PORT}/image`,
            method: 'post',
            data: {
                images: registerProfilePics
            }
        })
            .then((response) => {
                const data = JSON.parse(response.request._response);
                setUploadedImages(data)
            })
            .catch((err) => console.log(err, err.stack))
    }
    //-------------------------------------------------------------------------------------REGISTRATION ROUTES---------------------------------------------------------

    useEffect(() => {
        async function getLocation() {
            let { granted } = await Location.requestForegroundPermissionsAsync();
            if (!granted) {
                setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        }
        getLocation();
    }, []);

    // useEffect(() => {
    //     async function getNearbyGyms() {
    //         if (location) {
    //             await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.coords.latitude},${location.coords.longitude}&radius=${searchRadius}&type=gym&key=${PLACES_API_KEY}`)
    //                 .then((response) => {
    //                     //If search radius has been updated, empty gyms array and refill with new results
    //                     if (nearbyGyms) {
    //                         console.log(response.data.results)
    //                         nearbyGyms.length = 0;
    //                     }
    //                     for (let result of response.data.results) {
    //                         if (result.business_status === "OPERATIONAL") {
    //                             setNearbyGyms({
    //                                 latitude: result.geometry.location.lat,
    //                                 longitude: result.geometry.location.lng,
    //                                 name: result.name,
    //                                 address: result.vicinity
    //                             })
    //                         }
    //                     }
    //                     setGymsFound(!gymsFound);
    //                 })
    //                 .catch((err) => console.log(err, err.message))
    //         }
    //     }
    //     getNearbyGyms()
    // }, [location, searchRadius])


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

    useEffect(() => {
        registerUser()
    }, [uploadedImages])
    return (
        <View style={styles.container}>
            <View style={{ marginTop: height * .04, width, height, alignItems: 'center' }}>
                <Text style={{ fontSize: 34, fontFamily: 'Bodoni 72' }}>Select Your Gym.</Text>
                <Text style={{ textAlign: 'center', marginVertical: 10 }}>Search for the gyms you go to.</Text>

                <GooglePlacesAutocomplete
                    placeholder='Search'
                    styles={{
                        textInputContainer: { width: '90%', borderWidth: 1.5, borderRadius: 5, borderColor: 'black' },
                        textInput: { height: height * .07 },
                        description: { fontWeight: 'bold' }
                    }}
                    onPress={(data, details = null) => {
                        // 'details' is provided when fetchDetails = true
                        console.log(data, details);
                        setSearchInput(data.description.split(' ').join('%20'))
                        console.log(searchInput)
                        findGymFromSearch(details.structured_formatting.main_text);
                    }}
                    query={{
                        key: PLACES_API_KEY,
                        language: 'en'
                    }}
                />
                {/* <View style={{ marginTop: 30, marginBottom: -30 }}>
                <Text style={{ textAlign: 'center' }}>Search Radius <Text style={{ fontSize: 12, fontWeight: '300' }}>(in miles)</Text></Text>
                <Slider
                    style={{ width: 300, height: 40 }}
                    minimumValue={1}
                    maximumValue={50}
                    step={1}
                    value={5}
                    onValueChange={(val) => setSliderValue(val)}
                    minimumTrackTintColor="#CED4DA"
                    maximumTrackTintColor="#000000"
                    onSlidingComplete={(val) => {
                        //convert miles to meters
                        setSearchRadius(Math.round(val * 1609.34))
                    }}
                />
                <Text style={{ textAlign: 'center' }}>{sliderValue}</Text>
            </View>
            <ScrollView contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}>
                {location ?
                    (<View style={{ marginTop: 30 }}>
                        <MapView provider={PROVIDER_GOOGLE}
                            style={styles.map}
                            region={{
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                                longitudeDelta: 0.075,
                                latitudeDelta: 0.075
                            }}
                            loadingEnabled={true}
                            loadingBackgroundColor='#606060'
                            showsUserLocation={true}
                        >


                            {nearbyGyms && nearbyGyms.map((gym, index) => (
                                <Marker
                                    key={index}
                                    coordinate={{
                                        latitude: gym.latitude,
                                        longitude: gym.longitude,
                                    }}
                                    title={gym.name}
                                    description={gym.address}
                                    image={require('../../assets/SpotMarker.png')}
                                    onPress={() => setSelectedGyms({ latitude: gym.latitude, longitude: gym.longitude, name: gym.name, address: gym.address })}
                                />
                            ))}
                        </MapView>
                        
                    </View>)
                    :
                    (<View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Image source={require('../../assets/loading.gif')} style={{ height: 50, width: 50 }} />
                        <Text>Please wait for the map to load.</Text>
                    </View>)} */}
                <View style={{ marginBottom: height * .2 }}>
                    {(selectedGyms.length > 0) && <Text style={{ fontWeight: 'bold', textAlign: 'center', marginBottom: 20 }}>Selected Gyms:</Text>}
                    {(selectedGyms.length > 0) && selectedGyms.map((gym, index) => {
                        return (
                            <View key={index} style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10, borderBottomWidth: 1, width: width * .9 }}>
                                <Text style={{ fontSize: 14 }}>{gym.name}, {gym.address}</Text>
                                <SmallXCircleBtn style={{ marginLeft: 10, paddingBottom: 7 }} onPress={() => deleteSelectedGym(index)} />
                            </View>
                        )
                    })}
                </View>
            </View>
            {/* </ScrollView> */}
            <RightArrowBtn onPress={uploadPhoto} style={{ position: 'absolute', bottom: height * .02, right: 30 }} />
            <LeftArrowBtn onPress={() => { props.navigation.goBack() }} style={{ position: 'absolute', bottom: height * .02, left: 30 }} />

        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: "center",
    },
    map: {
        width: width - 2,
        height: height * .4,
        borderWidth: 3
    },
    logoMarker: {
        width: 20,
        height: 20,
    },
    logo: {
        width: 180,
        height: 180,
        color: "black",
        position: "absolute",
        top: 10,
        alignSelf: 'center'
    }
})