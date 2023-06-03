import { React, useEffect, useState } from 'react';
import { LogBox } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import axios from 'axios'
import { SERVER_PORT } from '@env'
import { ActionSheetProvider } from '@expo/react-native-action-sheet';

import RootNavigator from './navigators/RootNavigator';
import { LoginContext, CardStackContext, UserDataContext } from './components/Contexts';

export default function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  let [cardStack, setCardStack] = useState(null);
  const [userData, setUserData] = useState(null)


  LogBox.ignoreAllLogs();

  // if (loggedIn) {
  //   console.log(cardStack)
  // }

  return (
    <LoginContext.Provider value={{ loggedIn, setLoggedIn }}>
      <UserDataContext.Provider value={{ userData, setUserData }}>
        <CardStackContext.Provider value={{ cardStack, setCardStack }}>
          <NavigationContainer theme={DarkTheme}>
            <ActionSheetProvider>
              <RootNavigator></RootNavigator>
            </ActionSheetProvider>
          </NavigationContainer>
        </CardStackContext.Provider>
      </UserDataContext.Provider>
    </LoginContext.Provider>
  )
}
