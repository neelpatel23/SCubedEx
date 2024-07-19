import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Card, Paragraph } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { database } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../colors';
import { TabView, TabBar } from 'react-native-tab-view';

const FoodMenu = () => {
  const [foodMenu, setFoodMenu] = useState({});
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState([]);

  const fetchFoodMenuFromStorage = async () => {
    const cachedFoodMenu = await AsyncStorage.getItem('foodMenu');
    return cachedFoodMenu ? JSON.parse(cachedFoodMenu) : null;
  };

  const saveFoodMenuToStorage = async (menu) => {
    if (menu) {
      await AsyncStorage.setItem('foodMenu', JSON.stringify(menu));
    }
  };

  const fetchFoodMenuFromFirebase = async () => {
    const menuDocRef = doc(database, 'SCubedData', 'foodOptionsMenu');
    const docSnap = await getDoc(menuDocRef);

    if (docSnap.exists() && docSnap.data().data) {
      const data = docSnap.data().data;
      if (Array.isArray(data) && data.length > 0 && data[0].mealPlan) {
        console.log(data[0].mealPlan)
        return data[0].mealPlan;
      } else {
        console.log("mealPlan not found in the fetched data array.");
        return null;
      }
    } else {
      console.log("No document or 'data' field found in Firestore.");
      return null;
    }
  };

  useEffect(() => {
    const initializeFoodMenu = async () => {
      setLoading(true);
      const cachedMenu = await fetchFoodMenuFromStorage();
      const fetchedMenu = await fetchFoodMenuFromFirebase();

      if (fetchedMenu) {
        setFoodMenu(fetchedMenu);
        saveFoodMenuToStorage(fetchedMenu);
      } else if (cachedMenu) {
        setFoodMenu(cachedMenu);
      }

      setLoading(false);
    };

    initializeFoodMenu();
  }, []);

  useEffect(() => {
    const dayOrder = ["25th-Arrival", "26 (For Lunch Outside)", "27", "28-Departure"];
    const orderedDays = dayOrder
      .filter(day => foodMenu.hasOwnProperty(day))
      .map(day => ({ key: day, title: formatDayTitle(day) }));
    setRoutes(orderedDays);
  }, [foodMenu]);
  

  const formatDayTitle = (day) => {
    const dayMappings = {
      "25th-Arrival": "Dec 25",
      "26 (For Lunch Outside)": "Dec 26",
      "27": "Dec 27",
      "28-Departure": "Dec 28"
    };
    return dayMappings[day] || day;
  };

  const formatMenuItems = (menu) => {
    if (!menu) {
      // If menu is empty, return "Not available"
      return <Text style={styles.bulletItem}>• Not available</Text>;
    }
    return menu.split(/,(?![^(]*\))/g).map((item, index) => (
      <Text key={index} style={styles.bulletItem}>• {item.trim()}</Text>
    ));
  };

  const mealOrder = ['Breakfast', 'Lunch', 'Dinner', 'Drinks', "Deserts"];

  const renderScene = ({ route }) => {
    const meals = foodMenu[route.key] || {};
  
    // Sort the meal entries based on the predefined meal order
    const sortedMeals = Object.entries(meals)
      .filter(([key]) => key !== 'id' && key !== 'icon')
      .sort(([keyA], [keyB]) => mealOrder.indexOf(keyA) - mealOrder.indexOf(keyB));
  
    return (
      <ScrollView style={styles.scene}>
        <View style={styles.slide}>
          {sortedMeals.map(([mealTime, mealInfo], index) => (
            <Card key={index} style={styles.card}>
              <Card.Title 
                title={mealTime}
                left={(props) => <Icon {...props} name={mealTime === 'Deserts' ? 'cake' : mealInfo.icon} size={24} />}
                titleStyle={styles.cardTitle}
              />
              <Card.Content>
                {mealTime === 'Deserts' ? (
                  <Paragraph style={styles.paragraph}>{mealInfo.menu}</Paragraph>
                ) : (
                  <View>{formatMenuItems(mealInfo.menu)}</View>
                )}
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>
    );
  };
    
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: '100%' }}
      renderTabBar={props => 
        <TabBar 
          {...props} 
          style={styles.tabBar} 
          labelStyle={styles.tabLabel} 
          indicatorStyle={styles.tabIndicator}
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  scene: {
    flex: 1,
  },
  slide: {
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabBar: {
    backgroundColor: colors.universalBg,
    // Add other styles for the tab bar here if needed
  },
  tabLabel: {
    color: 'black', // Change the text color
    fontSize: 16, // Optional: Change the font size if needed
  },
  tabIndicator: {
    backgroundColor: colors.primary, // Change the indicator color
    height: 3, // Optional: Adjust the height of the indicator
  },
  card: {
    marginBottom: 10,
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  paragraph: {
    fontSize: 16,
    color: '#555555',
  },
  bulletItem: {
    fontSize: 16,
    color: '#555555',
    marginBottom: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FoodMenu;
