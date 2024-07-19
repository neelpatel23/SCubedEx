import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { Card, Paragraph } from 'react-native-paper';
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from 'react-native-maps';
import { doc, getDoc } from 'firebase/firestore';
import { database } from '../config/firebase';
import Icon from 'react-native-vector-icons/MaterialIcons'; // or any other icon library
import AsyncStorage from '@react-native-async-storage/async-storage';
import colors from '../colors';

const Transportation = () => {
  const [pickupLocations, setPickupLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);


  useEffect(() => {
    const fetchPickupLocations = async () => {
      setLoading(true);
  
      try {
        const transportationRef = doc(database, 'SCubedData', 'transportation');
        const docSnap = await getDoc(transportationRef);
  
        if (docSnap.exists() && docSnap.data().data) {
          const data = docSnap.data().data;
          setPickupLocations(data);
          await AsyncStorage.setItem('pickupLocations', JSON.stringify(data));
        } else {
          console.log('No transportation document found in Firestore, or missing data field');
          const cachedData = await AsyncStorage.getItem('pickupLocations');
          if (cachedData) {
            setPickupLocations(JSON.parse(cachedData));
          }
        }
      } catch (error) {
        console.error('Error fetching transportation data:', error);
        const cachedData = await AsyncStorage.getItem('pickupLocations');
        if (cachedData) {
          setPickupLocations(JSON.parse(cachedData));
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchPickupLocations();
  }, []);

  const onCardPress = (locationId) => {
    const location = pickupLocations.find(loc => loc.id === locationId);
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
    setSelectedLocationId(locationId);
  };

  const markerColor = (locationId) => {
    return locationId === selectedLocationId ? 'blue' : 'red';
  };

  const openDirections = (latitude, longitude, label = 'Location') => {
    let url = '';
  
    if (Platform.OS === 'ios') {
      // Encode label for URL
      const encodedLabel = encodeURIComponent(label);
      url = `maps://?q=${encodedLabel}@${latitude},${longitude}`;
    } else if (Platform.OS === 'android') {
      url = `google.navigation:q=${latitude},${longitude}`;
    }
  
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          console.log("Don't know how to open URI: " + url);
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };
  

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {pickupLocations.length > 0 && (
        <MapView
          provider={PROVIDER_GOOGLE}
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: pickupLocations[0].latitude,
            longitude: pickupLocations[0].longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}>
          {pickupLocations.map((location) => (
            <Marker
              key={location.id}
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              pinColor={markerColor(location.id)}
              title={location.title}
              description={location.description}
            />
          ))}
        </MapView>
      )}
      <Text style={styles.headerText}>Pick-up / Drop-off Locations</Text>
      <ScrollView style={styles.infoContainer}>
      {pickupLocations.map((location) => (
        <TouchableOpacity key={location.id} onPress={() => onCardPress(location.id)}>
          <Card style={styles.card}>
            <Card.Content>
              <Paragraph style={styles.title}>{location.title}</Paragraph>
              <Paragraph>{location.description}</Paragraph>
            </Card.Content>
            <TouchableOpacity
              style={styles.directionIcon}
              onPress={() => openDirections(location.latitude, location.longitude, location.title)}
            >
              <Icon name="directions" size={30} color={colors.primary} />
            </TouchableOpacity>
          </Card>
        </TouchableOpacity>
      ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  directionIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold'
  },
  container: {
    flex: 1,
    backgroundColor: colors.universalBg,
  },
  map: {
    height: 300,
    width: '100%',
  },
  headerText: {
    padding: 10,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  infoContainer: {
    backgroundColor: colors.universalBg,
    padding: 10,
  },
  card: {
    marginVertical: 5,
    padding: 10,
    backgroundColor: colors.lightGray,
  },
  paragraph: {
    fontSize: 16,
  },
});

export default Transportation;


