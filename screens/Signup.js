import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, TextInput, Image, SafeAreaView, TouchableOpacity, StatusBar, Alert, KeyboardAvoidingView } from "react-native";
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
const logoImage = require("../assets/logo1.png");

export default function Signup({ navigation }) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const onHandleSignup = () => {
    if (email === '' || password === '') {
      Alert.alert("Signup error", "Please enter all fields.");
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then(() => console.log('Signup success'))
      .catch((err) => Alert.alert("Signup error", err.message));
  };
  
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="default" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.KeyboardAvoidingView}
      >
      <View style={styles.header}>
        <Image source={logoImage} style={styles.backImage} />
      </View>
      {/* <View style={styles.whiteSheet} /> */}
      {/* <View style={styles.centerAll}> */}
        {/* <Text style={styles.title}>S³</Text> */}
        {/* <Text style={styles.title}>Sign Up</Text> */}
        <Text style={styles.subtitle}>Please contact nearest available karayakar to obtain an account.</Text>
      {/* </View> */}
        {/* <TextInput
          style={styles.input}
          placeholder="Enter email"
          placeholderTextColor='#000'
          autoCapitalize="none"
          keyboardType="email-address"
          textContentType="emailAddress"
          autoFocus={true}
          value={email}
          onChangeText={(text) => setEmail(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          placeholderTextColor='#000'
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={true}
          textContentType="password"
          value={password}
          onChangeText={(text) => setPassword(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          placeholderTextColor='#000'
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry={true}
          textContentType="password"
          value={confirmPassword}
          onChangeText={(text) => setConfirmPassword(text)}
        />
      <TouchableOpacity style={styles.button} onPress={onHandleSignup}>
        <Text style={{fontWeight: 'bold', color: '#fff', fontSize: 18}}>Sign Up</Text>
      </TouchableOpacity>
      <View style={{marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center'}}>
        <Text style={{color: 'gray', fontWeight: '600', fontSize: 14}}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={{color: '#f57c00', fontWeight: '600', fontSize: 14}}>Log In</Text>
        </TouchableOpacity>
      </View> */}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flex: 1,
    backgroundColor: "#fff",
    alignItems: 'center', // Center children horizontally
  },
  header: {
    marginTop: StatusBar.currentHeight || 0, // Provide spacing for the status bar
    height: 200, // Adjust the height as needed
    alignItems: 'center', // Center children horizontally
    justifyContent: 'center', // Center children vertically
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: "orange",
    marginTop: -1, // Adjust the negative margin to reduce space between the logo and the title
    marginBottom: 24,
    alignItems: 'center'
  },
  subtitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: "orange",
    marginTop: 3, // Adjust the negative margin to reduce space between the logo and the title
    marginBottom: 24,
    alignItems: 'center',
    textAlign: 'center'
  },
  input: {
    backgroundColor: "#F6F7FB", // Set the background color to white
    height: 58, // Adjust the height of the input field
    fontSize: 16,
    borderRadius: 10, // Rounded corners
    padding: 15,
    // borderWidth: 1, // Border width
    borderColor: '#ddd', // Border color
    width: '80%', // Set width to 100% of its parent container
    marginBottom: 20, // Space between the input fields
  },
  backImage: {
    width: 300,
    height: 300, // Adjust the size as needed
    resizeMode: "contain", // Ensure the logo is scaled correctly
  },
  whiteSheet: {
    width: '100%',
    height: '75%',
    position: "absolute",
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 60,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 30,
    paddingHorizontal: 30, // Increase padding to reduce the width of the form
  },
  button: {
    backgroundColor: '#f57c00',
    height: 50, // Increase the height of the button
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    width: '70%', // Set width to 100% of its parent container
  },
  KeyboardAvoidingView: {
    alignItems: 'center',
    width: '100%'
  }
});