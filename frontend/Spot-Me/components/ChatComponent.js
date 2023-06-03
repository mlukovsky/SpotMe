import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import React, { useContext, useLayoutEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { UserDataContext } from "./Contexts";

const ChatComponent = (props) => {
    const { item } = props;
    const [messages, setMessages] = useState({});
    const { userData } = useContext(UserDataContext)
    // Retrieves the last message in the array from the item prop
    useLayoutEffect(() => {
        setMessages(item.messages[item.messages.length - 1]);
    }, []);

    
    //Next line Only works for two-person chats. It shows the 1st profile picture of the other user.
    const chatPicture = item.users.filter(user => user._id !== userData._id)[0].images[0].url
    return (
        <Pressable style={styles.cchat} onPress={props.onPress}>

            <Image source={{ uri: chatPicture }} style={[styles.cavatar, { height: 48, width: 48, borderRadius: 48 * .5 }]} />


            <View style={styles.crightContainer}>
                <View>
                    {item.name.includes(userData.name) ? (
                        item.name.indexOf(userData.name) < item.name.indexOf('&') ? (
                            <Text style={styles.cusername}>{item.name.replace(`${userData.name} & `, "")}</Text>
                        ) :
                            (
                                <Text style={styles.cusername}>{item.name.replace(` & ${userData.name}`, "")}</Text>
                            )
                    ) : (
                        <Text style={styles.cusername}>{item.name}</Text>
                    )}


                    <Text style={styles.cmessage}>
                        {messages?.text ? messages.text : "Tap to start chatting"}
                    </Text>
                </View>
                <View>
                    <Text style={styles.ctime}>
                        {messages?.time ? new Date(messages.time).toLocaleTimeString().split(':').map((val, i) => i === 2 ? val.substring(3, 6) : val).join(':') : "now"}
                    </Text>
                </View>
            </View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    cchat: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 5,
        paddingHorizontal: 15,
        backgroundColor: "#fff",
        height: 80,
        marginBottom: 10,
    },
    cavatar: {
        marginRight: 15,
    },
    cusername: {
        fontSize: 18,
        marginBottom: 5,
        fontWeight: "bold",
    },
    cmessage: {
        fontSize: 14,
        opacity: 0.7,
    },
    crightContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        flex: 1,
    },
    ctime: {
        opacity: 0.5,
    },
});

export default ChatComponent;