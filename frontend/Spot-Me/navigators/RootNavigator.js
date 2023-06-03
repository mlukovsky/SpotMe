// Root Navigator
import React from "react";
import { AntDesign } from '@expo/vector-icons'
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import OnboardingNavigation from "./OnboardingNavigation";
import BottomTabs from "./BottomTabs";
import Messaging from "../components/Messaging";
import OtherProfile from "../components/OtherProfile";

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
    return (
        <Stack.Navigator
        >
            <Stack.Screen
                name="Onboarding"
                component={OnboardingNavigation}
                options={{ headerShown: false }}

            />
            <Stack.Screen
                name="BottomTabs"
                component={BottomTabs}
                options={{ headerShown: false, gestureEnabled: false }}
            />
            <Stack.Screen
                name="Messaging"
                component={Messaging}
                options={({ navigation, route }) => ({
                    headerShown: true,
                    gestureEnabled: false,
                    headerRight: () => (<AntDesign.Button name="deleteuser" style={{ backgroundColor: '#202020' }} size={24} color="white"></AntDesign.Button>)
                })}

            />
            <Stack.Screen
                name="OtherProfile"
                component={OtherProfile}
                options={{
                    headerShown: true,
                    headerStyle: { backgroundColor: '#202020' },
                    headerTitleStyle: { color: 'transparent' },
                    gestureEnabled: false
                }}

            />
        </Stack.Navigator>
    )
}

export default RootNavigator;