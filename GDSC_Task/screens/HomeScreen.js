import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, FlatList, Dimensions, Alert } from 'react-native';
import { FAB, Menu, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/core';
import { auth, storage } from '../firebase';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

const HomeScreen = () => {
  const [gallery, setGallery] = useState([]);
  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchProfilePicture();
    fetchGallery();
  }, []);

  // Fetch the user's profile picture
  const fetchProfilePicture = async () => {
    try {
      const user = auth.currentUser;
      const profilePicRef = ref(storage, `profile_pictures/${user.uid}/profile.jpg`);
      const url = await getDownloadURL(profilePicRef);
      setProfilePicUrl(url);
    } catch (error) {
      console.log("No profile picture found");
    }
  };

  // Fetch gallery images from Firebase Storage
  const fetchGallery = async () => {
    try {
      const user = auth.currentUser;
      const galleryRef = ref(storage, `profile_pictures/${user.uid}/`);
      const imageList = await listAll(galleryRef);

      const urls = await Promise.all(
        imageList.items.map(async (item) => {
          const url = await getDownloadURL(item);
          return url;
        })
      );
      setGallery(urls);
    } catch (error) {
      console.error('Failed to fetch gallery:', error.message);
    }
  };

  // Upload new image as profile picture
  const uploadProfilePicture = async () => {
    const user = auth.currentUser;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      const response = await fetch(result.uri);
      const blob = await response.blob();
      const profilePicRef = ref(storage, `profile_pictures/${user.uid}/profile.jpg`);

      uploadBytes(profilePicRef, blob).then(async () => {
        const downloadURL = await getDownloadURL(profilePicRef);
        setProfilePicUrl(downloadURL);
        Alert.alert("Profile Picture Uploaded");
      }).catch((error) => console.error('Failed to upload profile picture:', error));
    }
  };

  // Upload new image to gallery
  const uploadToGallery = async () => {
    const user = auth.currentUser;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.cancelled) {
      const response = await fetch(result.uri);
      const blob = await response.blob();
      const galleryRef = ref(storage, `profile_pictures/${user.uid}/${uuidv4()}.jpg`);

      uploadBytes(galleryRef, blob).then(async () => {
        const downloadURL = await getDownloadURL(galleryRef);
        setGallery((prevGallery) => [...prevGallery, downloadURL]);
        Alert.alert("Image Uploaded");
      }).catch((error) => console.error('Failed to upload image:', error));
    }
  };

  // Render individual gallery images and handle click to navigate to full-screen view
  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('FullScreenImage', { imageUri: item })}>
      <Image source={{ uri: item }} style={styles.galleryImage} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Profile Picture Upload */}
      <TouchableOpacity onPress={uploadProfilePicture}>
        {profilePicUrl ? (
          <Image source={{ uri: profilePicUrl }} style={styles.profilePic} />
        ) : (
          <Image source={require('../assets/default_profile_pic.png')} style={styles.profilePic} />
        )}
      </TouchableOpacity>

      {/* Gallery Images */}
      <FlatList
        data={gallery}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        contentContainerStyle={styles.galleryContainer}
      />

      {/* Floating Action Button to upload to gallery */}
      <FAB
        style={styles.fab}
        icon="camera"
        onPress={uploadToGallery}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative', // Ensure container's position is relative
  },
  galleryContainer: {
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryImage: {
    width: (Dimensions.get('window').width / 2) - 15,
    height: 150,
    margin: 5,
    borderRadius: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 20,
    bottom: 30,
    backgroundColor: '#0782F9',
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: 'absolute',
    top: 20, // Adjust top value to align properly
    left: 100,
    borderWidth: 2,
    borderColor: 'white', // Optional: add border for better visibility
  },
});
