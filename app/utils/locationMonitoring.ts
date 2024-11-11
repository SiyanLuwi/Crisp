import * as Location from 'expo-location';
import { scheduleNotification } from './notifications';
import { Report } from './reports'; 
import { haversineDistance } from './haversieDistace'; 
import { app } from '@/firebase/firebaseConfig'; 
import { collection, addDoc, query, where, getDocs, getFirestore } from 'firebase/firestore'; 
import { useAuth } from '@/AuthContext/AuthContext';
import * as SecureStore from 'expo-secure-store'
let watchSubscription: Location.LocationSubscription | null = null; 

const db = getFirestore(app);

export const startLocationUpdates = async () => {
  // Request permissions before starting location updates
  await requestPermissions();

  // Start watching the user's location
  watchSubscription = await Location.watchPositionAsync(
    { 
      accuracy: Location.Accuracy.High, 
      distanceInterval: 1, 
      timeInterval: 3000 
    },
    async (location) => {
      const reports = await Report.fetchAllReports(); // Fetch all reports using the new method
      await checkForNearbyReports(location.coords, reports);
    }
  );
};

const requestPermissions = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    console.log('Permission to access location was denied');
  }
};

const checkForNearbyReports = async (userLocation: any, reports: Report[]) => {
  for (const report of reports) {
    const distance = haversineDistance(userLocation, report);
    if (distance <= 200) { // Adjust the distance as needed
      const alreadyNotified = await checkIfNotified(report.id);
      if (!alreadyNotified) { // Check if the report has already notified
        await scheduleAndStoreNotification(report, distance);
      }
    }
  }
};

const checkIfNotified = async (reportId: string) => {
  const notificationsRef = collection(db, 'notifications'); // Reference to your notifications collection
  const q = query(notificationsRef, where('reportId', '==', reportId));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty; // Return true if there are existing notifications for this report
};

const scheduleAndStoreNotification = async (report: Report, distance: number) => {
  const title = 'New Report Nearby!';
  const description = `A new report has been filed with a distance of ${Math.round(distance)}m: ${report.type_of_report}`;
  const screen = "/(tabs)/home";

  // Schedule the notification
  scheduleNotification(title, description, 1, screen);

  const user_id = await SecureStore.getItemAsync('user_id'); // Get USER_ID from the context
  if (!user_id) {
    console.error("USER_ID is missing!");
    return;
  }

  // Store the notification in Firebase
  await addDoc(collection(db, 'notifications'), {
    reportId: report.id,
    userId: user_id,
    title: title,
    description: description,
    screen: screen,
    createdAt: new Date() // Store the timestamp
  });
};

export const stopLocationUpdates = async () => {
  if (watchSubscription) {
    await watchSubscription.remove(); // Stop the location updates
    watchSubscription = null; // Clear the watch subscription after stopping
  }
};