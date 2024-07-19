import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, TextInput, Alert, Image, Modal } from 'react-native';
import { Card, Button, Title, Paragraph } from 'react-native-paper';
import { signOut } from 'firebase/auth';
import { auth, database } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AccountScreen = () => {
  const user = auth.currentUser;
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [score, setScore] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      const userDocRef = doc(database, 'userData', user.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setScore(userData.photoURL || '');
        setUserRole(userData.role || '');
      }
    };
    fetchUserData();
  }, [user.uid]);

  const handleSignOut = () => {
    AsyncStorage.clear() // Clear all data in AsyncStorage
        .then(() => {
        signOut(auth)
            .then(() => console.log("User signed out!"))
            .catch((error) => Alert.alert("Error", error.message));
        })
        .catch((error) => {
        console.error("AsyncStorage error: ", error.message);
        });
    };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };
 
  const deleteUserFromFirestore = async (userId) => {
    try {
      await setDoc(doc(database, 'userData', userId), null, { merge: true });
      console.log("User data deleted from Firestore.");
    } catch (error) {
      console.error("Error deleting user data from Firestore: ", error);
    }
  };
  
  // Function to delete the user account
  const deleteAccount = async () => {
    // First, delete user data from Firestore
    await deleteUserFromFirestore(user.uid);
  
    // Then delete the user account
    deleteUser(user).then(() => {
      console.log("User account deleted successfully");
      // Navigate to login or welcome screen
      // Perform additional cleanup if necessary
    }).catch((error) => {
      console.error("Error deleting user account: ", error);
    });
  };

  const handleAccountDeletion = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This cannot be undone.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => deleteAccount() 
        }
      ]
    );
  };

  const Cube = ({ title, detail, completed, onPress }) => (
    <Card style={[styles.cube, completed ? styles.cubeCompleted : styles.cubeIncomplete, styles.shadow]} onPress={onPress}>
      <Card.Content>
        <Ionicons name={completed ? 'check-circle-outline' : 'alert-circle-outline'} size={30} color={completed ? colors.success : colors.danger1} />
        <Title>{title}</Title>
        <Paragraph>{detail}</Paragraph>
      </Card.Content>
    </Card>
  );
  

  const getScoreColor = () => {
    const numericScore = parseInt(score, 10);
    if (numericScore >= 20) {
      return colors.success;
    } else if (numericScore >= 10) {
      return colors.warning;
    } else {
      return colors.danger;
    }
  };

  const ScoreCube = () => (
    <Card style={[styles.cube, { borderColor: getScoreColor(), borderWidth: 2 }]}>
      <Card.Content>
        <Ionicons name='trophy-award' size={30} color={getScoreColor()} />
        <Title>Quiz Score</Title>
        <Paragraph style={{ fontSize: 18}}>{score}/20</Paragraph>
      </Card.Content>
    </Card>
  );


  return (
    <>
    <ScrollView style={styles.container}>
      <View style={styles.cubeContainer}>
        <Cube title="Email" detail={user.email} completed={true} />
        <Cube title="Display Name" detail={displayName} completed={true} />
        <Cube title="User Role" detail={userRole} completed={true} />
        <ScoreCube />
        <Cube title="User ID" detail={user.uid} completed={true} />
        <Cube title="Account Created" detail={formatDate(user.metadata.creationTime)} completed={true} />
      </View>
      <View style={styles.signOutContainer}>
        <Button mode="contained" onPress={handleSignOut} style={styles.signOutButton}>Sign Out</Button>
        <Button mode="contained" onPress={handleAccountDeletion} style={styles.deleteAccountButton}>Delete Account</Button>
      </View>
    </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff8e1",
  },
  deleteAccountButton: {
    borderRadius: 30,
    backgroundColor: 'red',
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginTop: 20,
  },
  input: {
    backgroundColor: '#F6F7FB',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    width: '100%',
    marginBottom: 20,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 20,
  },
  cubeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 10,
  },
  cube: {
    backgroundColor: "#fff8e1", // Ensure a background color is set
    width: '45%',
    margin: 5,
    borderRadius: 8,
  },
  cubeCompleted: {
    borderColor: colors.success,
    borderWidth: 2,
  },
  cubeIncomplete: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  shadow: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Use elevation for Android
  },
  signOutContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  signOutButton: {
    borderRadius: 30,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  closeButton: {
    marginBottom: 10,
    alignSelf: 'center',
  },
  modalView: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '80%',
    backgroundColor: colors.universalBg,
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
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeModalText: {
    fontSize: 13,
    paddingBottom: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeText: {
    paddingTop: 10,
    paddingBottom: 10,
    color: colors.primary,
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center'
  }
});


export default AccountScreen;
