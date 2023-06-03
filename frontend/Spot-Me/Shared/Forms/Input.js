// Use This With FormContainer To Grab User Input

import React from 'react';
import { View, TextInput, StyleSheet, Dimensions } from 'react-native'

const { width } = Dimensions.get("screen");
export const Input = (props) => {
    return (
        <View style={styles.inputField}>
            <TextInput
                placeholder={props.placeholder}
                name={props.name}
                id={props.id}
                value={props.value}
                autoCorrect={props.autoCorrect}
                onChangeText={props.onChangeText}
                autoFocus={props.autoFocus}
                onFocus={props.onFocus}
                secureTextEntry={props.secureTextEntry}
                multiline={props.multiline}
                numberOfLines={props.numberOfLines}
                keyboardType={props.keyboardType}
                editable={props.editable}
                style={props.style}
            >
            </TextInput>
        </View>
    )
}

const styles = StyleSheet.create({
    inputField: {
        marginTop: 20,
        borderBottomWidth: 2,
        borderColor: 'black',
        padding: 10,
        width: width * .75
    },
})

