//1st step of registration process

import { React, useState, useEffect } from 'react';
import { View, StyleSheet, Button, Image, Text, ScrollView, KeyboardAvoidingView, Dimensions, Platform } from 'react-native';
import { FormContainer } from '../../Shared/Forms/FormContainer';
import { Input } from '../../Shared/Forms/Input'
import { LeftArrowBtn, RightArrowBtn } from '../../Shared/Forms/Buttons/ArrowButtons';
import axios from 'axios'
import { SERVER_PORT, GOOGLE_CLIENT_ID, FACEBOOK_APP_ID } from '@env'
import * as Google from 'expo-auth-session/providers/google'
import * as Facebook from 'expo-auth-session/providers/facebook'
import { AntDesign } from '@expo/vector-icons'


// 

const { height, width } = Dimensions.get("screen")

const Register = (props) => {
    const [registerUsername, setRegisterUsername] = useState("")
    const [registerPassword, setRegisterPassword] = useState("")
    let [googleAccessToken, setGoogleToken] = useState("");
    setGoogleToken = (str) => {
        googleAccessToken += str;
    }
    let [googleUserInfo, setGoogleUserInfo] = useState({});
    setGoogleUserInfo = (obj) => {
        googleUserInfo = obj;
    }

    const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
        expoClientId: GOOGLE_CLIENT_ID
    })

    const [fbRequest, fbResponse, fbPromtAsync] = Facebook.useAuthRequest({
        expoClientId: FACEBOOK_APP_ID,
        redirectUri: "https://auth.expo.io/@mlukovsky2/Spot-Me"
    })

    let [fbAccessToken, setFbToken] = useState("");
    setFbToken = (str) => {
        fbAccessToken += str;
    }

    let [fbUserInfo, setFbUserInfo] = useState({});
    setFbUserInfo = (obj) => {
        fbUserInfo = obj;
    }

    const goNextForm = () => {
        if (registerUsername && registerPassword) {
            props.navigation.navigate('NameDOB', { username: registerUsername, password: registerPassword })
        }
    }


    useEffect(() => {
        async function fetchGoogleData() {
            if (googleResponse?.type === "success") {
                setGoogleToken(googleResponse.authentication.accessToken)
                console.log(googleAccessToken || "none")
                await getGoogleUserData()

            }
        }
        fetchGoogleData();
    }, [googleResponse])

    async function getGoogleUserData() {
        if (googleAccessToken) {
            axios.get("https://www.googleapis.com/userinfo/v2/me", {
                headers: {
                    Authorization: `Bearer ${googleAccessToken}`
                },
                withCredentials: true
            })
                .then((response) => {
                    setGoogleUserInfo({
                        username: response.data.email,
                        name: response.data.name,
                        provider: "google",
                        uri: response.data.id
                    })
                    console.log(googleUserInfo)
                    const { name, provider, uri, username } = googleUserInfo;
                    props.navigation.navigate("NameDOB", { name, provider, uri, username })
                })
                .catch((err) => console.log(err, err.message))
        } else { console.log("no token") }
    }

    useEffect(() => {
        async function fetchFacebookData() {
            if (fbResponse?.type === "success") {
                setFbToken(fbResponse.authentication.accessToken)
                await getFbUserData();
            }
        }
        fetchFacebookData();
    }, [fbResponse])

    async function getFbUserData() {
        if (fbAccessToken) {
            axios.get(`https://graph.facebook.com/me?fields=id,name,email&access_token=${fbAccessToken}`, {
                withCredentials: true
            })
                .then((response) => {
                    setFbUserInfo({
                        username: response.data.email,
                        name: response.data.name,
                        provider: "facebook",
                        uri: response.data.id
                    })
                    console.log(fbUserInfo)
                    const { name, provider, uri, username } = fbUserInfo;
                    props.navigation.navigate("NameDOB", { name, provider, uri, username })
                })
                .catch((err) => console.log(err, err.message))
        } else { console.log("no token") }
    }


    if (Platform.OS === 'android') {
        return (
            <KeyboardAvoidingView style={styles.container} behavior="position" keyboardVerticalOffset={-100}>
                <Image
                    source={require('../../assets/Spot_Me_Logo.png')}
                    style={styles.logo}
                />
                <View style={{ marginVertical: 20 }}>
                    <AntDesign.Button name="google" backgroundColor="#f25c54" style={styles.socialBtn} onPress={() => googlePromptAsync()}
                        disabled={!googleRequest}>Sign up with Google</AntDesign.Button>
                </View>
                <View>
                    <AntDesign.Button name="facebook-square" style={styles.socialBtn} disabled={!fbRequest} onPress={() => fbPromtAsync()}>Sign up with Facebook</AntDesign.Button>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 30 }}>
                    <View style={{ flex: 1, height: 2, backgroundColor: 'black' }} />
                    <View>
                        <Text style={{ width: 50, textAlign: 'center', fontWeight: "bold" }}>OR</Text>
                    </View>
                    <View style={{ flex: 1, height: 2, backgroundColor: 'black' }} />
                </View>
                <Input
                    placeholder="Email" onChangeText={e => setRegisterUsername(e)}
                    keyboardType="email-address">
                </Input>
                <Input
                    secureTextEntry={true}
                    placeholder="Password" onChangeText={e => setRegisterPassword(e)}>
                </Input>
                <RightArrowBtn onPress={goNextForm} style={{ position: 'absolute', bottom: -120, left: width * .7 }} />
                <LeftArrowBtn onPress={() => { props.navigation.goBack() }} style={{ position: 'absolute', bottom: -120, right: width * .7 }} />

            </KeyboardAvoidingView>
        )
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior="position">
            <FormContainer>
                <Image
                    source={require('../../assets/Spot_Me_Logo.png')}
                    style={styles.logo}
                />
                <View style={{ marginVertical: 20 }}>
                    <AntDesign.Button name="google" backgroundColor="#f25c54" style={styles.socialBtn} onPress={() => googlePromptAsync()}
                        disabled={!googleRequest}>Sign up with Google</AntDesign.Button>
                </View>
                <View>
                    <AntDesign.Button name="facebook-square" style={styles.socialBtn} disabled={!fbRequest} onPress={() => fbPromtAsync()}>Sign up with Facebook</AntDesign.Button>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 30 }}>
                    <View style={{ flex: 1, height: 2, backgroundColor: 'black' }} />
                    <View>
                        <Text style={{ width: 50, textAlign: 'center', fontWeight: "bold" }}>OR</Text>
                    </View>
                    <View style={{ flex: 1, height: 2, backgroundColor: 'black' }} />
                </View>
                <Input
                    placeholder="Email" onChangeText={e => setRegisterUsername(e)}
                    keyboardType="email-address">
                </Input>
                <Input
                    secureTextEntry={true}
                    placeholder="Password" onChangeText={e => setRegisterPassword(e)}>
                </Input>
                <RightArrowBtn onPress={goNextForm} style={{ position: 'absolute', bottom: -120, left: 300 }} />
                <LeftArrowBtn onPress={() => { props.navigation.goBack() }} style={{ position: 'absolute', bottom: -120, right: 300 }} />
            </FormContainer>
        </KeyboardAvoidingView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 180,
        height: 180,
        color: "black",
        marginBottom: 150,
        position: "absolute",
        bottom: height * .2,
        alignSelf: 'center'
    },
    socialBtn: {
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 4,
        elevation: 3,
        width: 250
    }
});

export default Register;