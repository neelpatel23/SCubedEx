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
import { useNavigation } from "@react-navigation/native";


import colors from '../../colors';

const PBPScreen = () => {
  const [quotations, setQuotations] = useState([]);
  const [completionStatuses, setCompletionStatuses] = useState({});
  const [isAccessCodeModalVisible, setIsAccessCodeModalVisible] = useState(false);
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [isLoading, setLoading] = useState(true);
  const [selectedQuotationId, setSelectedQuotationId] = useState(null);

  const navigation = useNavigation();

  const ACCESS_CODE = '1933';

  const fetchCompletionStatuses = useCallback(async () => {
    const userDocRef = doc(database, 'userMukhpathsPBP', auth.currentUser.email);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      setCompletionStatuses(userDocSnap.data());
    }
  }, []);

  const fetchQuotations = useCallback(async () => {
    setLoading(true);
    try {
      const quotationDataRef = doc(database, 'SCubedData', 'PBPData');
      const quotationDataSnap = await getDoc(quotationDataRef);
      if (quotationDataSnap.exists()) {
        setQuotations(quotationDataSnap.data().data);
      } else {
        console.log('No PBP data found in Firestore.');
      }
    } catch (error) {
      console.error('Error fetching PBP:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompletionStatuses();
    fetchQuotations();
  }, [fetchCompletionStatuses, fetchQuotations]);

  const toggleCompletionStatus = async (quotationId, requireAccessCode = false) => {
    if (requireAccessCode && accessCodeInput !== ACCESS_CODE) {
      setSelectedQuotationId(quotationId);
      setIsAccessCodeModalVisible(true);
      return;
    }
  
    const newStatus = !completionStatuses[`quotation${quotationId}`];
  
    // Update local state
    setCompletionStatuses(prevStatuses => ({
      ...prevStatuses,
      [`quotation${quotationId}`]: newStatus
    }));
  
    // Update Firebase
    const userDocRef = doc(database, 'userMukhpathsPBP', auth.currentUser.email);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      await updateDoc(userDocRef, { [`quotation${quotationId}`]: newStatus });
    } else {
      await setDoc(userDocRef, { [`quotation${quotationId}`]: newStatus });
    }
  };
  

  const QuotationCard = ({ quotation }) => {
    const completed = !!completionStatuses[`quotation${quotation.id}`]; // Ensure correct ID reference
  
    const handleCompletionPress = () => {
      setSelectedQuotationId(quotation.id); // Set the selected quotation ID
      toggleCompletionStatus(quotation.id, !completed); // Toggle the completion status
    };
  
    return (
      <Card style={[styles.card, completed && styles.cardCompleted]}>
        <Card.Content>
          <Title>{quotation.name}</Title>
          <View style={styles.divider} />
          <Paragraph>{quotation.gujarati}</Paragraph>
          <View style={styles.divider} />
          <Paragraph>{quotation.english}</Paragraph>
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
  
   
  useLayoutEffect(() => {
    // Calculate completed shlokas count
    const completedKirtansCount = Object.values(completionStatuses).filter(status => status).length;
    // Calculate total number of shlokas
    const totalQuotationCount = quotations.length
    
    // Update the header counter in real-time
    navigation.setOptions({
      headerRight: () => (
        <Text style={{ marginRight: 16, fontSize: 18 }}>
          {completedKirtansCount}/{totalQuotationCount}
        </Text>
      ),
    });
  }, [navigation, completionStatuses, quotations]);

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
        data={quotations}
        renderItem={({ item }) => <QuotationCard quotation={item} />}
        keyExtractor={(item) => item.id.toString()}
      />
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
                  toggleCompletionStatus(selectedQuotationId);
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
submitButton: {
    backgroundColor: colors.accent, // Set the button background color
    marginTop: 10, // Adjust as needed
    },
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
});

export default PBPScreen;

