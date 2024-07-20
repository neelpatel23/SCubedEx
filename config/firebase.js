import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore/"
import { getStorage } from "firebase/storage";

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

// Get instances for Firebase services
export const auth = getAuth(app);
export const database = getFirestore(app);
export const storage = getStorage(app);
