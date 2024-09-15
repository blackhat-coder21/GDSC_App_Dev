import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, FlatList, Dimensions, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FAB } from 'react-native-paper';
import { auth, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { useNavigation } from '@react-navigation/core';

const HomeScreen = () => {
  const [profileImage, setProfileImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [gallery, setGallery] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchProfileImage();
    fetchGallery();
  }, []);

  // Fetch the profile image from Firebase Storage
  const fetchProfileImage = async () => {
    try {
      const user = auth.currentUser;
      const profileImageRef = ref(storage, `profile_pictures/${user.uid}/profile.jpg`);

      const imageUrl = await getDownloadURL(profileImageRef);
      setProfileImage(imageUrl);
    } catch (error) {
      console.log('No profile image found.');
    }
  };

  // Fetch uploaded gallery images from Firebase Storage
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

  // Pick an image from the library
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      uploadProfileImage(result.uri);
    }
  };

  // Upload the selected image as profile picture to Firebase Storage
  const uploadProfileImage = async (uri) => {
    try {
      setUploading(true);

      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function () {
          reject(new TypeError('Network request failed'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      });

      const user = auth.currentUser;
      const profileImageRef = ref(storage, `profile_pictures/${user.uid}/profile.jpg`);

      await uploadBytes(profileImageRef, blob);

      const imageUrl = await getDownloadURL(profileImageRef);
      setProfileImage(imageUrl);
      alert('Profile image uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error.message);
      alert('Upload failed! Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Delete the profile picture
  const deleteProfileImage = async () => {
    const user = auth.currentUser;
    const profileImageRef = ref(storage, `profile_pictures/${user.uid}/profile.jpg`);

    try {
      await deleteObject(profileImageRef);
      setProfileImage(null);
      alert('Profile image deleted successfully!');
    } catch (error) {
      console.error('Deletion failed:', error.message);
    }
  };

  // Handle profile image click (upload or delete)
  const handleProfileImageClick = () => {
    Alert.alert(
      "Profile Image",
      "Do you want to upload a new profile image or delete the current one?",
      [
        { text: "Upload New", onPress: pickImage },
        { text: "Delete", onPress: deleteProfileImage, style: "destructive" },
        { text: "Cancel", style: "cancel" }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <Image source={{ uri: item }} style={styles.galleryImage} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={handleProfileImageClick}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.defaultProfileImage}>
              <Text style={styles.defaultProfileText}>Profile Photo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {uploading && <ActivityIndicator size="large" color="#0782F9" />}

      <FlatList
        data={gallery}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        numColumns={2}
        contentContainerStyle={styles.galleryContainer}
      />

      <FAB
        style={styles.fab}
        icon="camera"
        onPress={pickImage}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  profileContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#0782F9',
  },
  defaultProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0782F9',
  },
  defaultProfileText: {
    color: '#888',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 20,
    bottom: 30,
    backgroundColor: '#0782F9',
  },
  galleryContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  galleryImage: {
    width: (Dimensions.get('window').width / 2) - 15,
    height: 150,
    margin: 5,
    borderRadius: 10,
  },
});
