//2nd step of registration process

import { React, useState } from 'react';
import { View, Text, StyleSheet, Button, Dimensions, Image, Platform, KeyboardAvoidingView } from 'react-native';

import { FormContainer } from '../../Shared/Forms/FormContainer';
import { Input } from '../../Shared/Forms/Input'
import { LeftArrowBtn, RightArrowBtn } from '../../Shared/Forms/Buttons/ArrowButtons';
import RNDateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
const { height, width } = Dimensions.get('window')

const NameDOB = (props) => {

    



    const { username, password, name, provider, uri } = props.route.params

    const [registerName, setRegisterName] = useState(name)
    const [registerDOB, setRegisterDOB] = useState(null)
    const setDate = (event, date) => {
        if (event.type === 'set' || event.type === 'dismissed') {
            setRegisterDOB(date)
        }
    }


    const goNextForm = () => {
        if (registerName && registerDOB) {
            const dob = registerDOB.toISOString().substring(0, 10)
            props.navigation.navigate('Bio', { username: username, password: password, name: registerName, dob: dob, provider: provider || undefined, uri: uri || undefined })
        }
    }

    if (Platform.OS === 'android') {
        return (
            <KeyboardAvoidingView style={styles.container} behavior='position' keyboardVerticalOffset={height * .5 * -1}>
                <Image
                    source={require('../../assets/Spot_Me_Logo.png')}
                    style={styles.logo}
                />
                <View style={{
                    marginTop: 60, alignItems:
                        'center'
                }}>
                    <Input
                        placeholder="Name" value={registerName} onChangeText={e => setRegisterName(e)}>
                    </Input>
                    <Text style={{ marginTop: 30, fontSize: 17.5 }}>Date of Birth</Text>
                    {registerDOB &&
                        <View>
                            <Text>{registerDOB.toString().substr(registerDOB.toString().indexOf(' '), 12)}</Text>
                            <Button title='Select Date' onPress={() => DateTimePickerAndroid.open({
                                display: 'default', value: new Date(2008, 11, 31)
                                , minimumDate: new Date(1930, 0, 1), maximumDate: new Date(2008, 11, 31), onChange: (event, date) => setDate(event, date)
                            })}></Button>
                        </View>
                    }
                    {!registerDOB &&
                        <View>
                            <RNDateTimePicker
                                value={new Date(2008, 11, 31)} minimumDate={new Date(1930, 0, 1)} maximumDate={new Date(2008, 11, 31)} display="default"
                                onChange={(event, date) => setDate(event, date)} style={styles.datePicker}
                            />
                        </View>
                    }
                    <RightArrowBtn onPress={goNextForm} style={{ position: 'absolute', bottom: -120, left: 300 }} />
                    <LeftArrowBtn onPress={() => { props.navigation.goBack() }} style={{ position: 'absolute', bottom: -120, right: 300 }} />
                </View>
            </KeyboardAvoidingView >
        )
    }
    return (
        <View style={styles.container}>
            <FormContainer>
                <Image
                    source={require('../../assets/Spot_Me_Logo.png')}
                    style={styles.logo}
                />
                <Input
                    placeholder="Name" value={registerName} onChangeText={e => setRegisterName(e)}>
                </Input>
                <Text style={{ marginTop: 30, fontSize: 17.5 }}>Date of Birth</Text>
                <View style={styles.datePicker}>
                    <RNDateTimePicker
                        value={registerDOB || new Date(2008, 11, 31)} minimumDate={new Date(1930, 0, 1)} maximumDate={new Date(2008, 11, 31)} display="spinner"
                        onChange={(event, date) => setDate(event, date)}
                    />
                </View>
                <RightArrowBtn onPress={goNextForm} style={{ position: 'absolute', bottom: -120, left: 300 }} />
                <LeftArrowBtn onPress={() => { props.navigation.goBack() }} style={{ position: 'absolute', bottom: -120, right: 300 }} />
            </FormContainer>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    datePicker: {
        backgroundColor: '#fff',
        width: width,
        justifyContent: 'center'
    },
    logo: {
        width: 180,
        height: 180,
        color: "black",
        marginBottom: height * .25 * -1,
        position: "absolute",
        bottom: height * .725,
        alignSelf: 'center'
    }
});

export default NameDOB;