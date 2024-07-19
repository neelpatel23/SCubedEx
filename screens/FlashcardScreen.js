import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import bracketData from '../config/bracketData.json';
import colors from '../colors';
import { useNavigation } from "@react-navigation/native";

const QAScreen = () => {
  const navigation = useNavigation();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  
  const isCurrentEvent = (combinedTime) => {
    if (!combinedTime) return false; // Guard against undefined values
  
    const times = combinedTime.split(' - '); // Split the combined time into start and end times
    if (times.length !== 2) return false; // Guard against incorrect formats
  
    const [startTime, endTime] = times.map(time => {
      // Convert 12 hour time format to 24-hour time format for comparison
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
  

  const getIconName = (type) => {
    switch (type) {
      case 'match': return 'soccer';
      case 'break': return 'coffee';
      case 'lunch': return 'food';
      case 'activity': return 'account-group';
      case 'dinner': return 'silverware-fork-knife';
      default: return 'calendar-blank';
    }
  };

  return (
    <>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Today's Schedule</Text>
        <Text style={styles.headerDate}>{today}</Text>
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
      </View>
      <ScrollView style={styles.scrollView}>
      {bracketData.schedule.map((event, index) => {
        console.log(event.time);
        const current = isCurrentEvent(event.time);
        return (
            <Card key={index} style={[styles.card, current && styles.currentEvent]}>
            <Card.Content style={styles.cardContent}>
                {/* <Icon name={getIconName(event.type)} size={24} color="#333" style={styles.icon} /> */}
                <View style={styles.textContent}>
                <Title style={styles.title}>{event.title}</Title>
                <Paragraph style={styles.time}>{event.time}</Paragraph>
                </View>
                {/* {current && <Icon name="arrow-right-thick" size={24} color={colors.accent} />} */}
            </Card.Content>
            </Card>
        );
        })}
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
    headerContainer: {
      backgroundColor: '#EFEFEF', // Or any color that suits your app theme
      paddingVertical: 20,
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
      color: colors.primary, // A lighter purple, adjust as needed
      fontSize: 16,
    },
    scrollView: {
      flex: 1,
      backgroundColor: '#EFEFEF',
    },
    card: {
      marginVertical: 8,
      marginHorizontal: 16,
      elevation: 4,
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    textContent: {
      marginLeft: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
    },
    time: {
      fontSize: 14,
      color: '#555',
    },
    icon: {
      flexShrink: 0,
    },
    currentEvent: {
        borderColor: colors.accent, // Your accent color
        borderWidth: 2,
        backgroundColor: colors.accentLight, // A lighter version of your accent color for the background
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around', // This will space your buttons evenly
        marginTop: 20, // Add margin at the top for spacing
        marginBottom: 10, // Optional: if you want space below the buttons
    },
    button: {
        backgroundColor: colors.accent,
        flex: 1, // Each button will take up equal space
        marginHorizontal: 5, // Add horizontal margin for spacing between buttons
        borderRadius: 20, // Optional: if you want rounded corners
    },
    buttonLabel: {
        fontSize: 12, // Reduce font size to fit the compact buttons
    },
  });  

export default Schedule;
