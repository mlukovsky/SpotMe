//Logged in user's profile
//...dsddj

import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, StatusBar, Image, SafeAreaView, Dimensions } from 'react-native';
import axios from 'axios'
import { SERVER_PORT } from '@env'
import { FormContainer } from '../Shared/Forms/FormContainer';
import { MaterialIcons } from '@expo/vector-icons';
import { UserDataContext } from './Contexts';
import calculateAge from '../utils/CalculateAge';

const { height, width } = Dimensions.get("screen")

const Profile = (props) => {

    const { userData, setUserData } = useContext(UserDataContext);





    // useEffect(() => {
    //     async function fetchData() {
    //         await axios({
    //             url: `${SERVER_PORT}/isLoggedIn`,
    //             withCredentials: true
    //         })
    //             .then((response) => {
    //                 if (response.data) {
    //                     setUserData(response.data)
    //                 }
    //             })
    //             .catch((error) => console.log(error));
    //     }
    //     fetchData();
    // }, [props.route.params])

    const logoutUser = async () => {
        await axios({
            url: `${SERVER_PORT}/logout`,
            withCredentials: true
        }).then((response) => {
            console.log(response.data)
            props.navigation.navigate("Onboarding")
        }).catch((err) => console.log(err, err.stack))
    }


    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>



                {userData ? (
                    <View>
                        <View style={{
                            paddingHorizontal: 40,
                            backgroundColor: "#FFFFFF",
                            borderBottomLeftRadius: 40,
                            borderBottomRightRadius: 40
                        }}>
                            <View style={{ flexDirection: "row", width: "100%", marginTop: 35 }}>

                                <MaterialIcons.Button name="edit" size={24} color="black" backgroundColor="white" onPress={() => props.navigation.navigate("Edit Profile", { userData })}></MaterialIcons.Button>
                                <View style={{
                                    width: "90%", alignItems: "flex-end"
                                }}>
                                    <MaterialIcons.Button name="logout" size={24} color="black" backgroundColor="white" onPress={logoutUser}></MaterialIcons.Button>

                                </View>
                            </View>
                            {userData.images &&
                                <View style={styles.header}>
                                    <Image source={{ uri: userData.images[0].url }} style={{ alignSelf: 'center', height: 115, width: 115, borderRadius: 115 / 2 }} />
                                    <View style={{ alignItems: 'center' }}>
                                        <Text>
                                            <Text style={styles.name}>{userData.name}  </Text>
                                            <Text style={styles.age}>{calculateAge(userData.dob)}</Text>
                                        </Text>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', width, justifyContent: 'center' }}>
                                            {userData.gyms.map((gym, index) => {
                                                return (
                                                    <View key={index} style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                                        <Image source={require('../assets/SpotMarker.png')} style={{ width: 30, height: 30 }} />
                                                        <Text style={{ textAlign: 'center', marginTop: 10 }}>{gym.name} <Text style={{ fontWeight: '200', fontSize: 14 }}>{gym.address}</Text></Text>
                                                    </View>
                                                )
                                            })}
                                        </View>
                                        <Text style={styles.text}>{userData.expLevel}</Text>
                                        <Text style={styles.text}>Interests:</Text>
                                        <View style={{ flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center', width, marginTop: 10, }}>
                                            {(userData.methods.map((method, index) => {
                                                return (
                                                    <View style={{ borderWidth: 1, borderRadius: 20, backgroundColor: '#202020', marginHorizontal: 5 }} key={index}>
                                                        <Text style={{ color: 'white', padding: 10 }}>{method}</Text>
                                                    </View>
                                                )
                                            }))}
                                        </View>
                                        <Text style={styles.bio}>
                                            {userData.bio}
                                        </Text>

                                    </View>
                                </View>
                            }
                        </View>

                        <View style={{ marginVertical: 30 }}>
                            {/* spacing between header and body */}
                        </View>
                        {userData.images.length > 1 &&
                            <View style={{ flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'center', alignContent: 'center', alignItems: 'center', width }}>

                                {userData.images.filter(i => i.position > 0).map((i, index) => {
                                    return (
                                        <Image source={{ uri: i.url }} style={{
                                            height: 200, width: '40%', marginVertical: 10, marginHorizontal: 10, borderRadius: 20
                                        }} key={index} />
                                    )
                                })}

                            </View>
                        }

                    </View>) : (<Text>Profile</Text>)}
            </ScrollView>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: StatusBar.currentHeight,
        backgroundColor: '#202020'
    },
    scrollView: {
        width
    },
    text: {
        color: '#202020',
        fontFamily: 'Thonburi',
        fontSize: 18,
    },
    name: {
        color: '#202020',
        fontFamily: 'Thonburi',
        fontSize: 26,
        fontWeight: 'bold'
    },
    age: {
        color: '#202020',
        fontSize: 18,
        fontFamily: 'Thonburi',
        fontWeight: '300'
    },
    bio: {
        color: '#202020',
        fontFamily: 'Thonburi',
        fontSize: 14,
        marginVertical: 10
    },
    header: {
        paddingTop: height * .02,
        flexDirection: 'column'
    }
});

export default Profile;