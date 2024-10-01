import React, { useEffect, useState, useRef } from 'react';
import MapView, { Marker, Region } from 'react-native-maps';
import { StyleSheet, View, Dimensions, Text, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { RFPercentage } from 'react-native-responsive-fontsize';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/AuthContext/AuthContext';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function Home() {
  const initialRegion = {
    latitude: 13.4125,
    longitude: 122.5621,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
  const [region, setRegion] = useState<Region | null>(initialRegion);
  const [currentWeather, setCurrentWeather] = useState<any | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);
  const [userLocation, setUserLocation] = useState<any>(null);
  
  const mapRef = useRef<MapView>(null); // Add a ref to the MapView


  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('Location permission status:', status);

      if (status === 'granted') {
        setLocationPermissionGranted(true);
        getCurrentLocation();
      } else {
        console.log('Location permission denied');
        setLocationPermissionGranted(false);
        setRegion(null);
      }
    };

    const getCurrentLocation = async () => {
      try {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setUserLocation({ latitude, longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        fetchCurrentWeather(latitude, longitude);
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };

    const fetchCurrentWeather = async (lat: number, lon: number) => {
      const params = {
        latitude: lat,
        longitude: lon,
        current_weather: true,
        timezone: "Asia/Manila",
      };

      const url = "https://api.open-meteo.com/v1/forecast";

      try {
        const response = await axios.get(url, { params });
        const currentWeather = response.data.current_weather;

        setCurrentWeather(currentWeather);
      } catch (error) {
        console.error('Error fetching current weather data:', error);
      }
    };

    requestLocationPermission();
  }, []);

  const getWeatherDescription = (code: number) => {
    const weatherConditions: { [key: number]: string } = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Drizzle: Light',
      53: 'Drizzle: Moderate',
      61: 'Rain: Slight',
      63: 'Rain: Moderate',
      65: 'Rain: Heavy intensity',
      80: 'Rain showers: Slight',
      81: 'Rain showers: Moderate',
      95: 'Thunderstorm: Slight or moderate',
    };

    return weatherConditions[code] || 'Unknown weather condition';
  };

  const getLocalTime = () => {
    const timeString = new Date().toLocaleTimeString('en-PH', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      timeZone: 'Asia/Manila',
    });
    return timeString.replace(/am|pm/i, match => match.toUpperCase());
  };

  const centerOnUserLocation = () => {
    if (userLocation) {
      const newRegion = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: region?.latitudeDelta || 0.01,
        longitudeDelta: region?.longitudeDelta || 0.01,
      };
  
      console.log('Centering on user location:', newRegion); // Debugging ayaw magitna nung location
      mapRef.current?.animateToRegion(newRegion, 1000); // Animate to the new region
    } else {
      console.error('User location is not available'); // Debugging line ulet
    }
  };
  
  return (
    <View style={styles.container}>
      {!locationPermissionGranted || region === null ? (
        <View style={styles.noLocationContainer}>
          <Text style={styles.noLocationText}>
            Turn your location services on to see the map.
          </Text>
        </View>
      ) : (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef} 
            style={styles.map}
            region={region}
          >
            <Marker coordinate={region} title={"You are here"} />
            <Marker
              coordinate={{ latitude: 14.65344, longitude: 120.99473 }}
              title={"University of Caloocan City - South Campus"}
              description="South Campus"
            />
          </MapView>
          <TouchableOpacity style={styles.locationButton} onPress={centerOnUserLocation}>
            <Icon name="crosshairs-gps" size={RFPercentage(4)} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
      {currentWeather && (
        <SafeAreaView style={styles.weatherContainer}>
          <View style={styles.weatherRow}>
            <Icon name="thermometer" size={RFPercentage(3)} color="#000" />
            <Text style={styles.weatherText}>
              {`Temperature: ${currentWeather.temperature}°C`}
            </Text>
          </View>
          <View style={styles.weatherRow}>
            <Icon name="weather-windy" size={RFPercentage(3)} color="#000" />
            <Text style={styles.weatherText}>
              {`Wind Speed: ${currentWeather.windspeed} km/h`}
            </Text>
          </View>
          <View style={styles.weatherRow}>
            <Icon name="weather-cloudy" size={RFPercentage(3)} color="#000" />
            <Text style={styles.weatherText}>
              {`Condition: ${getWeatherDescription(currentWeather.weathercode)}`}
            </Text>
          </View>
          <View style={styles.weatherRow}>
            <Icon name="clock" size={RFPercentage(3)} color="#000" />
            <Text style={styles.weatherText}>
              {`Time: ${getLocalTime()}`}
            </Text>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4C3',
  },
  mapContainer: {
    position: 'absolute',
    height: height * 0.8,
    width: width,
    bottom: 0,
  },
  map: {
    flex: 1,
  },
  locationButton: {
    position: 'absolute',
    bottom: height * 0.1,
    right: 20,
    backgroundColor: '#0C3B2D',
    borderRadius: 50,
    padding: 10,
    elevation: 5,
  },
  weatherContainer: {
    position: 'absolute',
    width: width,
    alignContent: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F4C3',
    padding: height * 0.02,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    zIndex: 1,
    elevation: 10,
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  weatherText: {
    fontSize: RFPercentage(2.5),
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 10,
  },
  noLocationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0C3B2D',
  },
  noLocationText: {
    fontSize: RFPercentage(3),
    color: "#ffffff",
    textAlign: 'center',
  },
});