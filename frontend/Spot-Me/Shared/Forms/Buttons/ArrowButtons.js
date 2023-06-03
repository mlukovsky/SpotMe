import React from "react";
import { Pressable, View } from "react-native";
import { RightArrow, LeftArrow } from "../../Svg";

export const RightArrowBtn = (props) => {
    return (
        <Pressable onPress={props.onPress} style={props.style}>
            <View>
                <RightArrow />
            </View>
        </Pressable>
    )
}


export const LeftArrowBtn = (props) => {
    return (
        <Pressable onPress={props.onPress} style={props.style}>
            <View>
                <LeftArrow />
            </View>
        </Pressable>
    )
}
