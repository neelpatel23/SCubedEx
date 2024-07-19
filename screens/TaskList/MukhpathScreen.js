// import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
// import {
//   StyleSheet,
//   View,
//   Text,
//   TouchableOpacity,
//   FlatList,
//   Modal,
//   TextInput,
//   ActivityIndicator,
// } from 'react-native';
// import { Card, Title, Paragraph, Button} from 'react-native-paper';
// import Icon from 'react-native-vector-icons/Ionicons';
// import { database, auth } from '../../config/firebase';
// import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
// import { Audio } from 'expo-av';
// import { useNavigation } from "@react-navigation/native";
// import colors from '../../colors';
// import Slider from '@react-native-community/slider';

// const MukhpathScreen = () => {
//   const [shlokas, setShlokas] = useState([]);
//   const [currentShloka, setCurrentShloka] = useState(null);
//   const [sound, setSound] = useState(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [completionStatuses, setCompletionStatuses] = useState({});
//   const [isAccessCodeModalVisible, setIsAccessCodeModalVisible] = useState(false);
//   const [accessCodeInput, setAccessCodeInput] = useState('');
//   const [isLoading, setLoading] = useState(true);
//   const [selectedShlokaId, setSelectedShlokaId] = useState(null);
//   const [audioPosition, setAudioPosition] = useState(0);
//   const [audioDuration, setAudioDuration] = useState(0);

//   const navigation = useNavigation();

//   const ACCESS_CODE = '1933';

//   const fetchCompletionStatuses = useCallback(async () => {
//     const userDocRef = doc(database, 'userMukhpathsSD', auth.currentUser.email);
//     const userDocSnap = await getDoc(userDocRef);
//     if (userDocSnap.exists()) {
//       setCompletionStatuses(userDocSnap.data());
//     }
//   }, []);

//   const fetchShlokas = useCallback(async () => {
//     setLoading(true);
//     try {
//       const shlokaDataRef = doc(database, 'SCubedData', 'SatsangDikshaData');
//       const shlokaDataSnap = await getDoc(shlokaDataRef);
//       if (shlokaDataSnap.exists()) {
//         setShlokas(shlokaDataSnap.data().data);
//       } else {
//         console.log('No shloka data found in Firestore.');
//       }
//     } catch (error) {
//       console.error('Error fetching shlokas:', error);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     const setAudioMode = async () => {
//       try {
//         await Audio.setAudioModeAsync({
//           playsInSilentModeIOS: true,
//           allowsRecordingIOS: false,
//           staysActiveInBackground: true,
//           shouldDuckAndroid: true,
//           playThroughEarpieceAndroid: false,
//         });
//       } catch (e) {
//         console.log(e);
//       }
//     };

//     setAudioMode();
//     fetchCompletionStatuses();
//     fetchShlokas();
//   }, [fetchCompletionStatuses, fetchShlokas]);

//   useEffect(() => {
//     return sound ? () => sound.unloadAsync() : undefined;
//   }, [sound]);

//   const playShloka = async (shloka) => {
//     if (sound) {
//       await sound.unloadAsync();
//     }
  
//     try {
//       const { sound: newSound } = await Audio.Sound.createAsync({ uri: shloka.audioURL });
//       setSound(newSound);
//       setCurrentShloka(shloka);
//       setIsPlaying(true);
  
//       newSound.setOnPlaybackStatusUpdate(updatePlaybackStatus);
//       await newSound.playAsync();
//     } catch (error) {
//       console.error("Error loading audio:", error);
//     }
//   };
  

//   const updatePlaybackStatus = (status) => {
//     setIsPlaying(status.isPlaying);
//     setAudioPosition(status.positionMillis);
//     setAudioDuration(status.durationMillis);
//   };

//   const toggleCompletionStatus = async (shlokaId, requireAccessCode = false) => {
//     if (requireAccessCode && accessCodeInput !== ACCESS_CODE) {
//       setSelectedShlokaId(shlokaId);
//       setIsAccessCodeModalVisible(true);
//       return;
//     }
  
//     const newStatus = !completionStatuses[`shloka${shlokaId}`];
  
//     setCompletionStatuses(prevStatuses => ({
//       ...prevStatuses,
//       [`shloka${shlokaId}`]: newStatus
//     }));
  
//     const userDocRef = doc(database, 'userMukhpathsSD', auth.currentUser.email);
//     const userDocSnap = await getDoc(userDocRef);
//     if (userDocSnap.exists()) {
//       await updateDoc(userDocRef, { [`shloka${shlokaId}`]: newStatus });
//     } else {
//       await setDoc(userDocRef, { [`shloka${shlokaId}`]: newStatus });
//     }
//   };

//   const ShlokaCard = ({ shloka }) => {
//     const completed = !!completionStatuses[`shloka${shloka.id}`];
  
//     const handleCompletionPress = () => {
//       setSelectedShlokaId(shloka.id);
//       toggleCompletionStatus(shloka.id, !completed);
//     };
  
//     const sanskritLippyWithLineBreaks = shloka.sanskritLippy.replace(/\n/g, '\n');
  
//     return (
//       <Card style={[styles.card, completed && styles.cardCompleted]}>
//         <Card.Content>
//           <Title>{shloka.shlokas}</Title>
//           <View style={styles.divider} />
//           <Title style={{ fontSize: 14, fontWeight: 'bold'}}>Sanskrit</Title>
//           <Paragraph>{sanskritLippyWithLineBreaks}</Paragraph>
//           <View style={styles.divider} />
//           <Title style={{ fontSize: 14, fontWeight: 'bold'}}>English</Title>
//           <Paragraph>{shloka.englishText}</Paragraph>
//           <View style={styles.divider} />
//           <Title style={{ fontSize: 14, fontWeight: 'bold'}}>Gujarati</Title>
//           <Paragraph>{shloka.gujaratiText}</Paragraph>
//         </Card.Content>
//         <Card.Actions style={styles.cardActions}>
//           <Button
//             style={styles.button}
//             labelStyle={styles.buttonLabel}
//             onPress={handleCompletionPress}
//             textColor='white'
//           >
//             {completed ? "Mark Incomplete" : "Mark Complete"}
//           </Button>
//           <TouchableOpacity onPress={() => playShloka(shloka)}>
//             <Icon name="play-circle" size={40} color={colors.primary} />
//           </TouchableOpacity>
//         </Card.Actions>
//       </Card>
//     );
//   };
   

//   const MiniPlayer = () => {
//     if (!currentShloka) return null;
  
//     const togglePlayPause = async () => {
//       if (isPlaying) {
//         await sound.pauseAsync();
//       } else {
//         await sound.playAsync();
//       }
//       setIsPlaying(!isPlaying);
//     };

//     const onSliderValueChange = async (value) => {
//       if (sound) {
//         const newPosition = value * audioDuration;
//         await sound.setPositionAsync(newPosition);
//         setAudioPosition(newPosition);
//       }
//     };
  
//     return (
//       <View style={styles.miniPlayer}>
//         <Text style={styles.miniPlayerText}>{currentShloka.shlokas}</Text>
//         <TouchableOpacity onPress={togglePlayPause} style={{ marginLeft: 10}}>
//           <Icon name={isPlaying ? 'pause' : 'play'} size={30} color="white" />
//         </TouchableOpacity>
//         <Slider
//           style={styles.slider}
//           minimumValue={0}
//           maximumValue={1}
//           value={audioPosition / audioDuration || 0}
//           minimumTrackTintColor="#FFFFFF"
//           maximumTrackTintColor="#000000"
//           thumbTintColor="#FFFFFF"
//           onSlidingComplete={onSliderValueChange}
//         />
//       </View>
//     );
//   };

//   useLayoutEffect(() => {
//     const completedShlokasCount = Object.values(completionStatuses).filter(status => status).length;
//     const totalShlokasCount = shlokas.length;
    
//     navigation.setOptions({
//       headerRight: () => (
//         <Text style={{ marginRight: 16, fontSize: 18 }}>
//           {completedShlokasCount}/{totalShlokasCount}
//         </Text>
//       ),
//     });
//   }, [navigation, completionStatuses, shlokas]);

//   if (isLoading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={colors.primary} />
//       </View>
//     );
//   }

//   return (
//     <View style={{ flex: 1 }}>
//       <View style={styles.headerContainer}>
//         <View style={styles.buttonContainer}>
//           <Button
//             icon="music"
//             mode="contained"
//             onPress={() => navigation.navigate("Kirtans")}
//             style={styles.button}
//             labelStyle={styles.buttonLabel}
//             compact
//           >
//             Kirtans
//           </Button>
//           <Button
//             mode="contained"
//             onPress={() => navigation.navigate("PBP")}
//             style={styles.button}
//             labelStyle={styles.buttonLabel}
//           >
//             Purshottam Bolya Prite
//           </Button>
//         </View>
//       </View>
//       <FlatList
//         style={{ marginBottom: 45}}
//         data={shlokas}
//         renderItem={({ item }) => <ShlokaCard shloka={item} />}
//         keyExtractor={(item) => item.id.toString()}
//       />
//       <MiniPlayer />
//       <Modal
//         visible={isAccessCodeModalVisible}
//         onRequestClose={() => setIsAccessCodeModalVisible(false)}
//         transparent
//         animationType="slide"
//       >
//         <View style={styles.modalContainer}>
//           <View style={styles.modalContent}>
//           <TouchableOpacity
//               style={styles.closeButton}
//               onPress={() => setIsAccessCodeModalVisible(false)}
//             >
//               <Icon name="close" size={30} color={colors.primary} />
//             </TouchableOpacity>
//             <Text style={styles.modalTitle}>Enter Access Code</Text>
//             <TextInput
//               style={styles.accessCodeInput}
//               placeholder="Access Code"
//               value={accessCodeInput}
//               onChangeText={(text) => setAccessCodeInput(text)}
//               secureTextEntry
//             />
//             <Button
//               title="Submit"
//               textColor='white'
//               style={styles.submitButton}
//               onPress={() => {
//                 if (accessCodeInput === ACCESS_CODE) {
//                   toggleCompletionStatus(selectedShlokaId);
//                   setIsAccessCodeModalVisible(false);
//                   setAccessCodeInput('');
//                 } else {
//                   alert("Incorrect access code.");
//                 }
//               }}
//             >
//               Submit
//             </Button>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   headerContainer: {
//     backgroundColor: '#EFEFEF',
//     paddingVertical: 20,
//     paddingHorizontal: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   card: {
//     margin: 10,
//     backgroundColor: '#ffffff',
//   },
//   cardCompleted: {
//     backgroundColor: "#e6ffe6",
//     borderColor: '#4CAF50',
//     borderWidth: 1
//   },
//   miniPlayer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: 60,
//     backgroundColor: colors.accent,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 10,
//     borderTopRightRadius: 10,
//     borderTopLeftRadius: 10
//   },
//   miniPlayerText: {
//     color: 'white',
//     fontSize: 19,
//     marginRight: 20
//   },
//   slider: {
//     flex: 1,
//     height: 40,
//     marginLeft: 20,
//     marginRight: 0,
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     padding: 20,
//     borderRadius: 10,
//     width: '80%',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 15,
//   },
//   accessCodeInput: {
//     borderColor: 'gray',
//     borderWidth: 1,
//     padding: 10,
//     marginBottom: 15,
//   },
//   buttonContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginBottom: 5,
//   },
//   button: {
//     backgroundColor: colors.accent,
//     flex: 1,
//     marginHorizontal: 5,
//     borderRadius: 20,
//   },
//   buttonLabel: {
//     fontSize: 15,
//   },
//   centered: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   cardActions: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 10
//   },
//   divider: {
//     borderBottomWidth: 1,
//     borderBottomColor: 'lightgray',
//     marginVertical: 5,
//   },
//   closeButton: {
//     alignSelf: 'flex-end',
//     marginBottom: 10,
//   },
//   submitButton: {
//     backgroundColor: colors.accent,
//     marginTop: 10,
//   },
// });

// export default MukhpathScreen;


import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { database, auth } from '../../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Audio } from 'expo-av';
import { useNavigation } from "@react-navigation/native";
import colors from '../../colors';
import Slider from '@react-native-community/slider';

const MukhpathScreen = () => {
  const [shlokas, setShlokas] = useState([]);
  const [currentShloka, setCurrentShloka] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completionStatuses, setCompletionStatuses] = useState({});
  const [isAccessCodeModalVisible, setIsAccessCodeModalVisible] = useState(false);
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [isLoading, setLoading] = useState(true);
  const [selectedShlokaId, setSelectedShlokaId] = useState(null);
  const [audioPosition, setAudioPosition] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentAudioType, setCurrentAudioType] = useState(null); // New state to track current audio type

  const navigation = useNavigation();

  const ACCESS_CODE = '1933';

  const fetchCompletionStatuses = useCallback(async () => {
    const userDocRef = doc(database, 'userMukhpathsSD', auth.currentUser.email);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      setCompletionStatuses(userDocSnap.data());
    }
  }, []);

  const fetchShlokas = useCallback(async () => {
    setLoading(true);
    try {
      const shlokaDataRef = doc(database, 'SCubedData', 'SatsangDikshaData');
      const shlokaDataSnap = await getDoc(shlokaDataRef);
      if (shlokaDataSnap.exists()) {
        setShlokas(shlokaDataSnap.data().data);
      } else {
        console.log('No shloka data found in Firestore.');
      }
    } catch (error) {
      console.error('Error fetching shlokas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const setAudioMode = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (e) {
        console.log(e);
      }
    };

    setAudioMode();
    fetchCompletionStatuses();
    fetchShlokas();
  }, [fetchCompletionStatuses, fetchShlokas]);

  useEffect(() => {
    return sound ? () => sound.unloadAsync() : undefined;
  }, [sound]);

  const playShloka = async (shloka, audioType) => {
    if (sound) {
      await sound.unloadAsync();
    }
  
    try {
      const audioURL = audioType === 'sanskrit' ? shloka.audioURL : shloka.audioURL1;
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioURL });
      setSound(newSound);
      setCurrentShloka(shloka);
      setCurrentAudioType(audioType);
      setIsPlaying(true);
  
      newSound.setOnPlaybackStatusUpdate(updatePlaybackStatus);
      await newSound.playAsync();
    } catch (error) {
      console.error("Error loading audio:", error);
    }
  };
  
  const updatePlaybackStatus = (status) => {
    setIsPlaying(status.isPlaying);
    setAudioPosition(status.positionMillis);
    setAudioDuration(status.durationMillis);
  };

  const toggleCompletionStatus = async (shlokaId, requireAccessCode = false) => {
    if (requireAccessCode && accessCodeInput !== ACCESS_CODE) {
      setSelectedShlokaId(shlokaId);
      setIsAccessCodeModalVisible(true);
      return;
    }
  
    const newStatus = !completionStatuses[`shloka${shlokaId}`];
  
    setCompletionStatuses(prevStatuses => ({
      ...prevStatuses,
      [`shloka${shlokaId}`]: newStatus
    }));
  
    const userDocRef = doc(database, 'userMukhpathsSD', auth.currentUser.email);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      await updateDoc(userDocRef, { [`shloka${shlokaId}`]: newStatus });
    } else {
      await setDoc(userDocRef, { [`shloka${shlokaId}`]: newStatus });
    }
  };

  const ShlokaCard = ({ shloka }) => {
    const completed = !!completionStatuses[`shloka${shloka.id}`];
  
    const handleCompletionPress = () => {
      setSelectedShlokaId(shloka.id);
      toggleCompletionStatus(shloka.id, !completed);
    };
  
    const sanskritLippyWithLineBreaks = shloka.sanskritLippy.replace(/\n/g, '\n');
  
    return (
      <Card style={[styles.card, completed && styles.cardCompleted]}>
        <Card.Content>
          <Title>{shloka.shlokas}</Title>
          <Title style={{ fontSize: 14, fontWeight: 'bold' }}>Gujarati</Title>
          <Paragraph>{shloka.gujaratiText}</Paragraph>
          <TouchableOpacity onPress={() => playShloka(shloka, 'gujarati')}>
            <Ionicons name="play-circle" size={40} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <Title style={{ fontSize: 14, fontWeight: 'bold' }}>Sanskrit</Title>
          <Paragraph>{sanskritLippyWithLineBreaks}</Paragraph>
          <TouchableOpacity onPress={() => playShloka(shloka, 'sanskrit')}>
            <Ionicons name="play-circle" size={40} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <Title style={{ fontSize: 14, fontWeight: 'bold' }}>English</Title>
          <Paragraph>{shloka.englishText}</Paragraph>
          <View style={styles.divider} />
        </Card.Content>
        <Card.Actions style={styles.cardActions}>
          <Button
            style={styles.button}
            labelStyle={styles.buttonLabel}
            onPress={handleCompletionPress}
            textColor='white'
          >
            {completed ? "Mark Incomplete" : "Mark Complete"}
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  const MiniPlayer = () => {
    if (!currentShloka) return null;
  
    const togglePlayPause = async () => {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    };

    const onSliderValueChange = async (value) => {
      if (sound) {
        const newPosition = value * audioDuration;
        await sound.setPositionAsync(newPosition);
        setAudioPosition(newPosition);
      }
    };
  
    return (
      <View style={styles.miniPlayer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.miniPlayerText}>{currentShloka.shlokas}</Text>
          <Text style={styles.audioTypeText}> ({currentAudioType === 'sanskrit' ? 'Sanskrit' : 'Gujarati'})</Text>
        </View>
        <TouchableOpacity onPress={togglePlayPause} style={{ marginLeft: 10 }}>
          <Ionicons name={isPlaying ? 'pause' : 'play'} size={30} color="white" />
        </TouchableOpacity>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={audioPosition / audioDuration || 0}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
          thumbTintColor="#FFFFFF"
          onSlidingComplete={onSliderValueChange}
        />
      </View>
    );
  };

  useLayoutEffect(() => {
    const completedShlokasCount = Object.values(completionStatuses).filter(status => status).length;
    const totalShlokasCount = shlokas.length;
    
    navigation.setOptions({
      headerRight: () => (
        <Text style={{ marginRight: 16, fontSize: 18 }}>
          {completedShlokasCount}/{totalShlokasCount}
        </Text>
      ),
    });
  }, [navigation, completionStatuses, shlokas]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff8e1' }}>
      <View style={styles.headerContainer}>
        <View style={styles.buttonContainer}>
          <Button
            icon="music"
            mode="contained"
            onPress={() => navigation.navigate("Kirtans")}
            style={styles.button}
            labelStyle={styles.buttonLabel}
            compact
          >
            Kirtans
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.navigate("PBP")}
            style={styles.button}
            labelStyle={styles.buttonLabel}
          >
            Purshottam Bolya Prite
          </Button>
        </View>
      </View>
      <FlatList
        style={{ marginBottom: 45 }}
        data={shlokas}
        renderItem={({ item }) => <ShlokaCard shloka={item} />}
        keyExtractor={(item) => item.id.toString()}
      />
      <MiniPlayer />
      <Modal
        visible={isAccessCodeModalVisible}
        onRequestClose={() => setIsAccessCodeModalVisible(false)}
        transparent
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsAccessCodeModalVisible(false)}
            >
              <Ionicons name="close" size={30} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Enter Access Code</Text>
            <TextInput
              style={styles.accessCodeInput}
              placeholder="Access Code"
              value={accessCodeInput}
              onChangeText={(text) => setAccessCodeInput(text)}
              secureTextEntry
            />
            <Button
              title="Submit"
              textColor='white'
              style={styles.submitButton}
              onPress={() => {
                if (accessCodeInput === ACCESS_CODE) {
                  toggleCompletionStatus(selectedShlokaId);
                  setIsAccessCodeModalVisible(false);
                  setAccessCodeInput('');
                } else {
                  alert("Incorrect access code.");
                }
              }}
            >
              Submit
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: 'transparent',
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    margin: 10,
    backgroundColor: '#ffffff',
  },
  cardCompleted: {
    backgroundColor: "#e6ffe6",
    borderColor: '#4CAF50',
    borderWidth: 1
  },
  miniPlayer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10
  },
  miniPlayerText: {
    color: 'white',
    fontSize: 19,
    marginRight: 5,
  },
  audioTypeText: {
    color: 'white',
    fontSize: 12,
  },
  slider: {
    flex: 1,
    height: 40,
    marginLeft: 20,
    marginRight: 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  accessCodeInput: {
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
    backgroundColor: 'transparent'
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
    marginVertical: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: colors.accent,
    marginTop: 10,
  },
});

export default MukhpathScreen;
