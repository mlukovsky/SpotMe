import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Image, Dimensions } from 'react-native';
import BackgroundGif from '../assets/LandingBackground.gif';
import { LandingPageBtn } from '../Shared/Forms/Buttons/LandingPageBtns';

const { height, width } = Dimensions.get("screen")
//First page a user sees when launching the app
const LandingPage = (props) => {

    return (
        <View style={styles.container}>
            <Image style={{ width, height }}
                source={BackgroundGif}
            />
            <Image
                source={require('../assets/Spot_Me_Logo.png')}
                style={styles.logo}
            />
            <View style={styles.buttons}>
                <LandingPageBtn title='Login' onPress={() => props.navigation.navigate('Login')} />
                <LandingPageBtn title='Sign Up' onPress={() => { props.navigation.navigate('Register') }} />
            </View>
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
        width: 200,
        height: 200,
        marginBottom: 100,
        position: "absolute",
        bottom: 220,
        top: 80
    },
    buttons: {
        position: "absolute",
        top: 310
    }
});

export default LandingPage;