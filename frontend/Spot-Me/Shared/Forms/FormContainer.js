// Shared Form Container To Use When Asking User Info
import React from "react";
import { ScrollView, Dimensions, StyleSheet, Text } from "react-native";

const { width, height } = Dimensions.get('window');

export const FormContainer = (props) => {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{props.title}</Text>
            {props.children}
        </ScrollView>

    )
}


const styles = StyleSheet.create({
    container: {
        marginVertical: height / 4,
        width: width,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 30,
    }
})

