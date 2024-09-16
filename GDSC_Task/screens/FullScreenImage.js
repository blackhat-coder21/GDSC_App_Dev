import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Menu, IconButton } from 'react-native-paper';
import { ref, deleteObject } from 'firebase/storage';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { storage, auth } from '../firebase';

const FullScreenImage = ({ route, navigation }) => {
  const { imageUri } = route.params; // Get image URI from navigation params
  const [menuVisible, setMenuVisible] = useState(false);

  // Toggle the three-dot menu
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  // Handle deleting the image from Firebase Storage
  const handleDelete = async () => {
    const user = auth.currentUser;
    const imageRef = ref(storage, `profile_pictures/${user.uid}/${imageUri.split('/').pop()}`);

    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteObject(imageRef);
              Alert.alert('Success', 'Image deleted successfully!');
              navigation.goBack(); // Go back to the gallery after deleting
            } catch (error) {
              console.error('Error deleting image:', error);
              Alert.alert('Error', 'Failed to delete image.');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  // Handle downloading the image to device storage
  const handleDownload = async () => {
    try {
      const fileUri = `${FileSystem.documentDirectory}${imageUri.split('/').pop()}`;
      const downloadResumable = FileSystem.createDownloadResumable(
        imageUri,
        fileUri
      );
      const { uri } = await downloadResumable.downloadAsync();
      const permission = await MediaLibrary.requestPermissionsAsync();

      if (permission.granted) {
        await MediaLibrary.createAssetAsync(uri);
        Alert.alert('Success', 'Image saved to your gallery!');
      } else {
        Alert.alert('Permission Denied', 'Unable to save the image.');
      }
    } catch (error) {
      console.error('Error downloading image:', error);
      Alert.alert('Error', 'Failed to download image.');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.fullScreenImage} />

      <Menu
        visible={menuVisible}
        onDismiss={closeMenu}
        anchor={
          <IconButton
            icon="dots-vertical"
            color="white"
            size={30}
            onPress={openMenu}
            style={styles.menuButton}
          />
        }
      >
        <Menu.Item onPress={handleDelete} title="Delete" />
        <Menu.Item onPress={handleDownload} title="Download" />
      </Menu>
    </View>
  );
};

export default FullScreenImage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  menuButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
});
