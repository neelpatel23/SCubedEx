import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, SafeAreaView, ActivityIndicator, Image, Platform, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth, database } from '../config/firebase';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import colors from '../colors';
const logo = require("../assets/adaptive-icon.png");

const ReelsScreen = ({ navigation }) => {
  const user = auth.currentUser;
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [hasPermission, setPermission] = useState();
  const [isUploading, setIsUploading] = useState(false);
  const [facing, setFacing] = useState('back');
  const [photoUri, setPhotoUri] = useState(null);
  const [data, setUserData] = useState({});

  useEffect(() => {
    (async () => {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'We need your permission to use the camera');
      }
      const { gallery } = await ImagePicker.getMediaLibraryPermissionsAsync(true)
      setPermission(gallery === 'granted');
    })();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDocRef = doc(database, 'userData', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (user?.uid) {
      fetchUserData();
    }
  }, [user?.uid]);

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        if (photo) {
          compressAndSetImage(photo.uri);
        } else {
          throw new Error('Failed to capture a picture.');
        }
      } catch (error) {
        console.error("Take Picture Error: ", error);
        Alert.alert("Error", "Failed to take a picture.");
      }
    }
  };

  const compressAndSetImage = async (uri) => {
    try {
      const compressedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      setPhotoUri(compressedImage.uri);
    } catch (error) {
      console.error("Compression Error: ", error);
      Alert.alert("Error", "Failed to compress the image.");
    }
  };

  const uploadImage = async () => {
    if (!photoUri) {
      Alert.alert("Error", "No photo to upload.");
      return;
    }

    setIsUploading(true);

    try {
      const userDisplayName = auth.currentUser.displayName || 'anonymous';
      const userUID = auth.currentUser.uid;
      const fileName = `${Date.now()}.jpg`;
      const storagePath = `reels/${userDisplayName}/${fileName}`;
      const fileRef = storageRef(storage, storagePath);
      let blob;

      const decodedUri = decodeURIComponent(photoUri);

      if (decodedUri.startsWith('file://')) {
        const localFilePath = decodedUri.substr(7);
        const compressedImage = await ImageManipulator.manipulateAsync(
          localFilePath,
          [],
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        blob = await (await fetch(compressedImage.uri)).blob();
      } else {
        blob = await (await fetch(decodedUri)).blob();
      }

      const metadata = {
        contentType: 'image/jpeg',
        customMetadata: {
          'userUID': userUID,
          'uploader': userDisplayName,
          'center': data.center,
          'group': data.group,
          'createdAt': new Date().toISOString()
        },
      };

      await uploadBytes(fileRef, blob, metadata);
      const downloadURL = await getDownloadURL(fileRef);
      const reelsRef = collection(database, 'reels');
      const docRef = doc(reelsRef, fileName);
      await setDoc(docRef, { url: downloadURL, metadata });

      Alert.alert("Success", "Photo uploaded successfully!");
    } catch (error) {
      console.error("Upload Error: ", error);
      Alert.alert("Error", "Failed to upload the photo.");
    } finally {
      setIsUploading(false);
      setPhotoUri(null);
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        compressAndSetImage(result.uri);
      }
    } catch (error) {
      console.error("Gallery Pick Error: ", error);
      Alert.alert("Error", "Failed to pick an image from the gallery.");
    }
  };

  const renderCameraView = () => {
    const isAndroid = Platform.OS === 'android';

    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.iconContainer}>
          <View style={styles.logoContainer}>
            <Image source={logo} style={{ width: 70, height: 70 }} />
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Everyone's Reels")}>
            <Ionicons name="albums-outline" size={30} color="white" />
          </TouchableOpacity>
        </SafeAreaView>
        {isAndroid ? (
          <View style={styles.androidContainer}>
            <TouchableOpacity onPress={pickImageFromGallery} style={styles.galleryButtonAndroid}>
              <Text style={styles.galleryButtonText}>Choose from Gallery</Text>
              <Ionicons name="image-outline" size={30} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <CameraView ref={cameraRef} style={styles.preview} facing={facing}>
              <View style={styles.snapButtonContainer}>
                <TouchableOpacity onPress={takePicture} style={styles.capture}>
                  <Ionicons name='camera-outline' size={30} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleCameraFacing} style={styles.flipButton}>
                  <Ionicons name="camera-reverse-outline" size={30} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={pickImageFromGallery} style={styles.galleryButton}>
                  <Ionicons name="image-outline" size={30} color="white" />
                </TouchableOpacity>
              </View>
            </CameraView>
          </>
        )}
      </View>
    );
  };

  const renderPreviewView = () => (
    <View style={styles.preview}>
      <Image source={{ uri: photoUri }} style={styles.previewImage} />
      <TouchableOpacity onPress={() => setPhotoUri(null)} style={styles.cancelButton}>
        <Text style={styles.cancelButtonText}>Retake</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={uploadImage} style={styles.uploadButton}>
        <Text style={styles.uploadButtonText}>Upload</Text>
      </TouchableOpacity>
    </View>
  );

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isUploading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.uploadingText}>Uploading...</Text>
        </View>
      ) : photoUri ? renderPreviewView() : renderCameraView()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adjust the alpha value (0.5 in this case)
  },
  container1: {
    zIndex: 0,
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adjust the alpha value (0.5 in this case)
  },
  iconContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    right: 0,
    marginRight: 30,
    zIndex: 1,
  },
  logoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    top: 0,
    right: 0,
    marginLeft: 20,
  },
  preview: {
    backgroundColor: colors.primary,
    flex: 1,
  },
  androidContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  galleryButtonAndroid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
    borderRadius: 50,
  },
  galleryButtonText: {
    color: 'white',
    marginRight: 10, // Space between text and icon
    fontSize: 16,
  },
  capture: {
    backgroundColor: colors.primary,
    borderRadius: 15,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    width: '20%',
    margin: 20,
  },
  loadingContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
  },
  snapButtonContainer: {
    position: 'absolute',
    bottom: 5,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 10,
  },
  flipButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 30,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 30,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 10,
  },
  cancelButtonText: {
    color: '#fff',
  },
  uploadButton: {
    position: 'absolute',
    color: 'white',
    bottom: 20,
    right: 20,
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
  },
  uploadButtonText: {
    color: '#fff',
  },
});

export default ReelsScreen;
