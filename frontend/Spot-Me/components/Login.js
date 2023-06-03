//Login Page
//....a.a.a.a.a.

import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Dimensions, Image, KeyboardAvoidingView } from 'react-native';
import { FormContainer } from '../Shared/Forms/FormContainer';
import { Input } from '../Shared/Forms/Input'
import axios from 'axios'
import { SERVER_PORT, GOOGLE_CLIENT_ID, FACEBOOK_APP_ID } from '@env'
import { AntDesign } from '@expo/vector-icons'
import { LeftArrowBtn, RightArrowBtn } from '../Shared/Forms/Buttons/ArrowButtons';
import * as Google from 'expo-auth-session/providers/google'
import * as Facebook from 'expo-auth-session/providers/facebook'
import { LoginContext, CardStackContext, UserDataContext } from './Contexts';

const { height, width } = Dimensions.get("screen")

const Login = (props) => {
    const { loggedIn, setLoggedIn } = useContext(LoginContext)
    const { cardStack, setCardStack } = useContext(CardStackContext)
    const { userData, setUserData } = useContext(UserDataContext)
    const [loginUsername, setLoginUsername] = useState('')
    const [loginPassword, setLoginPassword] = useState('')

    let [googleAccessToken, setGoogleToken] = useState("");
    setGoogleToken = (str) => {
        googleAccessToken += str;
    }
    let [googleUserUri, setGoogleUserUri] = useState("");
    setGoogleUserUri = (str) => {
        googleUserUri += str;
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

    let [fbUserUri, setFbUserUri] = useState("");
    setFbUserUri = (str) => {
        fbUserUri += str;
    }

    useEffect(() => {
        async function fetchData() {
            if (googleResponse?.type === "success") {
                setGoogleToken(googleResponse.authentication.accessToken)
                await getGoogleUserData()

            }
        }
        fetchData();
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
                    setGoogleUserUri(response.data.id)
                    console.log(googleUserUri)
                    loginOauth(googleUserUri)
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
                    setFbUserUri(response.data.id)
                    console.log(fbUserUri)
                    loginOauth(fbUserUri)
                })
                .catch((err) => console.log(err, err.message))
        } else { console.log("no token") }
    }

    const loginOauth = async (uri) => {
        await axios({
            url: `${SERVER_PORT}/login/oauth`,
            method: 'post',
            data: {
                uri: uri
            },
            withCredentials: true,

        }).then((response) => {
            console.log(response.data)
            setUserData(response.data)
            setLoggedIn(true)
            getCardStack();
        })
            .catch((error) => console.log(error, error.stack, error.message))
    }



    const loginUser = async () => {
        if (loginUsername && loginPassword) {
            await axios({
                url: `${SERVER_PORT}/login`,
                method: 'post',
                data: {
                    username: loginUsername,
                    password: loginPassword
                },
                withCredentials: true
            }).then((response) => {
                console.log(response.data)
                setUserData(response.data)
                setLoggedIn(true)
                getCardStack();
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


    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior='position'>
                <FormContainer>
                    <Image
                        source={require('../assets/Spot_Me_Logo.png')}
                        style={styles.logo}
                    />
                    <View style={{ marginVertical: 20 }}>
                        <AntDesign.Button name="google" backgroundColor="#f25c54" style={styles.socialBtn} onPress={() => googlePromptAsync()}
                            disabled={!googleRequest}>Log in with Google</AntDesign.Button>
                    </View>
                    <View>
                        <AntDesign.Button name="facebook-square" style={styles.socialBtn} disabled={!fbRequest} onPress={() => fbPromtAsync()}>Log in with Facebook</AntDesign.Button>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 30 }}>
                        <View style={{ flex: 1, height: 2, backgroundColor: 'black' }} />
                        <View>
                            <Text style={{ width: 50, textAlign: 'center', fontWeight: "bold" }}>OR</Text>
                        </View>
                        <View style={{ flex: 1, height: 2, backgroundColor: 'black' }} />
                    </View>
                    <Input
                        placeholder="Email" onChangeText={e => setLoginUsername(e)}
                        keyboardType="email-address">
                    </Input>
                    <Input
                        secureTextEntry={true}
                        placeholder="Password" onChangeText={e => setLoginPassword(e)}>
                    </Input>
                    <RightArrowBtn onPress={loginUser} style={{ position: 'absolute', bottom: -120, left: 300 }} />
                    <LeftArrowBtn onPress={() => { props.navigation.goBack() }} style={{ position: 'absolute', bottom: -120, right: 300 }} />
                </FormContainer>
            </KeyboardAvoidingView>
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

export default Login;