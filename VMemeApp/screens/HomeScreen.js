// screens/HomeScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions, ActivityIndicator, Button } from 'react-native';
import { firebaseFirestore, firebaseAuth } from '../firebaseConfig'; // Import Firestore and Auth

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [memes, setMemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseFirestore.collection('memes')
      .orderBy('timestamp', 'desc') // Order by latest memes
      .onSnapshot(snapshot => {
        const fetchedMemes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMemes(fetchedMemes);
        setLoading(false);
      }, error => {
        console.error("Error fetching memes:", error);
        setLoading(false);
      });

    // Unsubscribe from snapshot listener when component unmounts
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await firebaseAuth.signOut();
      // Navigation will automatically go to AuthScreen due to onAuthStateChanged listener in App.js
    } catch (error) {
      Alert.alert('Logout Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading Memes...</Text>
      </View>
    );
  }

  const renderMemeItem = ({ item }) => (
    <View style={styles.memeCard}>
      <Image source={{ uri: item.imageUrl }} style={styles.memeImage} resizeMode="contain" />
      <Text style={styles.memeCaption}>{item.caption}</Text>
      <Text style={styles.memeUploader}>Uploaded by: {item.uploaderEmail || 'Anonymous'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meme Feed</Text>
        <Button title="Logout" onPress={handleLogout} />
      </View>
      {memes.length === 0 ? (
        <View style={styles.noMemesContainer}>
          <Text style={styles.noMemesText}>No memes yet! Be the first to upload.</Text>
          <Button title="Upload Meme" onPress={() => navigation.navigate('Upload')} />
        </View>
      ) : (
        <FlatList
          data={memes}
          keyExtractor={(item) => item.id}
          renderItem={renderMemeItem}
          contentContainerStyle={styles.listContent}
        />
      )}
      <View style={styles.footer}>
        <Button title="Upload Meme" onPress={() => navigation.navigate('Upload')} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    paddingTop: 40, // Adjust for iOS safe area
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  memeCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 8,
    marginHorizontal: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memeImage: {
    width: '100%',
    height: width * 0.7, // Dynamic height based on width for aspect ratio
    borderRadius: 8,
    backgroundColor: '#e0e0e0', // Placeholder background
  },
  memeCaption: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 10,
    marginBottom: 5,
  },
  memeUploader: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  noMemesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noMemesText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 15,
    color: '#777',
  }
});

export default HomeScreen;