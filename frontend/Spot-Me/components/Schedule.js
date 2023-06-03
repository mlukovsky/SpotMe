//Page where users can schedule events, view events, and respond to requests
//asjasfhakhfsakjhf
import React, { useEffect, useState, useContext, } from 'react';
import { View, Text, StyleSheet, Button, Dimensions, SafeAreaView, FlatList, ImageBackground, TouchableWithoutFeedback, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import axios from 'axios';
import { SERVER_PORT } from '@env';
import { UserDataContext } from './Contexts';
import Modal from 'react-native-modal'
const WIDTH = Dimensions.get("window").width;
const HEIGHT = Dimensions.get("window").height;
import { Input } from '../Shared/Forms/Input';
import { LeftArrowBtn, RightArrowBtn } from '../Shared/Forms/Buttons/ArrowButtons';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import SelectBox from 'react-native-multi-selectbox'
import { xorBy } from 'lodash'



const Schedule = (props) => {

    const { userData, setUserData } = useContext(UserDataContext)
    let [selectedDate, setDate] = useState(new Date())
    const [modalVisible, setModalVisible] = useState(false);
    const [requestModalVisible, setRequestModalVisible] = useState(false);
    const [eventModalVisible, setEventModalVisibile] = useState(false);
    const [eventTime, setEventTime] = useState(new Date())
    const [matches, setMatches] = useState([])
    const [sessions, setSessions] = useState([])
    const [recipients, setRecipients] = useState([])
    const [requests, setRequests] = useState([])
    let [confirmedEvents, setConfirmedEvents] = useState({})
    const [location, setLocation] = useState("")
    const [description, setDescription] = useState("")
    const [requestIndex, setRequestIndex] = useState(0)
    const setTime = (event, date) => {
        if (event.type === 'set' || event.type === 'dismissed') {
            setEventTime(date)
        }
    }
    let selectedDateCopy = new Date();

    setConfirmedEvents = (events) => {
        const obj = events.reduce((c, v) => Object.assign(c, { [v.date.substr(0, 10)]: { marked: true, dotColor: 'purple' } }), {})
        confirmedEvents = obj;
        console.log(confirmedEvents)
    }

    const Requests = [
        {
            id: 1,
            location: 'Blink',
            date: new Date('2022/12/14'),
            image: require('../assets/1.jpg'),
            what: 'Leg Day',
            sender: 'Chris'
        },
        {
            id: 2,
            location: 'Blink',
            date: new Date('2022/12/14'),
            image: require('../assets/2.jpg'),
            what: 'Leg Day',
            sender: 'Greg'
        },
        {
            id: 3,
            location: 'Blink',
            date: new Date('2022/12/14'),
            image: require('../assets/3.jpg'),
            what: 'Leg Day',
            sender: 'Chris'
        },
        {
            id: 4,
            location: 'Blink',
            date: new Date('2022/12/14'),
            image: require('../assets/4.jpg'),
            what: 'Leg Day',
            sender: 'Greg'
        },
    ]

    function onMultiChange() {
        return (item) => { setRecipients(xorBy(recipients, [item], 'id')); console.log(recipients) }
    }


    const _renderRequests = ({ item, index }) => {
        return (

            <View style={{
                marginLeft: index === 0 ? 30 : 20,
                marginRight: index === requests.length - 1 ? 30 : 0
            }}>
                <TouchableWithoutFeedback
                    onPress={() => {
                        setRequestModalVisible(true)
                        setRequestIndex(index)
                    }}
                >
                    <ImageBackground source={{ uri: item.sender.images[0].url }}
                        resizeMode='cover'
                        borderRadius={20}
                        style={{
                            width: WIDTH / 3,
                            height: HEIGHT * .22,
                            justifyContent: 'space-between'
                        }}
                    >
                        <View style={{

                            marginHorizontal: 10,
                            marginVertical: 10,
                        }}>

                            <View style={styles.dateBox}>
                                <Text style={{ alignContent: 'center', justifyContent: 'center', fontSize: 18, }}>{new Date(item.date).getDate()}</Text>
                                <Text style={{ alignContent: 'center', justifyContent: 'center', textTransform: 'uppercase', fontWeight: 'bold', fontSize: 10, }}>{new Date(item.date).toDateString().substr(4, 3)}</Text>


                            </View>
                        </View>


                        <View style={{
                            marginLeft: 10,
                            marginBottom: 15,
                        }}>
                            <Text style={{ color: 'white', opacity: .85, fontSize: 8, }}>{item.location} </Text>
                            <Text style={{ color: 'white', textTransform: 'uppercase', fontWeight: 'bold', fontSize: 12, }}>{item.sender.name} </Text>

                        </View>

                    </ImageBackground>

                </TouchableWithoutFeedback>

            </View>
        )
    }

    useEffect(() => {
        async function fetchData() {
            await axios({
                url: `${SERVER_PORT}/getMatchesData`
            })
                .then((res) => { console.log(res.data); setMatches(res.data) })
                .catch((err) => console.log(err))
        }
        fetchData();
    }, [])

    useEffect(() => {
        async function fetchData() {
            await axios({
                url: `${SERVER_PORT}/getEvents`
            })
                .then((res) => {
                    console.log(res.data); setRequests(res.data.requests)
                    setConfirmedEvents(res.data.confirmedEvents)
                })
                .catch((err) => console.log(err))
        }
        fetchData();
    }, [matches])

    useEffect(() => {
        selectedDateCopy = selectedDate
    }, [selectedDate])

    const submitEventForm = async () => {
        await axios({
            url: `${SERVER_PORT}/sendGymRequest`,
            method: 'post',
            data: {
                date: selectedDate,
                time: eventTime,
                recipients,
                location,
                description
            }
        })
            .then((res) => {
                console.log(res.data)
                setUserData(res.data)
            })
            .catch((err) => console.log(err))
    }

    const handleRequest = async (accepted) => {
        await axios({
            url: `${SERVER_PORT}/handleRequest`,
            method: 'post',
            data: {
                accepted,
                eventRequest: requests[requestIndex]
            }
        })
            .then(console.log('success'))
            .catch((err) => console.log(err))

    }

    return (
        <View style={styles.container}>
            <View style={{ marginTop: 20, flex: 1, justifyContent: 'flex-start' }}>
                <Text style={{ marginTop: 20, fontSize: 26, fontFamily: 'Bodoni 72', color: 'white', textAlign: 'center' }}>Workout Requests</Text>
            </View>



            <View style={{
                marginBottom: 8, alignItems: 'center',
            }}>
                {requests.length > 0 ? (
                    <FlatList
                        horizontal
                        keyExtractor={(item) => item.id}
                        // data={Requests}
                        // renderItem={_renderRequests}
                        data={requests}
                        renderItem={_renderRequests}
                        showsHorizontalScrollIndicator={false}

                    ></FlatList>
                ) :
                    (
                        <Text style={{ color: 'white', marginBottom: HEIGHT * .1 }}>You don't have any requests.</Text>
                    )}

            </View>
            {requests.length > 0 &&
                <View>
                    <Modal
                        isVisible={requestModalVisible}
                    >
                        <View style={{
                            //flex:1,
                            borderRadius: 20,
                            justifyContent: 'center',
                            alignItems: 'center',
                            //backgroundColor: 'black'
                        }}>
                            <ImageBackground
                                resizeMode='cover'
                                borderRadius={25}
                                source={{ uri: requests[requestIndex].sender.images[0].url }}
                                style={{
                                    width: WIDTH,
                                    height: HEIGHT * .66,
                                    borderRadius: 20,
                                }}

                            >
                                <View style={{ flex: 1, justifyContent: 'center' }}>

                                    {/* <View style={styles.modalHeader}> */}
                                    <View style={{
                                        marginHorizontal: 15,
                                        marginVertical: 15,
                                    }}>
                                        <View style={styles.modalDateBox}>
                                            <Text style={{ alignContent: 'center', justifyContent: 'center', fontSize: 36, }}>{new Date(requests[requestIndex].date).getDate()}</Text>
                                            <Text style={{ alignContent: 'center', justifyContent: 'center', textTransform: 'uppercase', fontWeight: 'bold', fontSize: 20, }}>{new Date(requests[requestIndex].date).toDateString().substr(4, 3)}</Text>
                                        </View>
                                    </View>
                                    {/* </View> */}


                                    <View style={styles.modalGradient}>
                                        <LinearGradient
                                            colors={['transparent', '#000']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                            style={{
                                                width: '100%',
                                                height: HEIGHT * .9,
                                                justifyContent: 'flex-end'
                                            }}
                                        >

                                            <View style={styles.modalInfo}>

                                                <Text style={{ color: 'white', fontSize: 24, textTransform: 'uppercase' }}>{requests[requestIndex].sender.name}</Text>
                                                <Text style={{ color: 'white', opacity: .5, letterSpacing: 2, fontSize: 16 }}>{requests[requestIndex].description}</Text>

                                                <Text style={{ color: 'white', opacity: .5, letterSpacing: 2, fontSize: 16 }}>{requests[requestIndex].location}</Text>
                                                <Text style={{ color: 'white', opacity: .5, letterSpacing: 2, fontSize: 16 }}>{new Date(requests[requestIndex].date).toLocaleTimeString().split(':').map((val, i) => i === 2 ? val.substring(3, 6) : val).join(':')}</Text>

                                                {/* <View style={styles.dateBox}>
                                                <Text style={{ alignContent: 'center', justifyContent: 'center', fontSize: 18, }}>{Requests[0].date.getDate()}</Text>
                                                <Text style={{ alignContent: 'center', justifyContent: 'center', textTransform: 'uppercase', fontWeight: 'bold', fontSize: 10, }}>{Requests[0].date.toDateString().substr(4, 3)}</Text>
                                            </View> */}
                                            </View>

                                            <View style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-evenly',
                                                marginBottom: 10,
                                            }}>
                                                <TouchableOpacity
                                                    style={{
                                                        width: 75,
                                                        height: 35,
                                                        borderRadius: 10,
                                                        justifyContent: 'center',
                                                        backgroundColor: 'white',
                                                        alignItems: 'center'
                                                    }}
                                                    onPress={() => { handleRequest(false), setRequestModalVisible(false) }}
                                                >
                                                    <Text style={{ color: 'black' }}>DECLINE</Text>
                                                </TouchableOpacity>

                                                <TouchableOpacity
                                                    style={{
                                                        width: 75,
                                                        height: 35,
                                                        borderRadius: 10,
                                                        justifyContent: 'center',
                                                        backgroundColor: 'white',
                                                        alignItems: 'center'
                                                    }}
                                                    onPress={() => { handleRequest(true), setRequestModalVisible(false) }}
                                                >
                                                    <Text style={{ color: 'black' }}>ACCEPT</Text>
                                                </TouchableOpacity>
                                            </View>


                                        </LinearGradient>
                                    </View>



                                </View>


                            </ImageBackground>

                            {/* <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            
                        }}>
                            <TouchableOpacity
                                style={{
                                    width: 75,
                                    height: 35,
                                    borderRadius: 10,
                                    justifyContent: 'center',
                                    backgroundColor: 'white',
                                    alignItems: 'center'
                                }}
                            //onPress={()}
                            >
                                <Text style={{ color: 'black' }}>DECLINE</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={{
                                    width: 75,
                                    height: 35,
                                    borderRadius: 10,
                                    justifyContent: 'center',
                                    backgroundColor: 'white',
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{ color: 'black' }}>ACCEPT</Text>
                            </TouchableOpacity>
                        </View> */}


                            <Button title="Dismiss" onPress={() => setRequestModalVisible(false)}></Button>
                        </View>
                    </Modal>

                </View>
            }
            <View>
                <Modal
                    isVisible={modalVisible}
                >
                    <SafeAreaView style={{ alignItems: 'center', flex: .85, backgroundColor: '#202020', borderRadius: 30 }}>
                        <Text style={{ color: '#f8f9fa', fontSize: 24, fontWeight: 'bold', marginTop: 15 }}>Schedule Event</Text>
                        <Text style={{ color: 'white', alignSelf: 'flex-start', marginLeft: 5, marginTop: 30, fontWeight: 'bold' }}>When</Text>
                        <Input value={`${new Date(selectedDateCopy.setDate(selectedDate.getDate() + 1)).toDateString()} 
                   ${eventTime.toLocaleTimeString().split(':').map((val, i) => i === 2 ? val.substring(3, 6) : val).join(':')}`}
                            style={{ color: 'white', marginTop: -10 }}></Input>
                        <RNDateTimePicker mode='time' value={new Date()} style={{ backgroundColor: '#fff', width: WIDTH * .4, justifyContent: 'center', marginTop: 10 }}
                            onChange={(event, date) => setTime(event, date)} />
                        {matches.length > 0 &&
                            (
                                <SelectBox
                                    label="Who's Coming?"
                                    options={matches.map(m => ({ item: m.name, id: m._id }))}
                                    selectedValues={recipients}
                                    onMultiSelect={onMultiChange()}
                                    onTapClose={onMultiChange()}
                                    isMulti
                                    labelStyle={{ fontSize: 16, color: 'white', marginTop: 20, marginLeft: 5, textAlign: 'left' }}
                                    optionsLabelStyle={{ color: 'white' }}
                                    arrowIconColor='black'
                                    toggleIconColor='black'
                                    searchIconColor='black'
                                />
                            )
                        }
                        <Text style={{ color: 'white', alignSelf: 'flex-start', marginLeft: 5, marginTop: 30, fontWeight: 'bold' }}>Where</Text>
                        <Input style={{ color: 'white', marginTop: -10 }} onChangeText={e => setLocation(e)}></Input>
                        <Text style={{ color: 'white', alignSelf: 'flex-start', marginLeft: 5, marginTop: 30, fontWeight: 'bold' }}>Event Description</Text>
                        <Input style={{ color: 'white', marginTop: -10 }} onChangeText={e => setDescription(e)}></Input>
                        <Button title="Confirm" onPress={submitEventForm}></Button>
                        <Button title="Dismiss" onPress={() => { setModalVisible(false); setEventTime(new Date()) }}></Button>
                    </SafeAreaView>
                </Modal>
            </View>

            <View>
                <Modal
                    isVisible={eventModalVisible}
                >
                    <SafeAreaView style={{ alignItems: 'center', flex: .75, backgroundColor: '#202020', overflow: 'hidden', borderRadius: 20 }}>
                        <Text style={{ color: 'white', fontSize: 24, textTransform: 'uppercase', letterSpacing: 2 }}>WORKOUT SCHEDULED ON DATE</Text>
                        <View style={{ flexDirection: 'column', }}>
                            <Text style={{ color: 'white', fontSize: 18, textTransform: 'uppercase', letterSpacing: 2 }}>WITH: </Text>
                            <Text style={{ color: 'white', fontSize: 18, textTransform: 'uppercase', letterSpacing: 2 }}>USER </Text>
                        </View>
                        <View style={{ flexDirection: 'column', }}>
                            <Text style={{ color: 'white', fontSize: 18, textTransform: 'uppercase', letterSpacing: 2 }}>WHERE: </Text>
                            <Text style={{ color: 'white', fontSize: 18, textTransform: 'uppercase', letterSpacing: 2 }}>LOCATION </Text>
                        </View>
                        <View style={{ flexDirection: 'column', }}>
                            <Text style={{ color: 'white', fontSize: 18, textTransform: 'uppercase', letterSpacing: 2 }}>TIME: </Text>
                            <Text style={{ color: 'white', fontSize: 18, textTransform: 'uppercase', letterSpacing: 2 }}>TIME</Text>
                        </View>
                    </SafeAreaView>

                </Modal>
            </View>

            <Calendar
                // Specify style for calendar container element. Default = {}
                style={{
                    borderWidth: 5,
                    borderColor: 'gray',
                    height: HEIGHT * .58,
                    width: WIDTH * .95,
                    marginBottom: 0,
                    backgroundColor: '#fff',
                    alignSelf: 'center',
                    marginBottom: 5,
                }}
                // Specify theme properties to override specific styles for calendar parts. Default = {}
                theme={{
                    backgroundColor: 'black',
                    calendarBackground: 'black',
                    textSectionTitleColor: '#b6c1cd',
                    textSectionTitleDisabledColor: '#d9e1e8',
                    selectedDayBackgroundColor: '#00adf5',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: '#00adf5',
                    dayTextColor: '#2d4150',
                    textDisabledColor: '#d9e1e8',
                    dotColor: '#00adf5',
                    selectedDotColor: '#ffffff',
                    arrowColor: 'orange',
                    disabledArrowColor: '#d9e1e8',
                    monthTextColor: 'black',
                    indicatorColor: 'red',
                    // textDayFontFamily: 'monospace',
                    // textMonthFontFamily: 'monospace',
                    // textDayHeaderFontFamily: 'monospace',
                    textDayFontWeight: '300',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: '300',
                    textDayFontSize: 16,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 16
                }}
                onDayPress={day => { setDate(new Date(day.dateString)); console.log(selectedDate); setModalVisible(true) }}
                markedDates={
                    confirmedEvents
                }
            />

        </View>

    )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#202020',
    },
    dateBox: {
        width: 35,
        height: 35,
        borderRadius: 5,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalDateBox: {
        width: 70,
        height: 70,
        borderRadius: 10,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 15,

    },
    modalGradient: {
        flex: 1,
        justifyContent: 'flex-end',
        position: 'relative',
        zindex: '-1',

    },
    modalInfo: {
        marginBottom: 25,
        flexDirection: '',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        alignContent: 'center'
    }



});

export default Schedule;