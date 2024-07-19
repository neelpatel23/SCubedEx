import React, { useState, useEffect, useCallback, useLayoutEffect  } from 'react';
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
import { Card, Title, Paragraph, Button} from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { database, auth } from '../../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { Audio } from 'expo-av';
import { useNavigation } from "@react-navigation/native";
import Slider from '@react-native-community/slider';

import colors from '../../colors';

const KirtansScreen = () => {
  const [kirtans, setKirtans] = useState([]);
  const [currentKirtan, setCurrentKirtan] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completionStatuses, setCompletionStatuses] = useState({});
  const [isAccessCodeModalVisible, setIsAccessCodeModalVisible] = useState(false);
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [isLoading, setLoading] = useState(true);
  const [selectedKirtanId, setSelectedKirtanId] = useState(null);
  const [audioPosition, setAudioPosition] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);


  const navigation = useNavigation();

  const ACCESS_CODE = '1933';

  const fetchCompletionStatuses = useCallback(async () => {
    const userDocRef = doc(database, 'userMukhpathsKirtans', auth.currentUser.email);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      setCompletionStatuses(userDocSnap.data());
    }
  }, []);

  const fetchKirtans = useCallback(async () => {
    setLoading(true);
    try {
      const kirtanDataRef = doc(database, 'SCubedData', 'KirtansData');
      const kirtanDataSnap = await getDoc(kirtanDataRef);
      if (kirtanDataSnap.exists()) {
        setKirtans(kirtanDataSnap.data().data);
      } else {
        console.log('No Kirtan data found in Firestore.');
      }
    } catch (error) {
      console.error('Error fetching Kirtans:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompletionStatuses();
    fetchKirtans();
  }, [fetchCompletionStatuses, fetchKirtans]);

  useEffect(() => {
    return sound ? () => sound.unloadAsync() : undefined;
  }, [sound]);

  const playKirtan = async (kirtan) => {
    // Unload any previously playing sound
    if (sound) {
      await sound.unloadAsync();
    }
  
    // Load the new shloka sound
    try {
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: kirtan.audioURL });
      setSound(newSound);
      setCurrentKirtan(kirtan);
      setIsPlaying(true);
  
      // Play the sound
      await newSound.playAsync();
      newSound.setOnPlaybackStatusUpdate(updatePlaybackStatus);
    } catch (error) {
      console.error("Error loading audio:", error);
      // Handle any errors, such as showing a message to the user
    }
  };
  

  const updatePlaybackStatus = (status) => {
    setIsPlaying(status.isPlaying);
    setAudioPosition(status.positionMillis);
    setAudioDuration(status.durationMillis);
  };

  

  const toggleCompletionStatus = async (kirtanId, requireAccessCode = false) => {
    if (requireAccessCode && accessCodeInput !== ACCESS_CODE) {
      setSelectedKirtanId(kirtanId);
      setIsAccessCodeModalVisible(true);
      return;
    }
  
    const newStatus = !completionStatuses[`kirtan${kirtanId}`];
  
    // Update local state
    setCompletionStatuses(prevStatuses => ({
      ...prevStatuses,
      [`kirtan${kirtanId}`]: newStatus
    }));
  
    // Update Firebase
    const userDocRef = doc(database, 'userMukhpathsKirtans', auth.currentUser.email);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      await updateDoc(userDocRef, { [`kirtan${kirtanId}`]: newStatus });
    } else {
      await setDoc(userDocRef, { [`kirtan${kirtanId}`]: newStatus });
    }
  };
  

  const KirtanCard = ({ kirtan }) => {
    const completed = !!completionStatuses[`kirtan${kirtan.id}`];
  
    const handleCompletionPress = () => {
      setSelectedKirtanId(kirtan.id); // Set the selected shloka ID
      toggleCompletionStatus(kirtan.id, !completed); // Pass the flag to require access code
    };
  
    // Replace newline characters with line breaks
    // const sanskritLippyWithLineBreaks = shloka.sanskritLippy.replace(/\n/g, '\n');
  
    return (
      <Card style={[styles.card, completed && styles.cardCompleted]}>
        <Card.Content>
          <Title>{kirtan.kirtans}</Title>
          <View style={styles.divider} />
          <Paragraph>{kirtan.englishText}</Paragraph>
          <View style={styles.divider} />
          <Paragraph>{kirtan.englishDefinition}</Paragraph>
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
          <TouchableOpacity onPress={() => playKirtan(kirtan)}>
            <Ionicons name="play-circle" size={40} color={colors.primary} />
          </TouchableOpacity>
        </Card.Actions>
      </Card>
    );
  };
   

  const MiniPlayer = () => {
    if (!currentKirtan) return null;
  
    const togglePlayPause = async () => {
      if (isPlaying) {
        // Pause the audio
        await sound.pauseAsync();
      } else {
        // Play the audio
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying); // Toggle the play/pause state
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
        <Text style={styles.miniPlayerText}>{currentKirtan.kirtans}</Text>
        <TouchableOpacity onPress={togglePlayPause}>
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
    // Calculate completed shlokas count
    const completedKirtansCount = Object.values(completionStatuses).filter(status => status).length;
    // Calculate total number of shlokas
    const totalKirtansCount = kirtans.length;
    
    // Update the header counter in real-time
    navigation.setOptions({
      headerRight: () => (
        <Text style={{ marginRight: 16, fontSize: 18 }}>
          {completedKirtansCount}/{totalKirtansCount}
        </Text>
      ),
    });
  }, [navigation, completionStatuses, kirtans]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        style={{ marginBottom: 45}}
        data={kirtans}
        renderItem={({ item }) => <KirtanCard kirtan={item} />}
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
              textColor='white' // Set the text color
              style={styles.submitButton} // Set the button style
              onPress={() => {
                if (accessCodeInput === ACCESS_CODE) {
                  toggleCompletionStatus(selectedKirtanId);
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
    backgroundColor: '#EFEFEF',
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
    borderWidth: 2,
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
    marginRight: 20
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
    marginTop: 20,
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
    backgroundColor: colors.accent, // Set the button background color
    marginTop: 10, // Adjust as needed
  },
});

export default KirtansScreen;

