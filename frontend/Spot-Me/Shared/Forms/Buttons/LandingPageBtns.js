import React from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';

export const LandingPageBtn = (props) => {
    const { onPress, title } = props;
    return (
        <View style={styles.container}>
            <Pressable style={styles.button} onPress={onPress}>
                <Text style={styles.text}>{title}</Text>
            </Pressable>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        marginBottom: 8
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        paddingHorizontal: 18,
        borderRadius: 25,
        elevation: 0,
        backgroundColor: "#28282B",
        width: 220,
    },
    text: {
        fontSize: 18,
        lineHeight: 25,
        fontWeight: 'bold',
        letterSpacing: 0.35,
        color: 'white',
    },
});