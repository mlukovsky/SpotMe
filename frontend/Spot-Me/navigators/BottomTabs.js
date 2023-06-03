import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { FontAwesome, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"
import Meet from "../components/Meet";
import Schedule from "../components/Schedule";

import Chat from "../components/Chat";
import Profile from "../components/Profile";
import EditProfile from "../components/EditProfile"
import OtherProfile from "../components/OtherProfile";
import Messaging from "../components/Messaging";

const Tab = createBottomTabNavigator();

const BottomTabs = () => {
    return (
        <Tab.Navigator
            initialRouteName="Profile"
            backBehavior="history"
            screenOptions={{
                "tabBarHideOnKeyboard": true,
                "tabBarShowLabel": false,
                "tabBarStyle": [
                    {
                        "display": "flex"
                    },
                    null
                ]
            }}
        >
            <Tab.Screen name="Meet" component={Meet} options={
                {
                    headerShown: false,
                    tabBarIcon: (tabInfo) => (
                        <MaterialCommunityIcons name="dumbbell" size={28} color={tabInfo.focused ? "#A09F9A" : "#7e7d77"} />
                    )
                }}

            />
            <Tab.Screen name="Schedule" component={Schedule} options={
                {
                    headerShown: false,
                    tabBarIcon: (tabInfo) => (
                        <FontAwesome name="calendar" size={26} color={tabInfo.focused ? "#A09F9A" : "#7e7d77"} />
                    )
                }}
            />
            <Tab.Screen name="Chat" component={Chat} options={
                {
                    headerShown: false,
                    tabBarIcon: (tabInfo) => (
                        <Ionicons name="chatbubble-ellipses" size={32} color={tabInfo.focused ? "#A09F9A" : "#7e7d77"} />
                    )
                }}

            />
            <Tab.Screen name="Profile" component={Profile} options={
                {
                    headerShown: false,
                    tabBarIcon: (tabInfo) => (
                        <Ionicons name="person-circle" size={34} color={tabInfo.focused ? "#A09F9A" : "#7e7d77"} />
                    )
                }}

            />
            <Tab.Screen name="Edit Profile" component={EditProfile} options={
                {
                    headerShown: true,
                    tabBarButton: () => null
                }}
            />
            {/* <Tab.Screen name="OtherProfile" component={OtherProfile} options={
                {
                    headerShown: false,
                    tabBarButton: () => null
                }}
            /> */}
            {/* <Tab.Screen name="Messaging" component={Messaging} options={
                {
                    headerShown: true,
                    tabBarButton: () => null,
                    tabBarHideOnKeyboard: false,
                    tabBarStyle: { display: 'none' },
                }}
                
            /> */}
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    shadow: {
        shadowColor: '#7F5DF0',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.5,
        elevation: 5
    }
});

export default BottomTabs;

