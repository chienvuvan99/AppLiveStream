// In App.js in a new project

import * as React from 'react';
import {View, Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LiveStream from './src/LiveStream';
import PlayLiveStream from './src/PlayLiveStream';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="LiveStream" component={LiveStream} />
        <Stack.Screen name="PlayLiveStream" component={PlayLiveStream} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
