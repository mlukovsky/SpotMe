//Page where users swipe through profile cards
//afhayfafhafajk
import React, { Component } from 'react';
import { View, Text, StyleSheet, Button, Dimensions, Image, Animated, PanResponder, TouchableOpacity, TouchableHighlight } from 'react-native';
import Modal from "react-native-modal"
import axios from 'axios'
import { SERVER_PORT } from '@env'
import { CardStackContext, UserDataContext } from './Contexts';
import socket from '../utils/socket';
import calculateAge from '../utils/CalculateAge';
// For cross-device screen compatibility
const SCREEN_HEIGHT = Dimensions.get('window').height
const SCREEN_WIDTH = Dimensions.get('window').width


export default class Meet extends Component {

    constructor() {
        super()
        this.position = new Animated.ValueXY({ x: 0, y: 0 }, { useNativeDriver: true })
        this.state = {
            currentIndex: 0,
            matchFound: false
        }

        // Animation for cards to tilt to whichever side is being swiped on
        this.rotate = this.position.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            outputRange: ['-15deg', '0deg', '15deg'],
            extrapolate: 'clamp',
        })

        this.rotateAndTranslate = {
            transform: [{
                rotate: this.rotate
            },
            ...this.position.getTranslateTransform()
            ]
        }


        // Hides "SPOT" & "NOPE" SIGNS Until a Certain Threshold
        this.spotOpacity = this.position.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            outputRange: [0, 0, 1],
            extrapolate: 'clamp',
        })

        this.nopeOpacity = this.position.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            outputRange: [1, 0, 0],
            extrapolate: 'clamp',
        })

        this.nextCardOpacity = this.position.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            outputRange: [1, 0, 1],
            extrapolate: 'clamp',
        })
        this.nextCardResize = this.position.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            outputRange: [1, 0.8, 1],
            extrapolate: 'clamp',
        })
    }

    static contextType = CardStackContext;
    componentWillMount() {

        // Animation for swiping
        this.PanResponder = PanResponder.create({

            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onPanResponderMove: (evt, gestureState) => {

                this.position.setValue({ x: gestureState.dx, y: gestureState.dy })
            },
            onPanResponderRelease: (evt, gestureState) => {

                // Throws cards away to the right
                // ***NEEDS TO FIND A WAY TO KEEP TRACK OF USERS SWIPED RIGHT AND LEFT****
                if (gestureState.dx > 120) {
                    Animated.spring(this.position, {
                        toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy },
                        useNativeDriver: true
                    }).start(() => {
                        this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
                            this.position.setValue({ x: 0, y: 0 })
                        })
                        this.handleSwipe(this.context.cardStack[this.state.currentIndex - 1].element, true)
                    })
                }
                // Throws card away away to the left
                else if (gestureState.dx < -120) {
                    Animated.spring(this.position, {
                        toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy },
                        useNativeDriver: true
                    }).start(() => {
                        this.setState({ currentIndex: this.state.currentIndex + 1 }, () => {
                            this.position.setValue({ x: 0, y: 0 })
                        })
                        this.handleSwipe(this.context.cardStack[this.state.currentIndex - 1].element, false)
                    })
                }
                //if swipe distance isn't large enough, return card to middle
                else {
                    Animated.spring(this.position, {
                        toValue: { x: 0, y: 0 },
                        friction: 4,
                        useNativeDriver: true
                    }).start()
                }
            }

        })
    }

    handleSwipe = async (card, isRightSwipe) => {
        await axios({
            url: `${SERVER_PORT}/handleSwipe`,
            method: 'post',
            data: {
                swipedUser: card,
                isRightSwipe
            }
        })
            .then((response) => {
                if (response.data.matched) {
                    this.setState({ matchFound: !this.state.matchFound })
                }
            })
            .catch((err) => console.log(err))
    }

    // Shows users in profile cards by using key value pairs
    renderUsers = () => {
        return this.context.cardStack.map((item, i) => {

            if (i < this.state.currentIndex) {
                return null
            } else if (i == this.state.currentIndex) {

                // Animate current card to be able to be swiped
                return (
                    <TouchableOpacity>
                        {this.state.matchFound &&
                            <UserDataContext.Consumer>
                                {value =>
                                    <View>
                                        <Modal
                                            animationType='slide'
                                            visible={this.state.matchFound}
                                            onRequestClose={() => this.setState({ matchFound: !this.state.matchFound })}
                                        >
                                            <View style={{ alignItems: 'center', flex: 1, backgroundColor: '#202020' }}>
                                                <Text style={{ color: '#f8f9fa', fontSize: 24, fontWeight: 'bold', marginTop: 15 }}>You Matched With {this.context.cardStack[i - 1].element.name}!</Text>
                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: SCREEN_HEIGHT * .1 }}>
                                                    <Image source={{ uri: this.context.cardStack[i - 1].element.images[0].url }} style={{ height: 72, width: 72, borderRadius: 72 * 0.5 }} />
                                                    <Image source={require('../assets/spotmemarker.png')} style={{ height: 72, width: 72, borderRadius: 72 * 0.5 }} />
                                                    <Image source={{ uri: value.userData.images[0].url }} style={{ height: 72, width: 72, borderRadius: 72 * 0.5 }} />
                                                </View>
                                                <Button title="Send them a message" onPress={() => {
                                                    this.setState({ matchFound: !this.state.matchFound })
                                                    this.props.navigation.navigate("Chat", { otherUser: this.context.cardStack[i - 1].element, matched: true })
                                                }}></Button>
                                                <Button title="Dismiss" onPress={() => {
                                                    //NEED TO CREATE CHAT ROOM WHEN MATCH MODAL IS DISMISSED
                                                    socket.emit("createRoom", `${value.userData.name} & ${this.context.cardStack[i - 1].element.name}`,
                                                        value.userData._id, this.context.cardStack[i - 1].element._id);
                                                    this.setState({ matchFound: !this.state.matchFound });
                                                }}></Button>
                                            </View>
                                        </Modal>
                                    </View>
                                }
                            </UserDataContext.Consumer>
                        }
                        <Animated.View
                            {...this.PanResponder.panHandlers}
                            key={item.element._id} style={[this.rotateAndTranslate, { height: SCREEN_HEIGHT * .8, width: SCREEN_WIDTH, padding: 10, position: 'absolute' }]}>


                            {/* User name and age*/}
                            <Animated.View style={{ flexDirection: 'row', position: 'absolute', bottom: 160, left: 35, zIndex: 1000 }}>
                                <TouchableHighlight onPress={() => this.props.navigation.navigate("OtherProfile", { userData: item.element })} underlayColor="rgba(0,0,0,0.0)">
                                    <Text style={{ color: 'white', fontSize: 34, fontFamily: 'Bodoni 72', fontWeight: 'bold' }}> {item.element.name} </Text>
                                </TouchableHighlight>
                                <Text style={{ color: 'white', fontSize: 18, marginTop: 13, fontFamily: 'Bodoni 72', fontWeight: '300' }}> {calculateAge(item.element.dob)}</Text>
                            </Animated.View>
                            <Animated.View style={{ position: 'absolute', bottom: 31, left: 35, zIndex: 1000 }}>
                                {/* <Text style={{ color: 'white', fontSize: 18, fontFamily: 'Bodoni 72', fontWeight: '300' }}> Gym</Text> */}
                                {item.element.gyms.map((gym, index) => {
                                    return (
                                        <Text key={index} style={{ textAlign: 'flex-start', marginTop: 10, color: 'white' }}>{gym.name}
                                            <Text style={{ fontWeight: '200', fontSize: 14 }}> {gym.address}</Text></Text>
                                    )
                                })}
                                <Text style={{ color: 'white', fontSize: 18, fontFamily: 'Bodoni 72', fontWeight: '300' }}> Interests: </Text>
                                <Animated.View style={{ flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'flex-start', SCREEN_WIDTH, marginTop: 10, }}>
                                    {(item.element.methods.slice(0, 5).map((method, index) => {
                                        if (index > 3) {
                                            return (
                                                <View style={{ borderWidth: 1, borderRadius: 20, backgroundColor: '#202020', marginHorizontal: 1.5, justifyContent: 'center' }} key={index}>
                                                    <Text style={{ color: 'white', padding: 10 }}>+ {item.element.methods.length - 4} more...</Text>
                                                </View>
                                            )
                                        }
                                        return (
                                            <View style={{ borderWidth: 1, borderRadius: 20, backgroundColor: '#202020', marginHorizontal: 1.5, justifyContent: 'center' }} key={index}>
                                                <Text style={{ color: 'white', padding: 10 }}>{method}</Text>
                                            </View>
                                        )
                                    }))}
                                </Animated.View>
                            </Animated.View>


                            {/* 'Spot' Text when swiped right */}
                            <Animated.View style={{ opacity: this.spotOpacity, transform: [{ rotate: '30deg' }], position: 'absolute', top: 50, left: 35, zIndex: 1000 }}>
                                <Text style={{ borderWidth: 3, borderColor: 'green', color: 'green', fontSize: 32, fontWeight: '800', padding: 10 }}> SPOT </Text>
                            </Animated.View>

                            {/* 'Nope' Text when swiped right */}
                            <Animated.View style={{ opacity: this.nopeOpacity, transform: [{ rotate: '-30deg' }], position: 'absolute', top: 50, right: 35, zIndex: 1000 }}>
                                <Text style={{ borderWidth: 3, borderColor: 'red', color: 'red', fontSize: 32, fontWeight: '800', padding: 10 }}> NOPE </Text>
                            </Animated.View>


                            <Image
                                style={{ flex: 1, height: null, width: null, resizeMode: 'cover', borderRadius: 20 }}
                                source={{ uri: item.element.images[0].url }}
                            />




                        </Animated.View>
                    </TouchableOpacity>
                )
            } else {
                // The card after current card
                return (
                    <TouchableOpacity>
                        <Animated.View

                            key={item.element._id} style={[{ opacity: this.nextCardOpacity, transform: [{ scale: this.nextCardResize }], height: SCREEN_HEIGHT * .8, width: SCREEN_WIDTH, padding: 10, position: 'absolute' }]}>

                            <Image
                                style={{ flex: 1, height: null, width: null, resizeMode: 'cover', borderRadius: 20 }}
                                source={{ uri: item.element.images[0].url }} />
                            {/* User name and age*/}
                            <Animated.View style={{ flexDirection: 'row', position: 'absolute', bottom: 160, left: 35, zIndex: 1000 }}>
                                <Text style={{ color: 'white', fontSize: 34, fontFamily: 'Bodoni 72', fontWeight: 'bold' }}> {item.element.name} </Text>
                                <Text style={{ color: 'white', fontSize: 18, marginTop: 13, fontFamily: 'Bodoni 72', fontWeight: '300' }}> {calculateAge(item.element.dob)}</Text>
                            </Animated.View>
                            <Animated.View style={{ position: 'absolute', bottom: 31, left: 35, zIndex: 1000 }}>
                                {/* <Text style={{ color: 'white', fontSize: 18, fontFamily: 'Bodoni 72', fontWeight: '300' }}> Gym</Text> */}
                                {item.element.gyms.map((gym, index) => {
                                    return (
                                        <Text key={index} style={{ textAlign: 'flex-start', marginTop: 10, color: 'white' }}>{gym.name}
                                            <Text style={{ fontWeight: '200', fontSize: 14 }}> {gym.address}</Text></Text>
                                    )
                                })}
                                <Text style={{ color: 'white', fontSize: 18, fontFamily: 'Bodoni 72', fontWeight: '300' }}> Interests: </Text>
                                <Animated.View style={{ flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'flex-start', SCREEN_WIDTH, marginTop: 10, }}>
                                    {(item.element.methods.slice(0, 6).map((method, index) => {
                                        if (index > 4) {
                                            return (
                                                <View style={{ borderWidth: 1, borderRadius: 20, backgroundColor: '#202020', marginHorizontal: 1.5, justifyContent: 'center' }} key={index}>
                                                    <Text style={{ color: 'white', padding: 10 }}>+ {item.element.methods.length - 5} more...</Text>
                                                </View>
                                            )
                                        }
                                        return (
                                            <View style={{ borderWidth: 1, borderRadius: 20, backgroundColor: '#202020', marginHorizontal: 1.5, justifyContent: 'center' }} key={index}>
                                                <Text style={{ color: 'white', padding: 10 }}>{method}</Text>
                                            </View>
                                        )
                                    }))}
                                </Animated.View>
                            </Animated.View>


                        </Animated.View>
                    </TouchableOpacity>
                )
            }

        }).reverse()
    }

    render() {
        return (


            <View style={{ flex: 1, top: 20 }}>
                <View style={{ height: 60 }}>

                </View>

                <View style={{ flex: 1 }}>

                    {this.renderUsers()}
                </View>
                <View style={{ height: 60 }}>

                </View>


            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 100,
        position: 'relative',
        bottom: 220,
        alignItems: 'center',
        justifyContent: 'center',
        top: 1
    },
    buttons: {
        position: "absolute",
        top: 310
    }
});
