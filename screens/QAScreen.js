import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-paper';
import colors from '../colors';
import { useNavigation } from "@react-navigation/native";
import { auth, database } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

const QAScreen = () => {
  const navigation = useNavigation();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      const uid = auth.currentUser.uid;
      const userDocRef = doc(database, 'userData', uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setUserRole(userData.role);
      }
    };
    fetchUserRole();
  }, []);

  const renderContentBasedOnRole = () => {
    if (userRole === 'Kishore') {
      return (
        <>
          <Text style={styles.overviewText}>
          Over the course of this retreat, you will have the opportunity to get to know your Pujya Santo better.{"\n"}{"\n"}
          Since you have been identified as a Kishore please press the button that reads Kishore.
          Here you will find questions that you will be able to ask Santo. 
          Write down notes as per their answers.{"\n"}{"\n"}
          There is also another button called Mahant Swami Maharaj's Ruchi.
          This is a quiz to see how well you know our Guru. Answer each question to the best of your ability!
          </Text>
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate("Kishore: Q / A")}
              style={styles.button}
              labelStyle={styles.buttonLabel}
              compact
            >
              Kishore
            </Button>
            <Button
              mode="contained"
              onPress={() => navigation.navigate("Ruchi Quiz")}
              style={styles.button}
              labelStyle={styles.buttonLabel}
              compact
            >
              Mahant Swami Maharaj's Ruchi
            </Button>
          </View>
        </>
      );
    } else if (userRole === 'Santo') {
      return (
        <>
          <Text style={styles.overviewText}>
          Over the course of this retreat, you will have the opportunity to get to know your fellow Kishores better.{"\n"}{"\n"}
          Since you have been identified as a Sant please press the button that reads Pujya Sant.
          Here you will find questions that you will be able to ask Kishores. 
          Write down notes as per their answers.{"\n"}{"\n"}
          There is also another button called Mahant Swami Maharaj's Ruchi.
          This is a quiz to see how well you know our Guru. Answer each question to the best of your ability!
          </Text>
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate("Santo: Q / A")}
              style={styles.button}
              labelStyle={styles.buttonLabel}
              compact
            >
              Pujya Santos
            </Button>
            <Button
              mode="contained"
              onPress={() => navigation.navigate("Ruchi Quiz")}
              style={styles.button}
              labelStyle={styles.buttonLabel}
              compact
            >
              Mahant Swami Maharaj's Ruchi
            </Button>
          </View>
        </>
      );
    } else {
      return <ActivityIndicator size='large' color={colors.primary}/>; // or any other placeholder
    }
  };

  return (
    <View style={styles.headerContainer}>
      {renderContentBasedOnRole()}
    </View>
  );
};

const styles = StyleSheet.create({
    headerContainer: {
      backgroundColor: colors.universalBg, // Or any color that suits your app theme
      paddingVertical: 20,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    msmButtonContainer: {
      // flexDirection: 'row',
      marginTop: 10
    },
    overviewText: {
      fontFamily: 'Menlo',
      textDecorationStyle: 'solid',
      fontSize: 17,
      lineHeight: 25,
      textAlign: 'center',
      marginBottom: 20
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
      backgroundColor: colors.universalBg,
    },
    textContent: {
      marginLeft: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
    },
    icon: {
      flexShrink: 0,
    },
    buttonContainer: {
        flexDirection: 'column',
        justifyContent: 'space-around', // This will space your buttons evenly
        marginTop: 20, // Add margin at the top for spacing
        marginBottom: 40, // Optional: if you want space below the buttons
    },
    button: {
        padding: 5,
        backgroundColor: colors.primary,
        marginBottom: 30,
        marginHorizontal: 5, // Add horizontal margin for spacing between buttons
        borderRadius: 10, // Optional: if you want rounded corners
    },
    buttonLabel: {
        fontSize: 19, // Reduce font size to fit the compact buttons
    },
  });  

export default QAScreen;
