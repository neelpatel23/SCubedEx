import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import { Card, IconButton, Colors } from 'react-native-paper';
import { ref as storageRef, listAll, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, auth } from '../config/firebase';
import { usePhotos } from './PhotoContext';
import colors from '../colors';

const MyPostsScreen = () => {
  const { photos, updatePhotos } = usePhotos();
  const [userPosts, setUserPosts] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Fetch user's posts from Firebase Storage
    const userDisplayName = auth.currentUser?.displayName;
    const postsRef = storageRef(storage, `reels/${userDisplayName}`);

    // List all files in the 'reels' folder for the current user
    listAll(postsRef)
      .then((result) => {
        const promises = result.items.map((item) => getDownloadURL(item));
        return Promise.all(promises);
      })
      .then((downloadURLs) => {
        setUserPosts(downloadURLs);
      })
      .catch((error) => {
        console.error('Fetch Posts Error: ', error);
      });
  }, []);

  const deletePost = async (postUrl) => {
    setIsDeleting(true);
    try {
      // Delete the post from Firebase Storage
      const imageRef = storageRef(storage, postUrl);
      await deleteObject(imageRef);
  
      // Update local userPosts state
      setUserPosts((prevPosts) => prevPosts.filter((url) => url !== postUrl));
  
      // Update global photos state
      updatePhotos((prevPhotos) => prevPhotos.filter((url) => url !== postUrl));
    } catch (error) {
      console.error('Delete Post Error: ', error);
      Alert.alert('Error', 'Failed to delete post.');
    } finally {
      setIsDeleting(false);
    }
  };
  
  

  return (
    <View style={styles.container}>
      {userPosts.length === 0 ? (
        <Text style={styles.noPostsText}>You have no posts.</Text>
      ) : (
        <FlatList
          data={userPosts}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Cover source={{ uri: item }} />
              <Card.Actions style={styles.cardActions}>
                {isDeleting ? (
                  <ActivityIndicator size="large" color={colors.primary} />
                ) : (
                  <IconButton
                    icon="delete"
                    color={colors.primary}
                    onPress={() => deletePost(item)}
                  />
                )}
              </Card.Actions>
            </Card>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  noPostsText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  card: {
    marginBottom: 16,
  },
  cardActions: {
    justifyContent: 'flex-end',
  },
});

export default MyPostsScreen;
