import React, { useEffect, useState, useRef } from "react";
import MapView, { Marker, Region } from "react-native-maps";
import { View, Dimensions, Image, Text, TouchableOpacity } from "react-native";
import * as Location from "expo-location";
import axios from "axios";
import { RFPercentage } from "react-native-responsive-fontsize";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function Home() {
  const initialRegion = {
    latitude: 13.4125,
    longitude: 122.5621,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  const [region, setRegion] = useState<Region | null>(initialRegion);
  const [currentWeather, setCurrentWeather] = useState<any | null>(null);
  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);
  const [userLocation, setUserLocation] = useState<any>(null);
  const mapRef = useRef<MapView>(null); // Add a ref to the MapView

  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log("Location permission status:", status);

      if (status === "granted") {
        setLocationPermissionGranted(true);
        getCurrentLocation();
      } else {
        console.log("Location permission denied");
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
        console.error("Error getting location:", error);
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
        console.error("Error fetching current weather data:", error);
      }
    };

    requestLocationPermission();
  }, []);

  const getWeatherDescription = (code: number) => {
    const weatherConditions: { [key: number]: string } = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing rime fog",
      51: "Drizzle: Light",
      53: "Drizzle: Moderate",
      61: "Rain: Slight",
      63: "Rain: Moderate",
      65: "Rain: Heavy intensity",
      80: "Rain showers: Slight",
      81: "Rain showers: Moderate",
      95: "Thunderstorm",
    };

    return weatherConditions[code] || "Unknown weather condition";
  };

  const getWeatherImage = (code: number) => {
    const weatherConditions: { [key: number]: { image: any } } = {
      0: { image: require("../../assets/images/weather/Clear-sky.png") },
      1: { image: require("../../assets/images/weather/Clear-sky.png") },
      2: { image: require("../../assets/images/weather/partly-cloudy.png") },
      3: { image: require("../../assets/images/weather/Overcast.png") },
      45: { image: require("../../assets/images/weather/Fog.png") },
      48: {
        image: require("../../assets/images/weather/Depositing-rime-fog.png"),
      },
      51: { image: require("../../assets/images/weather/Drizzle-Light.png") },
      53: {
        image: require("../../assets/images/weather/Drizzle-Moderate.png"),
      },
      61: {
        image: require("../../assets/images/weather/Rain-Slight.png"),
      },
      63: { image: require("../../assets/images/weather/Rain-Moderate.png") },
      65: { image: require("../../assets/images/weather/Rain-Heavy.png") },
      80: { image: require("../../assets/images/weather/Rain-Slight.png") },
      81: { image: require("../../assets/images/weather/Rain-Moderate.png") },
      95: { image: require("../../assets/images/weather/Thunderstorm.png") },
    };

    return weatherConditions[code] && weatherConditions[code].image;
  };

  const getLocalTime = () => {
    const timeString = new Date().toLocaleTimeString("en-PH", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      timeZone: "Asia/Manila",
    });
    return timeString.replace(/am|pm/i, (match) => match.toUpperCase());
  };

  const getLocalDay = () => {
    const optionsDay: Intl.DateTimeFormatOptions = { weekday: "long" }; // Correct type
    return new Date().toLocaleDateString("en-PH", optionsDay);
  };

  const getLocalMonthAndDay = () => {
    const optionsMonthDay: Intl.DateTimeFormatOptions = {
      month: "long",
      day: "numeric",
    }; // Correct type
    return new Date().toLocaleDateString("en-PH", optionsMonthDay);
  };

  const centerOnUserLocation = () => {
    if (userLocation) {
      const newRegion = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: region?.latitudeDelta || 0.01,
        longitudeDelta: region?.longitudeDelta || 0.01,
      };

      console.log("Centering on user location:", newRegion); // Debugging ayaw magitna nung location
      mapRef.current?.animateToRegion(newRegion, 1000); // Animate to the new region
    } else {
      console.error("User location is not available"); // Debugging line ulet
    }
  };

  return (
    <View className="h-full w-full flex-1 absolute">
      {!locationPermissionGranted || region === null ? (
        <View className="flex-1 justify-center items-center absolute">
          <Text className="text-4xl font-semibold">
            Turn your location services on to see the map.
          </Text>
        </View>
      ) : (
        <View className="w-full h-full flex-1 absolute">
          <MapView ref={mapRef} className="flex-1" region={region}>
            <Marker
              coordinate={region}
              title={"You are here"}
              pinColor="blue"
            />
            <Marker
              coordinate={{ latitude: 14.65344, longitude: 120.99473 }}
              title={"University of Caloocan City - South Campus"}
              description="South Campus"
            />
          </MapView>
          <TouchableOpacity
            className="absolute bottom-28 right-5 bg-[#0C3B2D] rounded-full p-2 shadow-lg"
            onPress={centerOnUserLocation}
          >
            <Icon
              name="crosshairs-gps"
              size={RFPercentage(4)}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      )}
      {currentWeather && (
        <SafeAreaView className="bg-white w-full absolute p-0 flex-row rounded-b-3xl border-[#0C3B2D] border-4">
          <View className="flex-1 items-start justify-center p-5 ml-4">
            <View className="items-start justify-start">
              <Text className="text-[#0C3B2D] font-bold text-2xl mb-2">
                {getLocalDay()}
              </Text>
            </View>
            <View className="items-start justify-start">
              <Text className="text-[#0C3B2D] font-semibold text-lg mb-2">
                {getLocalMonthAndDay()}
              </Text>
            </View>
            <View className="items-start justify-start">
              <Text className="text-[#0C3B2D] font-extrabold text-5xl">
                {`${currentWeather.temperature}°C`}
              </Text>
            </View>
          </View>
          <View className="flex-1 items-center justify-center p-3 ">
            <View className="items-start justify-start">
              <Image
                source={getWeatherImage(currentWeather.weathercode)}
                style={{ width: 100, height: 100 }}
                resizeMode="contain"
              />
            </View>
            <View className="items-start justify-start">
              <Text className="text-[#0C3B2D] font-semibold text-lg">
                {getWeatherDescription(currentWeather.weathercode)}
              </Text>
            </View>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}
