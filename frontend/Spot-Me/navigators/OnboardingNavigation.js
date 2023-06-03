import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"

import LandingPage from "../components/LandingPage"
import Register from "../components/Registration/UsernamePassword"
import NameDOB from "../components/Registration/NameDOB"
import Bio from "../components/Registration/Bio"
import ExperienceLvlMethods from "../components/Registration/ExperienceLvlMethods"
import Login from "../components/Login"
import Photos from "../components/Registration/Photos"
import ChooseGym from "../components/Registration/ChooseGym"

const Stack = createNativeStackNavigator();



function OnboardingStack() {
    return (
        <Stack.Navigator initialRouteName="Landing">
            <Stack.Screen
                name="Landing"
                component={LandingPage}
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="Login"
                component={Login}
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="Register"
                component={Register}
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="NameDOB"
                component={NameDOB}
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="Bio"
                component={Bio}
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="ExperienceLvlMethods"
                component={ExperienceLvlMethods}
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="Photos"
                component={Photos}
                options={{
                    headerShown: false
                }}
            />
            <Stack.Screen
                name="ChooseGym"
                component={ChooseGym}
                options={{
                    headerShown: false
                }}
            />
        </Stack.Navigator>
    )
}

export default function OnboardingNavigation() {
    return <OnboardingStack />
}