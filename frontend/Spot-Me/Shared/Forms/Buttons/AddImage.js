import React from 'react';
import { Image, StyleSheet, TouchableOpacity, Text } from 'react-native'


const AddImage = ({
    title,
    buttonColor,
    titleColor,
    buttonStyle,
    textStyle,
    imageSource,
    deleteButton,
    onPress,
    disabled
}) => {


    return (
        <TouchableOpacity
            style={{
                ...styles.container,
                ...buttonStyle,
                backgroundColor: buttonColor || '#512DA8',
            }}
            onPress={onPress}>
            {/* aspectRatio for Mitchell: .8 & Dennies: .66 */}
            {imageSource ? <Image source={imageSource} style={{ width: '100%', height: '100%', aspectRatio: 0.66, borderRadius: 10 }} />
                :
                <Text
                    style={{ ...styles.title, ...textStyle, color: titleColor || '#fff' }}>
                    {title}
                </Text>
            }
            {disabled && deleteButton}
        </TouchableOpacity>
    );
};

export default AddImage;

const styles = StyleSheet.create({
    container: {
        marginTop: 50,
        backgroundColor: '#512DA8',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 16,
    },
});