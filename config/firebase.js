import { initializeApp } from "firebase/app";
import { getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHgl8cuOZ42osztO-o6EcNzYhAzRU96oo",
  authDomain: "scubed-eda81.firebaseapp.com",
  databaseURL: "https://scubed-eda81-default-rtdb.firebaseio.com",
  projectId: "scubed-eda81",
  storageBucket: "scubed-eda81.appspot.com",
  messagingSenderId: "306014953325",
  appId: "1:306014953325:web:842c7750115bea10f34464",
  measurementId: "G-HD0RVN7VYZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Check if Auth is already initialized
let auth;
try {
  auth = getAuth();
} catch (error) {
  // If the error is 'auth/not-initialized', then we need to initialize Auth
  if (error.code === 'auth/not-initialized') {
    initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage)
    });
    auth = getAuth();
  } else {
    // Throw any other errors
    throw error;
  }
}

// Get instances for Firebase services
const database = getFirestore();
const storage = getStorage();

export { auth, database, storage };
