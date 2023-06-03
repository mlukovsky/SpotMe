// Fourth step of registration process
import { React, useState } from 'react';
import { View, Text, StyleSheet, Button, Dimensions, DevSettings, KeyboardAvoidingView } from 'react-native';

import { LeftArrowBtn, RightArrowBtn } from '../../Shared/Forms/Buttons/ArrowButtons';
import SelectBox from 'react-native-multi-selectbox'
import { xorBy } from 'lodash'

import { EXP_LVL, METHODS } from '../../Shared/UserDataEnums';




const { width } = Dimensions.get("screen")

const ExperienceLvlMethods = (props) => {

    const [userExp, setRegisterExpLevel] = useState("");
    const [methodsSelected, setRegisterMethods] = useState([]);

    const { username, password, name, dob, bio, provider, uri } = props.route.params


    const goNextForm = () => {
        if (userExp && methodsSelected) {
            const expLevel = userExp.item
            const methods = methodsSelected.map(method => method.item)
            props.navigation.navigate('Photos', {
                username: username, password: password, name: name, dob: dob, bio: bio, expLevel: expLevel, methods: methods,
                provider: provider || undefined, uri: uri || undefined
            })
        }
    }

    return (
        <View style={styles.container}>
            <Text style={{ fontSize: 24, paddingBottom: 10, textAlign: 'center', fontFamily: 'Thonburi' }}>How experienced are you?</Text>
            <View style={{ marginBottom: 15, marginTop: 7, marginHorizontal: 15 }}>
                <SelectBox
                    label="Select your level"
                    options={EXP_LVL}
                    value={userExp}
                    onChange={onChange()}
                    hideInputFilter={false}
                    labelStyle={{ textAlign: 'center', fontSize: 16 }}
                    arrowIconColor='black'
                />
            </View>
            <View style={{ height: 40 }} />
            <Text style={{ fontSize: 24, paddingBottom: 10, textAlign: 'center', fontFamily: 'Thonburi' }}>
                Which of the following do you enjoy?</Text>
            <KeyboardAvoidingView style={{ marginBottom: 15, marginTop: 7, marginHorizontal: 15 }} behavior="position">
                <SelectBox
                    label="Select multiple passions"
                    options={METHODS}
                    selectedValues={methodsSelected}
                    onMultiSelect={onMultiChange()}
                    onTapClose={onMultiChange()}
                    isMulti
                    labelStyle={{ textAlign: 'center', fontSize: 16 }}
                    arrowIconColor='black'
                    toggleIconColor='black'
                    searchIconColor='black'

                />
            </KeyboardAvoidingView>
            <RightArrowBtn onPress={goNextForm} style={{ position: 'absolute', bottom: 40, right: 30 }} />
            <LeftArrowBtn onPress={() => { props.navigation.goBack() }} style={{ position: 'absolute', bottom: 40, left: 30 }} />
        </View>
    )

    function onMultiChange() {
        return (item) => setRegisterMethods(xorBy(methodsSelected, [item], 'id'))
    }

    function onChange() {
        return (val) => setRegisterExpLevel(val)
    }



}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'stretch',
        justifyContent: 'center',
    }
})

export default ExperienceLvlMethods;