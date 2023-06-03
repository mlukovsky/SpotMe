import React from "react";
import { Pressable, View } from "react-native";
import { XCircle, SmallXCircle } from "../../Svg";

export const XCircleBtn = (props) => {
    return (
        <Pressable onPress={props.onPress} style={props.style}>
            <View>
                <XCircle />
            </View>
        </Pressable>
    )
}


export const SmallXCircleBtn = (props) => {
    return (
        <Pressable onPress={props.onPress} style={props.style}>
            <View>
                <SmallXCircle />
            </View>
        </Pressable>
    )
}