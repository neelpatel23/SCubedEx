import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { TextInput, Button, Card, Title, Paragraph, IconButton } from 'react-native-paper';
import { doc, getDoc, setDoc, getFirestore } from 'firebase/firestore';
import { auth } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../colors';

const MSMRuchiQuiz = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const userEmail = auth.currentUser?.email;
  const database = getFirestore();

  const correctAnswersCount = Object.keys(answers).length;
  const remainingQuestionsCount = questions.length - correctAnswersCount;


  const fetchQuestionsFromFirestore = async () => {
    const questionsRef = doc(database, 'SCubedData', 'MSMRuchiData');
    const docSnap = await getDoc(questionsRef);
    return docSnap.exists() ? docSnap.data().data : [];
  };

  const fetchAnswersFromFirestore = async () => {
    if (userEmail) {
      const answersRef = doc(database, 'ruchiAnswers', userEmail);
      const docSnap = await getDoc(answersRef);
      return docSnap.exists() ? docSnap.data() : {};
    }
    return {};
  };

  const getFromAsyncStorage = async (key) => {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  };

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      const cachedQuestions = await getFromAsyncStorage('MSMRuchiQuestions');
      const cachedAnswers = await getFromAsyncStorage('MSMRuchiAnswers');

      const firestoreQuestions = await fetchQuestionsFromFirestore();
      const firestoreAnswers = await fetchAnswersFromFirestore();

      if (JSON.stringify(cachedQuestions) !== JSON.stringify(firestoreQuestions)) {
        await AsyncStorage.setItem('MSMRuchiQuestions', JSON.stringify(firestoreQuestions));
        setQuestions(firestoreQuestions);
      } else if (cachedQuestions) {
        setQuestions(cachedQuestions);
      }

      if (JSON.stringify(cachedAnswers) !== JSON.stringify(firestoreAnswers)) {
        await AsyncStorage.setItem('MSMRuchiAnswers', JSON.stringify(firestoreAnswers));
        setAnswers(firestoreAnswers);
      } else if (cachedAnswers) {
        setAnswers(cachedAnswers);
      }

      setLoading(false);
    };

    initializeData();
  }, [userEmail]);

  const handleAnswerSubmit = async () => {
    const currentQ = questions[currentQuestion];
    if (currentQ && currentQ.Answer.toLowerCase() === userAnswer.toLowerCase()) {
      const newAnswers = { ...answers, [currentQ.id]: userAnswer };
      setAnswers(newAnswers);
      setUserAnswer('');

      if (userEmail) {
        const answersRef = doc(database, 'ruchiAnswers', userEmail);
        try {
          await setDoc(answersRef, newAnswers, { merge: true });
          await AsyncStorage.setItem('MSMRuchiAnswers', JSON.stringify(newAnswers));
          alert('Correct Answer!');
        } catch (error) {
          console.error('Error saving answer:', error);
        }
      }
    } else {
      alert('Wrong Answer, try again.');
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      alert('End of Quiz');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const isAnswered = (questionId) => {
    return answers.hasOwnProperty(questionId);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>Correct: {correctAnswersCount}</Text>
        <Text style={styles.statsText}>Remaining: {remainingQuestionsCount}</Text>
        <Text style={styles.statsText}>Question: {currentQuestion + 1} / {questions.length}</Text>
      </View>
      <Card style={styles.card}>
        <Card.Content>
          <Title>{questions[currentQuestion]?.Question}</Title>
          {isAnswered(questions[currentQuestion]?.id) ? (
            <Paragraph>Answered: {answers[questions[currentQuestion].id]}</Paragraph>
          ) : (
            <>
              <TextInput
                label="Your Answer"
                value={userAnswer}
                onChangeText={text => setUserAnswer(text)}
                style={styles.input}
              />
              <Button mode="contained" onPress={handleAnswerSubmit} style={styles.button}>
                Submit
              </Button>
            </>
          )}
          <View style={styles.navigationContainer}>
            <IconButton
              icon="arrow-left"
              size={20}
              onPress={previousQuestion}
              disabled={currentQuestion === 0}
            />
            {currentQuestion < questions.length - 1 && (
              <IconButton
                icon="arrow-right"
                size={20}
                onPress={nextQuestion}
              />
            )}
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: colors.universalBg,
    },
    card: {
      marginVertical: 10,
      padding: 10,
      borderRadius: 8,
      backgroundColor: colors.cardBg,
    },
    input: {
      marginVertical: 10,
      backgroundColor: colors.inputBg,
    },
    button: {
      marginVertical: 5,
      padding: 5,
      backgroundColor: colors.primary,
    },
    navigationContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 10,
    },
    statsText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    centerContent: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
export default MSMRuchiQuiz;
