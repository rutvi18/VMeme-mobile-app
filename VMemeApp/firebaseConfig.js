// VMemeApp/firebaseConfig.js
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// You don't need to put your API keys here if you've added
// google-services.json (Android) and GoogleService-Info.plist (iOS)
// in your project root and configured app.json as described above.
// @react-native-firebase will automatically pick up the config.

export const firebaseAuth = auth();
export const firebaseFirestore = firestore();
export const firebaseStorage = storage();