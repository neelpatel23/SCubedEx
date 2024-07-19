import React, { useState } from "react";
import { StyleSheet, Text, View, Platform, TextInput, Image, SafeAreaView, TouchableOpacity, StatusBar, Alert, KeyboardAvoidingView, ActivityIndicator } from "react-native";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import colors from "../colors";
const logoImage = require("../assets/logo1.png");

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // New state for loading

  const onHandleLogin = () => {
    if (email !== "" && password !== "") {
      setLoading(true); // Start loading
      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          console.log("Login success");
          setLoading(false); // Stop loading on success
        })
        .catch((err) => {
          Alert.alert("Login error", err.message);
          setLoading(false); // Stop loading on error
        });
    }
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
        {/* <Text style={styles.title}>Log In</Text> */}
      {/* </View> */}
      <TextInput
        style={styles.input}
        placeholder="Enter email"
        placeholderTextColor='#000'
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        autoFocus={true}
        value={email}
        onSubmitEditing={onHandleLogin}
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
        onSubmitEditing={onHandleLogin}
        onChangeText={(text) => setPassword(text)}
      />
       {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={onHandleLogin}>
            <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 18 }}>Log In</Text>
          </TouchableOpacity>
        )}
      {/* <View style={{marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center'}}>
        <Text style={{color: 'gray', fontWeight: '600', fontSize: 14}}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
          <Text style={{color: '#f57c00', fontWeight: '600', fontSize: 14}}>Sign Up</Text>
        </TouchableOpacity>
      </View> */}
      <View style={{marginTop: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center'}}>
        <Text style={{color: 'gray', fontWeight: '600', fontSize: 14}}>Forgot your password? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Forgot password")}>
          <Text style={{color: '#f57c00', fontWeight: '600', fontSize: 14}}>Reset</Text>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
    
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff8e1",
    alignItems: 'center', // Center children horizontally
  },
  header: {
    marginTop: StatusBar.currentHeight || 0, // Provide spacing for the status bar
    height: 200, // Adjust the height as needed
    alignItems: 'center', // Center children horizontally
    justifyContent: 'center', // Center children vertically
    marginBottom: 20,
    // backgroundColor: colors.primary
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: "orange",
    marginTop: -1, // Adjust the negative margin to reduce space between the logo and the title
    marginBottom: 24,
    alignItems: 'center'
  },
  input: {
    backgroundColor: 'transparent', // Set the background color to white
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
    marginTop: 0,
    width: '100%',
    height: '65%',
    position: "absolute",
    bottom: 0,
    // backgroundColor: colors.primary,
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
