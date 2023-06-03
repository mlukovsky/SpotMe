//Page where users view their chat rooms
//sdfsfasfafs
import React, { useEffect, useLayoutEffect, useState, useContext } from 'react';
import { View, Text, Pressable, SafeAreaView, FlatList, StyleSheet, } from 'react-native';
import { Feather } from "@expo/vector-icons";
import ChatComponent from './ChatComponent';
import { SERVER_PORT } from '@env'
import { UserDataContext } from './Contexts';
import socket from '../utils/socket';
import axios from 'axios'






const Chat = (props) => {

    const { userData, setUserData } = useContext(UserDataContext)
    let [groupName, setGroupName] = useState("")
    setGroupName = (str) => groupName = str;


    socket.onAny((event, ...args) => {
        console.log(event);
    });

    let [rooms, setRooms] = useState([]);
    const [roomCreated, setRoomCreated] = useState(false)

    useLayoutEffect(() => {
        function fetchGroups() {
            axios.get(`${SERVER_PORT}/getChatRooms`)
                .then((res) => {
                    console.log(res.data)
                    setRooms(res.data)
                    setRoomCreated(!roomCreated)
                })
                .catch((err) => console.error(err));
        }
        fetchGroups();
    }, []);

    useEffect(() => {
        socket.on("connect_error", (e) => {
            console.log(e, e.message);
        });
        socket.on("roomsList", (rooms) => {
            setRooms(rooms);
        });
    }, [socket]);

    useEffect(() => {
        if (props.route.params) {
            if (props.route.params.otherUser) {
                const { otherUser } = props.route.params
                const createRoomWithMatch = () => {
                    setGroupName(`${userData.name} & ${otherUser.name}`)
                    socket.emit("createRoom", groupName, userData._id, otherUser._id)
                }
                createRoomWithMatch();
            }
            else if (props.route.params.newRoomsList) {
                setRooms(props.route.params.newRoomsList)
                setRoomCreated(!roomCreated)
            }
        }
    }, [props.route.params])



    return (
        <SafeAreaView style={styles.chatScreen}>
            <View style={styles.chatTopContainer}>
                <View style={styles.chatHeader}>
                    <Text style={styles.chatHeading}>Chats</Text>


                    {/* <Pressable onPress={() => console.log("Button Pressed!")}>
                        <Feather name='edit' size={24} color='green' />
                    </Pressable> */}
                </View>
            </View>
            <View style={styles.chatListContainer}>
                {rooms.length > 0 ? (
                    <FlatList
                        data={rooms}
                        renderItem={({ item }) => <ChatComponent item={item} onPress={() => props.navigation.navigate("Messaging", { item })} />}
                        keyExtractor={(item) => item._id}
                    />
                ) : (
                    <View style={styles.chatEmptyContainer}>
                        <Text style={styles.chatEmptyText}>No Matches Yet!</Text>
                        <Text>Swipe to get matches!</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        padding: 2,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    usersRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    user: {
        width: 100,
        height: 10,
        margin: 8,
        borderRadius: 50,
        borderWidth: 2,
        padding: 3,
        borderColor: '#202020'
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 50
    },
    chatScreen: {
        backgroundColor: "#202020",
        flex: 1,
        padding: 10,
        position: "relative",
    },
    chatHeading: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
    },
    chatTopContainer: {
        backgroundColor: "#202020",
        height: 70,
        width: "100%",
        padding: 20,
        justifyContent: "center",
        marginBottom: 15,
        elevation: 2,
    },
    chatHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    chatListContainer: {
        paddingHorizontal: 10,

    },
    chatEmptyContainer: {
        width: "100%",
        height: "80%",
        alignItems: "center",
        justifyContent: "center",
    },
    chatEmptyText: { fontWeight: "bold", fontSize: 24, paddingBottom: 30 },
    messagingscreen: {
        flex: 1,
    },

});

export default Chat;