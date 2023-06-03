import { View, Text, StyleSheet, Image, TouchableHighlight } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

export default function MessageComponent(props) {
    const { item, user, navigation } = props;
    //STATUS IS TRUE IF THE MESSAGE WAS NOT SENT BY THE CURRENT USER
    const status = item.author.username !== user.username;


    return (
        //other user has their image to the left of their messages, current user has their image to the right of their messages
        <View>
            {status ? (
                <View
                    style={styles.mmessageWrapper}
                >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <TouchableHighlight onPress={() => navigation.navigate("OtherProfile", { userData: item.author })} underlayColor="rgba(0,0,0,0.0)">
                            <Image source={{ uri: item.author.images[0].url }} style={{ height: 40, width: 40, borderRadius: 40 * 0.5, marginRight: 5 }} />
                        </TouchableHighlight>
                        <View
                            style={
                                status
                                    ? styles.mmessage
                                    : [styles.mmessage, { backgroundColor: "rgb(194, 243, 194)" }]
                            }
                        >
                            <Text>{item.text}</Text>
                        </View>
                    </View>
                    <Text style={{ marginLeft: 40, color: 'white' }}>{new Date(item.time).toLocaleTimeString().split(':').map((val, i) => i === 2 ? val.substring(3, 6) : val).join(':')}</Text>
                </View>
            ) : (
                <View
                    style={[styles.mmessageWrapper, { alignItems: "flex-end" }]}
                >
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <View
                            style={
                                status
                                    ? styles.mmessage
                                    : [styles.mmessage, { backgroundColor: "rgb(194, 243, 194)" }]
                            }
                        >
                            <Text>{item.text}</Text>
                        </View>
                        <TouchableHighlight onPress={() => navigation.navigate("Profile")} underlayColor="rgba(0,0,0,0.0)">
                            <Image source={{ uri: item.author.images[0].url }} style={{ height: 40, width: 40, borderRadius: 40 * 0.5, marginLeft: 5 }} />
                        </TouchableHighlight>
                    </View>
                    <Text style={{ marginRight: 40, color: 'white' }}>{new Date(item.time).toLocaleTimeString().split(':').map((val, i) => i === 2 ? val.substring(3, 6) : val).join(':')}</Text>
                </View>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    mmessageWrapper: {
        width: "100%",
        alignItems: "flex-start",
        marginBottom: 15,
    },
    mmessage: {
        maxWidth: "50%",
        backgroundColor: "#f5ccc2",
        padding: 15,
        borderRadius: 10,
        marginBottom: 2,
    },
    mavatar: {
        marginRight: 5
    }
})