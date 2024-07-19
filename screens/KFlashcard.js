import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Text, ActivityIndicator } from 'react-native';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, database } from '../config/firebase';
import FlashcardComponent from './FlashcardComponent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../colors';

const FlashcardScreenKishores = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const userEmail = auth.currentUser?.email;

  const fetchQuestionsFromFirestore = async () => {
    const questionsRef = doc(database, 'SCubedData', 'questionsKishores');
    const docSnap = await getDoc(questionsRef);
    return docSnap.exists() ? docSnap.data().data : [];
  };

  const fetchAnswersFromFirestore = async () => {
    if (userEmail) {
      const answersRef = doc(database, 'KanswersQA', userEmail);
      const docSnap = await getDoc(answersRef);
      return docSnap.exists() ? docSnap.data() : {};
    }
    return {};
  };

  const saveToAsyncStorage = async (key, value) => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  };

  const getFromAsyncStorage = async (key) => {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      const cachedQuestions = await getFromAsyncStorage('kishoresQuestions');
      const cachedAnswers = await getFromAsyncStorage('kishoresAnswers');

      const firestoreQuestions = await fetchQuestionsFromFirestore();
      const firestoreAnswers = await fetchAnswersFromFirestore();

      if (JSON.stringify(cachedQuestions) !== JSON.stringify(firestoreQuestions)) {
        saveToAsyncStorage('kishoresQuestions', firestoreQuestions);
        setQuestions(firestoreQuestions);
      } else if (cachedQuestions) {
        setQuestions(cachedQuestions);
      }

      if (JSON.stringify(cachedAnswers) !== JSON.stringify(firestoreAnswers)) {
        saveToAsyncStorage('kishoresAnswers', firestoreAnswers);
        setAnswers(firestoreAnswers);
      } else if (cachedAnswers) {
        setAnswers(cachedAnswers);
      }

      setLoading(false);
    };

    initializeData();
  }, [userEmail]);

  const handleAnswerSubmit = async (questionId, answer) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    if (userEmail) {
      const answersRef = doc(database, 'KanswersQA', userEmail);
      try {
        await setDoc(answersRef, newAnswers, {merge: true});
        await AsyncStorage.setItem('kishoreAnswers', JSON.stringify(newAnswers));
      } catch (error) {
        console.error('Error saving answer:', error);
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={questions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <FlashcardComponent
            question={item}
            onSubmitAnswer={handleAnswerSubmit}
            previousAnswer={answers[item.id]}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: colors.universalBg,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FlashcardScreenKishores;
