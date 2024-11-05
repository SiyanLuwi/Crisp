import * as Location from 'expo-location';
import { scheduleNotification } from './notifications';
import { Report } from './reports'; // Adjust import based on your file structure
import { haversineDistance } from './haversieDistace'; // Assuming this is where your distance calculation is

let watchSubscription: Location.LocationSubscription | null = null; // Initialize watchSubscription

export const startLocationUpdates = async () => {
  // Request permissions before starting location updates
  await requestPermissions();

  // Start watching the user's location
  watchSubscription = await Location.watchPositionAsync(
    { 
      accuracy: Location.Accuracy.High, 
      distanceInterval: 1, 
      timeInterval: 10000 
    },
    async (location) => {
      const reports = await Report.fetchAllReports(); // Fetch all reports using the new method
      checkForNearbyReports(location.coords, reports);
    }
  );
};

const requestPermissions = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    console.log('Permission to access location was denied');
  }
};

const checkForNearbyReports = (userLocation: any, reports: Report[]) => {
  reports.forEach((report) => {
    const distance = haversineDistance(userLocation, report);
    if (distance <= 200) { // Adjust the distance as needed
      scheduleNotification('New Report Nearby!', `A new report has been filed near you: ${report.type_of_report}`, 1);
    }
  });
};

export const stopLocationUpdates = async () => {
  if (watchSubscription) {
    await watchSubscription.remove(); // Stop the location updates
    watchSubscription = null; // Clear the watch subscription after stopping
  }
};
