import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Card, Title } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { doc, getDoc, setDoc, updateDoc, getFirestore } from 'firebase/firestore';
import { auth } from '../config/firebase';
import colors from '../colors';

const IQQuizScreen = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quizQuestions, setQuizQuestions] = useState([]);

  const userEmail = auth.currentUser?.email;
  const database = getFirestore();

  useEffect(() => {
    const fetchQuizData = async () => {
      setLoading(true);
      try {
        if (userEmail) {
          const userQuizRef = doc(database, 'userIQQuizzes', userEmail);
          const userDocSnap = await getDoc(userQuizRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            setSelectedAnswers(data.answers);
            setScore(data.score);
            setIsQuizCompleted(true);
            console.log('User quiz data:', data);
          }
        }

        const questionsRef = doc(database, 'SCubedData', 'IQQuestions');
        const questionsSnap = await getDoc(questionsRef);
        if (questionsSnap.exists()) {
          const questionsData = questionsSnap.data();
          const formattedQuestions = Object.values(questionsData).map(question => ({
            ...question,
            id: question.id.toString(), // Ensure ID is a string
          }));
          setQuizQuestions(formattedQuestions);
          console.log('IQ Questions data:', questionsData);
        } else {
          console.log("No IQ questions found in Firestore.");
        }
      } catch (error) {
        console.error("Error fetching quiz data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [userEmail]);

  const handleAnswerPress = (answer) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: answer });
  };

  const handleNextPress = () => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    if (selectedAnswers[currentQuestionIndex] === currentQuestion.correctAnswer) {
      setScore(score + 1);
    }
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setIsQuizCompleted(true);
      saveQuizData({ answers: selectedAnswers, score: score });
    }
  };

  const handlePreviousPress = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitPress = () => {
    let finalScore = 0;
    quizQuestions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        finalScore += 1;
      }
    });
    setScore(finalScore);
    setIsQuizCompleted(true);
    saveQuizData({ answers: selectedAnswers, score: finalScore });
  };

  const saveQuizData = async (data) => {
    if (userEmail) {
      const userQuizRef = doc(database, 'userIQQuizzes', userEmail);
      try {
        const docSnap = await getDoc(userQuizRef);
        if (docSnap.exists()) {
          await updateDoc(userQuizRef, data);
        } else {
          await setDoc(userQuizRef, data);
        }
      } catch (error) {
        console.error("Error saving quiz data: ", error);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isQuizCompleted) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.scoreText}>Your Score: {score} / {quizQuestions.length}</Text>
        {quizQuestions.map((question, index) => (
          <Card key={question.id} style={styles.card}>
            <Card.Content>
              <Title style={styles.questionText}>{question.question}</Title>
              <View style={styles.divider} />
              {question.options.map((option, idx) => {
                let optionStyle = styles.optionButton;
                if (selectedAnswers[index] === option) {
                  optionStyle = styles.selectedOptionButton;
                }
                if (option === question.correctAnswer) {
                  optionStyle = styles.correctOptionButton;
                }

                return (
                  <TouchableOpacity
                    key={idx}
                    style={optionStyle}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
            </Card.Content>
          </Card>
        ))}
      </ScrollView>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal
        contentContainerStyle={styles.progressScrollView} 
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.progressContainer}>
          {quizQuestions.map((question, index) => (
            <Ionicons
              key={question.id}
              name="ellipse"
              size={24}
              color={selectedAnswers[index] ? 'green' : 'gray'}
              style={styles.progressIcon}
            />
          ))}
        </View>
      </ScrollView>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.questionText}>{currentQuestion?.question}</Title>
          <View style={styles.divider} />
          {currentQuestion?.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestionIndex] === option;
            const optionStyle = isSelected ? styles.selectedOptionButton : styles.optionButton;
  
            return (
              <TouchableOpacity
                key={index}
                style={optionStyle}
                onPress={() => handleAnswerPress(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            );
          })}
        </Card.Content>
      </Card>
      <View style={styles.navigationButtons}>
        {currentQuestionIndex > 0 && (
          <TouchableOpacity style={styles.navButton} onPress={handlePreviousPress}>
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        {currentQuestionIndex < quizQuestions.length - 1 ? (
          <TouchableOpacity style={styles.navButton} onPress={handleNextPress}>
            <Text style={styles.navButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.navButton} onPress={handleSubmitPress}>
            <Text style={styles.navButtonText}>Submit</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );  
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff8e1',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.universalBg,
  },
  progressScrollView: {
    paddingHorizontal: 10,
    marginBottom: 0,

  },
  progressContainer: {
    marginBottom: 0,
    flexDirection: 'row',
    // paddingVertical: 10,
  },
  progressIcon: {
    marginHorizontal: 5,
  },
  card: {
    width: '100%',
    // marginBottom: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
    marginVertical: 10,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  optionButton: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedOptionButton: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: colors.primary,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  correctOptionButton: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#d4edda',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  navButton: {
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    width: '45%',
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default IQQuizScreen;
