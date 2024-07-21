import React, { useState, useEffect, useLayoutEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TabView, TabBar } from 'react-native-tab-view';
import colors from '../colors';
import { useNavigation } from "@react-navigation/native";
import { database, auth } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Schedule = () => {
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false); // New state for tracking initial load
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate("Account")}>
          <Ionicons name="person-outline" size={30} color={colors.primary} style={styles.iconStyle} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      // checkOnboardingStatus();
      // await initializeSchedule(); // Assuming this function fetches your initial data
      setLoading(false);
      setInitialLoadComplete(true); // Set to true after initial data is loaded
    };
    initializeApp();
  }, []);

  const fetchScheduleFromFirestore = async () => {
    const scheduleDocRef = doc(database, 'SCubedData', 'schedule');
    const docSnap = await getDoc(scheduleDocRef);

    if (docSnap.exists()) {
      const scheduleData = docSnap.data().data;
      return scheduleData ? scheduleData : {};
    } else {
      console.log("No schedule data found in Firestore.");
      return {};
    }
  };

  useEffect(() => {
    const initializeSchedule = async () => {
      setLoading(true);
      const cachedSchedule = await AsyncStorage.getItem('schedule');
      const firestoreSchedule = await fetchScheduleFromFirestore();

      if (JSON.stringify(cachedSchedule) !== JSON.stringify(firestoreSchedule)) {
        setSchedule(firestoreSchedule);
        await AsyncStorage.setItem('schedule', JSON.stringify(firestoreSchedule));
      } else {
        setSchedule(cachedSchedule ? JSON.parse(cachedSchedule) : {});
      }

      setLoading(false);
    };

    initializeSchedule();
  }, []);

  useEffect(() => {
    const fetchedSchedule = schedule.schedule;
    const dayMappings = { 
      'Day1': '2024-07-29', 
      'Day2': '2024-07-30', 
      'Day3': '2024-07-31', 
      'Day4': '2024-08-01',
      'Day5': '2024-08-02',
      'Day6': '2024-08-03'
    };
  
    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  
    const scheduleDays = fetchedSchedule ? Object.keys(fetchedSchedule) : [];
    if (scheduleDays.length > 0) {
      const sortedDays = scheduleDays.sort((a, b) => {
        const mappedA = new Date(`${dayMappings[a]}T00:00:00Z`); // Interpret as UTC
        const mappedB = new Date(`${dayMappings[b]}T00:00:00Z`); // Interpret as UTC
        return mappedA - mappedB;
      });
  
      const updatedRoutes = sortedDays.map(day => {
        const date = new Date(`${dayMappings[day]}T00:00:00Z`); // Interpret as UTC
        const formattedDate = `${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}`;
        return { key: day, title: formattedDate };
      });
  
      setRoutes(updatedRoutes);
    } else {
      console.log('No schedule days found');
    }
  }, [schedule]);
  
  

  const isCurrentEvent = (combinedTime) => {
    if (!combinedTime) return false;
  
    const times = combinedTime.split(' - ');
    if (times.length !== 2) return false;
  
    const [startTime, endTime] = times.map(time => {
      const [timePart, modifier] = time.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);
  
      if (hours === 12) {
        hours = modifier.toUpperCase() === 'AM' ? 0 : 12;
      } else {
        hours = modifier.toUpperCase() === 'PM' ? hours + 12 : hours;
      }
      return `${hours}:${minutes}`;
    });
  
    const currentDate = new Date();
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startDate = new Date(currentDate);
    startDate.setHours(startHours, startMinutes, 0);
  
    const endDate = new Date(currentDate);
    endDate.setHours(endHours, endMinutes, 0);
  
    return currentDate >= startDate && currentDate <= endDate;
  };

  // useEffect(() => {
  //   const unsubscribe = navigation.addListener('focus', checkOnboardingStatus);
  //   return unsubscribe;
  // }, [navigation]);

  const handleOnboardingButtonPress = async () => {
    const userEmail = auth.currentUser?.email;
    if (userEmail) {
      const userDocRef = doc(database, 'users', userEmail);
      await updateDoc(userDocRef, { onboarding0: true });
      setShowModal(false);
      navigation.navigate("Account");
    }
  };

  const OnboardingModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showModal}
      onRequestClose={() => setShowModal(false)}
    >
      <View style={styles.modalView}>
        <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeButton}>
          <Text style={styles.closeModalText}>Press here to close</Text>
        </TouchableOpacity>
        <Text style={styles.modalTitle}>Welcome to S³</Text>
        <Text style={styles.modalText}>
          To fully participate in this retreat and enjoy all its features, please complete the following tasks in your account:
          {'\n'}- Sign the Liability Form
          {'\n'}- Set your Date of Birth
          {'\n'}- Set your Display Name
        </Text>
        <View style={styles.navigationBox}>
          <Button
            mode="contained"
            onPress={handleOnboardingButtonPress}
            style={styles.modalButton}
          >
            Go to Account Page
          </Button>
        </View>
      </View>
    </Modal>
  );

  // ... [rest of your component code including renderScene function]
  
  const renderScene = ({ route }) => {
    const daySchedule = schedule.schedule ? schedule.schedule[route.key] : [];
  
    return (
      <ScrollView style={styles.scene}>
        {daySchedule.map((event, index) => {
          const isCurrent = isCurrentEvent(event.time);
          return (
            <Card key={event.id} style={[styles.card, isCurrent && styles.currentEventStyle]}>
              <Card.Content>
                <Title style={styles.title}>{event.title}</Title>
                <Paragraph style={styles.time}>{event.time}</Paragraph>
                {event.location && <Paragraph style={styles.location}>{event.location}</Paragraph>}
              </Card.Content>
            </Card>
          );
        })}
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }


  return (
    <>
      {showModal && initialLoadComplete && <OnboardingModal />}
      <View style={styles.headerContainer}>
        {/* <Text style={styles.headerTitle}>Today's Schedule</Text> */}
        {/* <Text style={styles.headerDate}>{today}</Text> */}
        <View style={styles.buttonContainer}>
          <Button
            icon="silverware-fork-knife"
            mode="contained"
            onPress={() => navigation.navigate("Food Menu")}
            style={styles.button}
            labelStyle={styles.buttonLabel}
            compact
          >
            Food Menu
          </Button>
          <Button
            icon="bus"
            mode="contained"
            onPress={() => navigation.navigate("Transportation")}
            style={styles.button}
            labelStyle={styles.buttonLabel}
            compact
          >
            Transportation
          </Button>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate("Ruchi Quiz")}
            style={styles.button}
            labelStyle={styles.buttonLabel}
            compact
          >
            MSM Ruchi Quiz
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.navigate("IQ Quiz")}
            style={styles.button}
            labelStyle={styles.buttonLabel}
            compact
          >
            IQ Quiz
          </Button>
        </View>
      </View>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: '100%' }}
        renderTabBar={props => 
          <TabBar 
            {...props} 
            style={styles.tabBar} 
            labelStyle={styles.tabLabel} 
            indicatorStyle={styles.tabIndicator}
          />
        }
      />
    </>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentEventStyle: {
    borderColor: colors.primary, // Choose your color
    borderWidth: 2,     // Set the border width
    // Add other styling as needed
  },
  closeButton: {
    marginBottom: 10,
    alignSelf: 'center',
  },
  modalView: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '50%',
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeModalText: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  modalText: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 25,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    paddingBottom: 10,
    fontWeight: 'bold'
  },
  navigationBox: {
    marginBottom: 20
  },
  modalButton: {
    backgroundColor: colors.primary,
  },
  headerContainer: {
    backgroundColor: '#fff8e1',
    // paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerDate: {
    color: colors.primary,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 5,
  },
  button: {
    backgroundColor: colors.accent,
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 20,
  },
  buttonLabel: {
    fontSize: 15,
  },
  iconStyle: {
    marginRight: 15,
  },
  scene: {
    backgroundColor: "#fff8e1",
    flex: 1,
  },
  tabBar: {
    marginTop: 0,
    backgroundColor: "#fff8e1",
  },
  tabLabel: {
    color: 'black',
    fontSize: 10.5,
  },
  tabIndicator: {
    backgroundColor: colors.primary,
    height: 3,
  },
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  time: {
    fontSize: 16,
    color: '#555',
  },
  location: {
    fontSize: 15,
      color: '#666666'
  },

})



export default Schedule;
