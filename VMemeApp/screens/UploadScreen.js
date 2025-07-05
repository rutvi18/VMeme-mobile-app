// screens/UploadScreen.js
import React, { useState } from 'react';
import { View, Text, Button, Image, TextInput, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { firebaseStorage, firebaseFirestore, firebaseAuth } from '../firebaseConfig'; // Import Storage and Firestore

const UploadScreen = ({ navigation }) => {
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    // Request media library permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant access to your photo library to upload memes.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3], // Adjust aspect ratio as needed
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadMeme = async () => {
    if (!image) {
      Alert.alert('No Image', 'Please select an image to upload.');
      return;
    }

    setUploading(true);
    const filename = image.substring(image.lastIndexOf('/') + 1);
    const storageRef = firebaseStorage.ref(`memes/${filename}`);

    try {
      // Upload image to Firebase Storage
      const response = await fetch(image);
      const blob = await response.blob(); // Convert image URI to a Blob
      await storageRef.put(blob);

      const imageUrl = await storageRef.getDownloadURL(); // Get the public URL

      // Save meme data to Firestore
      await firebaseFirestore.collection('memes').add({
        imageUrl: imageUrl,
        caption: caption,
        uploaderId: firebaseAuth.currentUser.uid,
        uploaderEmail: firebaseAuth.currentUser.email,
        timestamp: firestore.FieldValue.serverTimestamp(), // Firestore timestamp
      });

      Alert.alert('Success', 'Meme uploaded successfully!');
      setCaption('');
      setImage(null);
      setUploading(false);
      navigation.navigate('Home'); // Go back to home screen after upload
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert('Upload Failed', error.message);
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload a New Meme</Text>
      <Button title="Pick an Image" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.previewImage} />}
      <TextInput
        style={styles.input}
        placeholder="Add a caption..."
        value={caption}
        onChangeText={setCaption}
        multiline
      />
      {uploading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Upload Meme" onPress={uploadMeme} disabled={!image || uploading} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  previewImage: {
    width: '90%',
    height: 200,
    resizeMode: 'contain',
    marginVertical: 20,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
  },
  input: {
    width: '90%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

export default UploadScreen;