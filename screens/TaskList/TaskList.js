import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Alert, Linking } from 'react-native';
import { Card, Checkbox } from 'react-native-paper';
import { doc, getDoc, updateDoc, setDoc, getFirestore } from 'firebase/firestore';
import { auth } from '../../config/firebase';
import { useNavigation } from "@react-navigation/native";
import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../../colors';

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInputs, setUserInputs] = useState({});
  const navigation = useNavigation();
  const userEmail = auth.currentUser?.email;

  const database = getFirestore();

  const saveTasksToStorage = async (tasks) => {
    await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate("Mukhpath")}>
          <Ionicons name="book-outline" size={30} color={colors.primary} style={styles.iconStyle} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const tasksDocRef = doc(database, 'SCubedData', 'tasks');
        const docSnap = await getDoc(tasksDocRef);
    
        if (!docSnap.exists()) {
          console.log("Tasks document does not exist in Firestore.");
          return;
        }
    
        const fetchedTasks = docSnap.data().data;
    
        const updatedTasks = fetchedTasks.map(task => ({
          ...task,
          completed: false,
          answer: '' // Initialize answer field for each task
        }));
    
        setTasks(updatedTasks);
    
        if (userEmail) {
          const userTasksRef = doc(database, 'userTasks', userEmail);
          const userDocSnap = await getDoc(userTasksRef);
          if (userDocSnap.exists()) {
            const firestoreTasks = userDocSnap.data().tasks;
            const mergedTasks = updatedTasks.map(task => ({
              ...task,
              completed: firestoreTasks.find(fTask => fTask.id === task.id)?.completed || false,
              answer: firestoreTasks.find(fTask => fTask.id === task.id)?.answer || ''
            }));
            setTasks(mergedTasks);
            saveTasksToStorage(mergedTasks);
          }
        }
      } catch (error) {
        console.error("Error fetching tasks: ", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
  }, [userEmail]);

  const handleInputChange = (taskId, text) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === taskId) {
        return { ...task, answer: text };
      }
      return task;
    }));
  };

  const handleToggleTask = async (taskId) => {
    const updatedTasks = tasks.map(task => ({
      ...task,
      completed: task.id === taskId ? !task.completed : task.completed,
    }));

    if (userInputs[taskId]) {
      const taskIndex = updatedTasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        updatedTasks[taskIndex] = { ...updatedTasks[taskIndex], answer: userInputs[taskId] };
      }
    }

    setTasks(updatedTasks);

    if (userEmail) {
      const userTasksRef = doc(database, 'userTasks', userEmail);
      try {
        const docSnap = await getDoc(userTasksRef);
        if (docSnap.exists()) {
          await updateDoc(userTasksRef, { tasks: updatedTasks });
        } else {
          await setDoc(userTasksRef, { tasks: updatedTasks });
        }
      } catch (error) {
        console.error("Error updating or creating user tasks: ", error);
      }
      saveTasksToStorage(updatedTasks);
    }
  };

  const handleSubmitAnswer = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.answer) {
      Alert.alert("Input Required", "Please enter your answer before submitting.");
      return;
    }

    handleToggleTask(taskId);
  };

  const openURL = (url) => {
    Linking.openURL(url);
  };

  const renderTaskItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => handleToggleTask(item.id)}>
        <Card style={[styles.card, item.completed ? styles.cardCompleted : styles.cardPending]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.taskCheckbox}>
              <Checkbox
                status={item.completed ? 'checked' : 'unchecked'}
                color={item.completed ? colors.success : colors.primary}
              />
            </View>
            <View style={styles.taskDetails}>
              <Text style={styles.taskTitle}>{item.title}</Text>
              <Text style={styles.taskDescription}>{item.description}</Text>
              {item.userInput && (
                <TextInput
                  style={styles.input}
                  onChangeText={(text) => handleInputChange(item.id, text)}
                  value={item.answer}
                  placeholder="Enter your answer"
                  editable={!item.completed}
                />
              )}
            </View>
            {item.taskLink && (
              <TouchableOpacity onPress={() => openURL(item.taskLink)}>
                <Ionicons name="link" size={24} color={colors.primary} style={styles.linkIcon} />
              </TouchableOpacity>
            )}
            {item.userInput && (
              <TouchableOpacity onPress={() => handleSubmitAnswer(item.id)}>
                <Ionicons name="checkmark-circle" size={30} color={colors.primary} style={styles.submitIcon} />
              </TouchableOpacity>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size='large' color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.mainContainer}
      data={tasks}
      keyExtractor={(item) => item.id.toString()}
      renderItem={renderTaskItem}
    />
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: "#fff8e1"
  },
  linkIcon: {
    marginLeft: 10,
  },
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff8e1",
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginVertical: 7,
    marginHorizontal: 10,
    elevation: 5,
    borderRadius: 8,
    overflow: 'hidden',
    transform: [{ scale: 0.98 }],
  },
  cardCompleted: {
    backgroundColor: '#e6ffe6',
    borderWidth: 1,
    borderColor: '#b2ffb2',
  },
  cardPending: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCheckbox: {
    marginRight: 15,
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 8,
    borderRadius: 5,
    padding: 10,
  },
  submitIcon: {
    marginLeft: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.universalBg,
  },
  iconStyle: {
    marginRight: 15,
  },
});
