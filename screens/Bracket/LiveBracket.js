// import React, { useState, useEffect } from 'react';
// import { View, ScrollView, StyleSheet, TouchableOpacity, Modal, Text } from 'react-native';
// import bracketData from '../config/bracketData.json'; // Make sure the path is correct
// import colors from '../colors';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// import { TabView, TabBar } from 'react-native-tab-view';

// const LiveBracket = () => {
//   const [selectedMatch, setSelectedMatch] = useState(null);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [index, setIndex] = useState(0);
//   const [routes, setRoutes] = useState([]);

//   useEffect(() => {
//     const sports = Object.keys(bracketData);
//     const renamedRoutes = sports.map((sport) => {
//       let title;
//       switch(sport) {
//         case 'flagFootball':
//           title = 'Flag Football';
//           break;
//         case 'soccer':
//           title = 'Soccer';
//           break;
//         default:
//           title = sport; // Default case if you have more sports
//       }
//       return { key: sport, title: title };
//     });
//     setRoutes(renamedRoutes);
//   }, []);

//   const onMatchClick = (match) => {
//     setSelectedMatch(match);
//     setModalVisible(true);
//   };

//   const renderStats = (team) => {
//     return (
//       selectedMatch.stats[team] &&
//       Object.entries(selectedMatch.stats[team]).map(([key, value], index) => (
//         <Text key={index} style={styles.statText}>
//           {key}: {value}
//         </Text>
//       ))
//     );
//   };

//   const renderScene = ({ route }) => {
//     const sportData = bracketData[route.key];
//     return (
//       <ScrollView style={styles.scene}>
//         <View style={styles.container}>
//           {sportData.rounds.map((round, roundIndex) => (
//             <View key={roundIndex} style={styles.round}>
//               <Text style={styles.roundTitle}>{round.title}</Text>
//               {round.matches.map((match, matchIndex) => (
//                 <TouchableOpacity
//                   key={match.id}
//                   style={styles.match}
//                   onPress={() => onMatchClick(match)}
//                 >
//                   <View style={styles.teamContainer}>
//                     <Text style={styles.team}>{match.team1} - </Text>
//                     <Text style={styles.score}>{match.score1}</Text>
//                   </View>
//                   <Text style={styles.vsText}>VS</Text>
//                   <View style={styles.teamContainer}>
//                     <Text style={styles.team}>{match.team2} - </Text>
//                     <Text style={styles.score}>{match.score2}</Text>
//                   </View>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           ))}
//         </View>
//       </ScrollView>
//     );
//   };

//   if (modalVisible && selectedMatch) {
//     return (
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={modalVisible}
//         onRequestClose={() => setModalVisible(false)}
//       >
//         <View style={styles.modalContainer}>
//           <TouchableOpacity
//             style={styles.closeButton}
//             onPress={() => setModalVisible(false)}
//           >
//             <Icon name="close" size={24} color={colors.primary} />
//           </TouchableOpacity>
//           <View style={styles.modalContent}>
//             <View style={styles.teamStats}>
//               <Text style={styles.teamName}>{selectedMatch.team1}</Text>
//               {renderStats(selectedMatch.team1)}
//             </View>
//             <View style={styles.divider} />
//             <View style={styles.teamStats}>
//               <Text style={styles.teamName}>{selectedMatch.team2}</Text>
//               {renderStats(selectedMatch.team2)}
//             </View>
//           </View>
//         </View>
//       </Modal>
//     );
//   }

//   return (
//     <TabView
//       navigationState={{ index, routes }}
//       renderScene={renderScene}
//       onIndexChange={setIndex}
//       initialLayout={{ width: '100%' }}
//       renderTabBar={props => 
//         <TabBar 
//           {...props} 
//           style={styles.tabBar} 
//           labelStyle={styles.tabLabel} 
//           indicatorStyle={styles.tabIndicator}
//         />
//       }
//     />
//   );
// };

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Modal, Text, ActivityIndicator } from 'react-native';
import colors from '../../colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TabView, TabBar } from 'react-native-tab-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

const LiveBracket = () => {
  const [tournamentData, setTournamentData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState([]);

  // Fetch tournament data from Firestore
  const fetchTournamentDataFromFirestore = async () => {
    const tournamentDataRef = doc(database, 'SCubedData', 'tourneyData');
    const docSnap = await getDoc(tournamentDataRef);
    return docSnap.exists() ? docSnap.data().data : {};
  };

  // Fetch tournament data from AsyncStorage
  const fetchTournamentDataFromStorage = async () => {
    const cachedData = await AsyncStorage.getItem('tournamentData');
    return cachedData ? JSON.parse(cachedData) : {};
  };

  // Save tournament data to AsyncStorage
  const saveTournamentDataToStorage = async (data) => {
    await AsyncStorage.setItem('tournamentData', JSON.stringify(data));
  };

  // Initialize tournament data
  const initializeTournamentData = async () => {
    setLoading(true);
    const cachedData = await fetchTournamentDataFromStorage();
    const firestoreData = await fetchTournamentDataFromFirestore();

    if (JSON.stringify(cachedData) !== JSON.stringify(firestoreData)) {
      setTournamentData(firestoreData);
      saveTournamentDataToStorage(firestoreData);
    } else {
      setTournamentData(cachedData);
    }
    setLoading(false);
  };

  // Fetch and set data on component mount
  useEffect(() => {
    initializeTournamentData();
  }, []);

  // Update routes based on the fetched data
  useEffect(() => {
    const sports = Object.keys(tournamentData);
    const updatedRoutes = sports.map(sport => ({ key: sport, title: sport }));
    setRoutes(updatedRoutes);
  }, [tournamentData]);

  // Handle match click
  const onMatchClick = (match) => {
    setSelectedMatch(match);
    setModalVisible(true);
  };

  // Render match stats
  const renderStats = (team) => {
    return (
      selectedMatch?.stats[team] &&
      Object.entries(selectedMatch.stats[team]).map(([key, value], index) => (
        <Text key={index} style={styles.statText}>
          {key}: {value}
        </Text>
      ))
    );
  };

  // Render each tab's content
  const renderScene = ({ route }) => {
    const sportData = tournamentData[route.key];
    return (
      <ScrollView style={styles.scene}>
        <View style={styles.container}>
          {sportData?.rounds.map((round, roundIndex) => (
            <View key={roundIndex} style={styles.round}>
              <Text style={styles.roundTitle}>{round.title}</Text>
              {round.matches.map((match, matchIndex) => (
                <TouchableOpacity
                  key={match.id}
                  style={styles.match}
                  onPress={() => onMatchClick(match)}
                >
                  <View style={styles.teamContainer}>
                    <Text style={styles.team}>{match.team1} - </Text>
                    <Text style={styles.score}>{match.score1}</Text>
                  </View>
                  <Text style={styles.vsText}>VS</Text>
                  <View style={styles.teamContainer}>
                    <Text style={styles.team}>{match.team2} - </Text>
                    <Text style={styles.score}>{match.score2}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // Render modal for match details
  const renderModal = () => {
    if (!modalVisible || !selectedMatch) return null;

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Icon name="close" size={24} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.modalContent}>
            <View style={styles.teamStats}>
              <Text style={styles.teamName}>{selectedMatch.team1}</Text>
              {renderStats(selectedMatch.team1)}
            </View>
            <View style={styles.divider} />
            <View style={styles.teamStats}>
              <Text style={styles.teamName}>{selectedMatch.team2}</Text>
              {renderStats(selectedMatch.team2)}
            </View>
          </View>
        </View>
      </Modal>
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
    <>
      {renderModal()}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: '100%' }}
        renderTabBar={props => (
          <TabBar 
            {...props} 
            style={styles.tabBar} 
            labelStyle={styles.tabLabel} 
            indicatorStyle={styles.tabIndicator}
          />
        )}
      />
    </>
  );
};


const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff8e1',
  },
  container: {
    backgroundColor: "#fff8e1",
    padding: 30,
  },
  round: {
    marginBottom: 30,
  },
  roundTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  match: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  team: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 10,
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  vsText: {
    fontSize: 16,
    color: '#666',
  },
  tabBar: {
    backgroundColor: "#fff8e1",
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
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '50%', // Set the modal height to 50% of the screen
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden', // Add this to ensure content does not flow outside the rounded corners
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  modalContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  teamStats: {
    alignItems: 'center',
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    height: '100%',
    width: 1,
    backgroundColor: '#DDD',
    marginHorizontal: 20,
  },
  statText: {
    fontSize: 14,
    color: '#555',
  },
});

export default LiveBracket;
