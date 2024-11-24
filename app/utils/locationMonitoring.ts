import * as Location from 'expo-location';
import { scheduleNotification } from './notifications';
import { Report } from './reports';
import { haversineDistance } from './haversieDistace'; 
import { app } from '@/firebase/firebaseConfig'; 
import { collection, addDoc, getFirestore } from 'firebase/firestore'; 
import * as SecureStore from 'expo-secure-store';


let watchSubscription: Location.LocationSubscription | null = null; 
const db = getFirestore(app);
const notifiedReports = new Set<string>(); // To track notified reports

interface LocationTaskData {
  locations: Location.LocationObject[];
}


export const startLocationUpdates = async () => {
  await requestPermissions();
  await Location.startLocationUpdatesAsync('LOCATION_TASK', {
    accuracy: Location .Accuracy.High,
    distanceInterval: 1, // meters
    timeInterval: 3000, // milliseconds
    showsBackgroundLocationIndicator: true, // iOS only
  });
};

const requestPermissions = async (): Promise<void> => {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus !== 'granted') {
    console.log('Foreground location permission was denied');
    return;
  }

  // Request background permission (Android only)
  const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
  if (backgroundStatus !== 'granted') {
    console.log('Background location permission was denied');
    return;
  }
};


const checkForNearbyReports = async (userLocation: any, reports: Report[], userId: number) => {
  const notifiedThisCheck = new Set<string>(); // To track newly notified reports in this check

  for (const report of reports) {
    const distance = haversineDistance(userLocation, report);
    if (distance <= 200) {
      // Check if the report belongs to the user
      if (report.user_id !== userId && !notifiedReports.has(report.id)) {
        notifiedThisCheck.add(report.id);
        await scheduleAndStoreNotification(report, distance);
      }
    } else {
      // If the user is outside the 200m radius, remove from notifiedReports
      notifiedReports.delete(report.id);
    }
  }

  // Update the notifiedReports set with newly notified reports
  notifiedReports.forEach(id => {
    if (!notifiedThisCheck.has(id)) {
      notifiedReports.delete(id);
    }
  });
};

const scheduleAndStoreNotification = async (report: Report, distance: number) => {
  const title = 'New Report Nearby!';
  const description = `A new report has been filed with a distance of ${Math.round(distance)}m: ${report.type_of_report}`;
  const screen = "/(tabs)/home";

  await scheduleNotification(title, description, 1, screen);

  const user_id = await SecureStore.getItemAsync('user_id');
  if (!user_id) {
    console.error("USER_ID is missing!");
    return;
  }

  await addDoc(collection(db, 'notifications'), {
    reportId: report.id,
    userId: user_id,
    title: title,
    description: description,
    screen: screen,
    createdAt: new Date()
  });
};

export const stopLocationUpdates = async () => {
  if (watchSubscription) {
    await watchSubscription.remove();
    watchSubscription = null;
  }
};