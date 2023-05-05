import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Amplify} from 'aws-amplify';
import * as React from 'react';
import {Provider} from 'react-redux';
import amplifyConfiguration from '../amplify.config';
import LoadingComponent from './components/loading.component';
import HomeScreen from './screens/home/home.screen';
import AvatarScreen from './screens/avatar/avatar.screen';
import LoginScreen from './screens/login/login.screen';
import MyDataScreen from './screens/my-data/my-data.screen';
import NicknameScreen from './screens/nickname/nickname.screen';
import RoomScreen from './screens/room/room.screen';
import TopicsToListenScreen from './screens/topics-to-listen/topics-to-listen.screen';
import TopicsToTalkScreen from './screens/topics-to-talk/topics-to-talk.screen';
import {store} from './store/store';
import {BackHandler} from 'react-native';

Amplify.configure(amplifyConfiguration);
const Stack = createNativeStackNavigator();

const App = () => {
  const handleBackButton = () => {
    return true;
  };
  React.useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    };
  }, []);
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Nickname" component={NicknameScreen} />
        <Stack.Screen name="Avatar" component={AvatarScreen} />
        <Stack.Screen name="MyData" component={MyDataScreen} />
        <Stack.Screen name="TopicsToTalk" component={TopicsToTalkScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="TopicsToListen" component={TopicsToListenScreen} />
        <Stack.Screen name="Room" component={RoomScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default () => {
  return (
    <Provider store={store}>
      <App />
      <LoadingComponent />
    </Provider>
  );
};
