import React, { useState, createContext, useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Button, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from './config/firebase';
import { PhotoProvider } from './screens/PhotoContext';
// import Icon from 'react-native-vector-icons/FontAwesome5';
import Ionicons from '@expo/vector-icons/Ionicons';
import Login from './screens/Login';
import Signup from './screens/Signup';
import LiveBracket from './screens/Bracket/LiveBracket';
import Schedule from './screens/Schedule';
import colors from './colors';
import FoodMenu from './screens/FoodMenu';
import Transportation from './screens/Transportation';
import TaskList from './screens/TaskList/TaskList';
import QAScreen from './screens/QAScreen';
import FlashcardScreenSanto from './screens/SFlashcard';
import FlashcardScreenKishores from './screens/KFlashcard';
import ReelsScreen from './screens/ReelsScreen';
import PhotosScreen from './screens/PhotosScreen';
import AccountScreen from './screens/AccountScreen';
import ForgotPassword from './screens/ForgotPassword';
import MukhpathScreen from './screens/TaskList/MukhpathScreen';
import MSMRuchiQuiz from './screens/MSMRuchiQuiz';
import IQQuizScreen from './screens/IQQuiz';
import MyPostsScreen from './screens/MyPosts';
import KirtansScreen from './screens/TaskList/KirtansScreen';
import PBPScreen from './screens/TaskList/PurshottamBolyaPrite';
import { enableScreens } from 'react-native-screens';

enableScreens();
console.log('Screens enabled'); // Debug log

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const AuthenticatedUserContext = createContext({});

const AuthenticatedUserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  return (
    <AuthenticatedUserContext.Provider value={{ user, setUser }}>
      {children}
    </AuthenticatedUserContext.Provider>
  );
};

function QAStack ({ navigation }) {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Q/A" 
        component={QAScreen} 
        options={{
          headerTitle: 'Q / A',
          headerStyle: {
            backgroundColor: '#fff8e1',
            borderBottomWidth: 1,
            borderBottomColor: colors.primary
          },
        }} 
      />
      <Stack.Screen 
        name="Santo: Q / A" 
        component={FlashcardScreenSanto} 
        options={{ 
          headerTitle: 'Welcome Pujya Santo!',
          headerStyle: {
            backgroundColor: '#fff8e1', // Apply the same header style for consistency
            borderBottomWidth: 1,
            borderBottomColor: colors.primary
          },
        }} 
      />
      <Stack.Screen 
        name="Kishore: Q / A" 
        component={FlashcardScreenKishores} 
        options={{ 
          headerTitle: 'Welcome Kishores!',
          headerStyle: {
            backgroundColor: '#fff8e1', // Apply the same header style for consistency
            borderBottomWidth: 1,
            borderBottomColor: colors.primary
          },
        }} 
      />
    </Stack.Navigator>
  );
}
function ReelsStack({ navigation }) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Reels1"
        component={ReelsScreen}
        options={{
          headerShown: false,
          headerTitle: 'Reels',
          headerStyle: {
            backgroundColor: '#fff8e1',
            borderBottomWidth: 1,
            borderBottomColor: colors.primary
          },
        }}
      />
      <Stack.Screen 
        name="Everyone's Reels" 
        component={PhotosScreen} 
        options={{ 
          headerTitle: "Everyone's Reels",
          headerStyle: {
            backgroundColor: '#fff8e1', // Apply the same header style for consistency
            borderBottomWidth: 1,
            borderBottomColor: colors.primary
          },
        }} 
      />
      <Stack.Screen 
        name="Your Reels" 
        component={MyPostsScreen} 
        options={{ 
          headerTitle: "My Reels",
          headerStyle: {
            backgroundColor: '#fff8e1', // Apply the same header style for consistency
            borderBottomWidth: 1,
            borderBottomColor: colors.primary
          },
        }} 
      />
    </Stack.Navigator>
  )
}
function TasksStack({ navigation }) {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Task"
        component={TaskList}
        options={{
          headerShown: true,
          headerTitle: 'Your Tasks',
          headerStyle: {
            backgroundColor: '#fff8e1',
            borderBottomWidth: 1,
            borderBottomColor: colors.primary
          },
        }}
      />
      <Stack.Screen 
        name="Mukhpath" 
        component={MukhpathScreen} 
        options={{ 
          headerTitle: "Satsang Diksha",
          headerStyle: {
            backgroundColor: '#fff8e1', // Apply the same header style for consistency
            borderBottomWidth: 1,
            borderBottomColor: colors.primary
          },
        }} 
      />
      <Stack.Screen 
        name="Kirtans" 
        component={KirtansScreen} 
        options={{ 
          headerTitle: "Your Kirtans",
          headerStyle: {
            backgroundColor: '#fff8e1', // Apply the same header style for consistency
            borderBottomWidth: 1,
            borderBottomColor: colors.primary
          },
        }} 
      />
      <Stack.Screen 
        name="PBP" 
        component={PBPScreen} 
        options={{ 
          headerTitle: "Your quotations",
          headerStyle: {
            backgroundColor: '#fff8e1', // Apply the same header style for consistency
            borderBottomWidth: 1,
            borderBottomColor: colors.primary
          },
        }} 
      />
    </Stack.Navigator>
  )
}
function LiveBracketStack({ navigation }) {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Bracket1" 
        component={LiveBracket} 
        options={{
          headerShown: true,
          headerTitle: 'Live Bracket',
          headerStyle: {
            backgroundColor: '#fff8e1',
            borderBottomWidth: 1,
            borderBottomColor: colors.primary
          },
          // headerRight: () => (
          //   <TouchableOpacity onPress={() => navigation.navigate('Stats')}>
          //     <Icon name="stats-chart-outline" size={24} color={colors.primary} style={{ paddingRight: 20 }} />
          //   </TouchableOpacity>
          // ),
        }} 
      />
    </Stack.Navigator>
  );
}
function ScheduleStack({ navigation }) {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Today1" 
        component={Schedule} 
        options={{
          headerTitle: `${auth.currentUser.displayName}`,
          headerStyle: {
            backgroundColor: '#fff8e1',
            borderBottomWidth: 1,
            borderBottomColor: colors.primary
          },
        }} 
      />
      <Stack.Screen 
        name="Food Menu" 
        component={FoodMenu} 
        options={{ 
          headerTitle: 'Menu',
          headerStyle: {
            backgroundColor: '#fff8e1', // Apply the same header style for consistency
            borderBottomWidth: 1,
            borderBottomColor: colors.primary
          },
        }} 
      />
      <Stack.Screen 
        name="Transportation" 
        component={Transportation} 
        options={{ 
          headerTitle: 'Transportation',
          headerStyle: {
            backgroundColor: '#fff8e1', // Apply the same header style for consistency
            borderBottomWidth: 1,
            borderBottomColor: colors.primary
          },
        }} 
      />
      <Stack.Screen 
        name="Account" 
        component={AccountScreen} 
        options={{ 
          headerTitle: 'Account',
          headerStyle: {
            backgroundColor: '#fff8e1', // Apply the same header style for consistency
            borderBottomWidth: 1,
            borderBottomColor: colors.primary
          },
        }} 
      />
      <Stack.Screen 
        name="Ruchi Quiz" 
        component={MSMRuchiQuiz} 
        options={{ 
          headerTitle: 'MSM Ruchi Quiz!',
          headerStyle: {
            backgroundColor: '#fff8e1', // Apply the same header style for consistency
            borderBottomWidth: 1,
            borderBottomColor: colors.primary
          },
        }} 
      />
      <Stack.Screen
        name="IQ Quiz"
        component={IQQuizScreen}
        options={{ 
          headerTitle: 'IQ Quiz',
          headerStyle: {
            backgroundColor: '#fff8e1', // Apply the same header style for consistency
            borderBottomWidth: 1,
            borderBottomColor: colors.primary
          },
        }}
      />
    </Stack.Navigator>
  );
}
function MainStack() {
  return (
    <Tab.Navigator
      initialRouteName='Today'
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: {
          borderTopColor: 'tomato',
          borderWidth: 6,
          fontSize: 12,
        },
        tabBarStyle: {
          // padding: 10,
          display: 'flex',
          backgroundColor: '#fff8e1',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Tasks') {
            iconName = focused ? 'list-circle-outline' : 'list-circle-outline';
          } else if (route.name === 'Bracket') {
            iconName = focused ? 'analytics-outline' : 'analytics-outline'; // Choose appropriate icons
          } else if (route.name === 'Reels') {
            iconName = focused ? 'camera-outline' : 'camera-outline'; // Choose appropriate icons
          } else if (route.name === 'Today') {
            iconName = focused ? 'calendar-outline' : 'calendar-outline'
          } else if (route.name === 'Q / A') {
            iconName = focused ? 'help-circle-outline' : 'help-circle-outline'
          }
          // You can return any component that you like here!
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Tasks" 
        component={TasksStack}
        options={{ 
          tabBarShowLabel: false,
          headerShown: false,
          headerStyle: {
            backgroundColor: '#fff8e1', // Apply the same header style for consistency
            borderBottomWidth: 1,
            borderBottomColor: colors.primary
          } 
        }}  
      />
      <Tab.Screen 
        name="Bracket" 
        component={LiveBracketStack} 
        options={{ 
          headerShown: false, 
          tabBarShowLabel: false,
          headerStyle: {
            backgroundColor: '#fff8e1', // Apply the same header style for consistency
            borderBottomWidth: 1,
            borderBottomColor: colors.primary
          } 
        }} 
      />
      <Tab.Screen 
        name="Today" 
        component={ScheduleStack} 
        options={{ 
          headerShown: false,
          tabBarShowLabel: false,
          headerStyle: {
            backgroundColor: '#fff8e1', // Apply the same header style for consistency
            borderBottomWidth: 1,
            borderBottomColor: colors.primary
          } 
        }}  
      />
      <Tab.Screen 
        name="Reels" 
        component={ReelsStack} 
        options={{ 
          headerShown: false,
          tabBarShowLabel: false,
          headerStyle: {
            backgroundColor: '#fff8e1', // Apply the same header style for consistency
            borderBottomWidth: 1,
            borderBottomColor: colors.primary
          } 
        }}  
      />
      <Tab.Screen 
        name="Q / A" 
        component={QAStack} 
        options={{ 
          tabBarLabelStyle: {
            fontSize: 25,
          },
          headerShown: false,
          tabBarShowLabel: false,
          headerStyle: {
            backgroundColor: '#fff8e1', // Apply the same header style for consistency
            borderBottomWidth: 1,
            borderBottomColor: colors.primary
          } 
        }}  
      />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, headerBackground: '#EFEFEF' }}>
      <Stack.Screen name='Login' component={Login} />
      <Stack.Screen name='Signup' component={Signup} />
      <Stack.Screen name='Forgot password' component={ForgotPassword} />
    </Stack.Navigator>
  );
}


function RootNavigator() {
  const { user, setUser } = useContext(AuthenticatedUserContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, authenticatedUser => {
      authenticatedUser ? setUser(authenticatedUser) : setUser(null);
      setIsLoading(false);
    });

    // Unsubscribe on unmount
    return unsubscribeAuth;
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    );
  }
  

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

function App() {
  return (
    <AuthenticatedUserProvider>
      <PhotoProvider>
        <RootNavigator />
      </PhotoProvider>
    </AuthenticatedUserProvider>
  );
}


const styles = StyleSheet.create({
  Stats: {
      display: 'flex'
  },
});

export default App;
