import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

const generateUniqueUserId = async () => {
  try {
    // Query to get the highest user ID
    const usersRef = collection(db, "users");
    const q = query(usersRef, orderBy("unique_id", "desc"), limit(1));
    const querySnapshot = await getDocs(q);
    
    let nextId = 1; // Default starting ID
    
    if (!querySnapshot.empty) {
      // Extract the highest ID and increment
      const highestUser = querySnapshot.docs[0].data();
      if (highestUser.unique_id) {
        const currentIdNum = parseInt(highestUser.unique_id.split('_')[1]);
        if (!isNaN(currentIdNum)) {
          nextId = currentIdNum + 1;
        }
      }
    }
    
    // Format ID with leading zeros (us_001, us_002, etc.)
    return `us_${nextId.toString().padStart(3, '0')}`;
  } catch (error) {
    console.error("Error generating unique ID:", error);
    // Fallback to timestamp-based ID if there's an error
    return `us_${Date.now().toString().slice(-3)}`;
  }
};
const storeUserData = async (user) => {
  if (!user) return;
  
  try {
    // Reference to the user document in Firestore
    const userRef = doc(db, "users", user.uid);
    
    // Check if the user already exists in our database
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // User exists, update login timestamp but preserve other data
      await setDoc(userRef, {
        lastLogin: new Date()
      }, { merge: true });
      
      console.log("Existing user data updated");
    } else {
      // New user, generate unique ID and store all data
      const uniqueId = await generateUniqueUserId();
      
      // Extract first name from display name
      const firstName = user.displayName ? user.displayName.split(' ')[0] : '';
      
      // Store new user data
      await setDoc(userRef, {
        unique_id: uniqueId,
        email: user.email,
        name: firstName,
        tos_check: false, // Default value, you'll need UI to update this
        createdAt: new Date(),
        lastLogin: new Date()
      });
      
      console.log("New user created with ID:", uniqueId);
    }
  } catch (error) {
    console.error("Error storing user data:", error);
    if (error.code === 'permission-denied') {
      console.error("Firestore permission denied. Check your security rules.");
    }
  }
};

const signInWithGoogle = async () => {
  try {
    // Use redirect instead of popup if you keep seeing COOP errors
    // const result = await signInWithRedirect(auth, provider);
    const result = await signInWithPopup(auth, provider);
    console.log("User signed in:", result.user);
    
    // After successful sign-in, store/update user data
    await storeUserData(result.user);
  } catch (error) {
    console.error("Error signing in:", error);
    
    // More detailed error handling
    if (error.code === 'permission-denied') {
      console.error("Firestore permission denied. Check your security rules.");
    }
  }
};

const logout = async () => {
  try {
    await signOut(auth);
    console.log("User signed out");
  } catch (error) {
    console.error("Error signing out:", error);
  }
};

export { auth, db, signInWithGoogle, logout };