import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RFPercentage } from "react-native-responsive-fontsize";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "@/AuthContext/AuthContext";
import { doc, getFirestore, setDoc, updateDoc } from "firebase/firestore";
import { app } from "@/firebase/firebaseConfig";
import { Audio } from "expo-av";

const db = getFirestore(app);

export default function Incoming() {
  const { incomingCall } = useAuth();
  const [callerName, setClallerName] = useState();
  const callerImage = "https://randomuser.me/api/portraits/men/1.jpg"; // Use a placeholder image
  const router = useRouter();
  const [sound, setSound] = useState<Audio.Sound | undefined>(undefined);

  useEffect(() => {
    if (incomingCall) {
      setClallerName(incomingCall.username);
      playRingSound(); // Play the ring sound when the incoming call arrives
    }

    return () => {
      if (sound) {
        sound.stopAsync(); // Stop the sound when the component unmounts or call is answered
      }
    };
  }, [incomingCall]);

  const playRingSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/ring.mp3") // Replace this with the actual path to your ring sound file
      );
      setSound(sound);
      await sound.playAsync(); // Start playing the ring sound
    } catch (error) {
      console.error("Error playing sound: ", error);
    }
  };

  const handleEndCall = async () => {
    try {
      const callRef = doc(db, "calls", incomingCall.callId);
      await setDoc(
        callRef,
        { callStatus: "ended", offer: null },
        { merge: true }
      );
    } catch (error) {
      console.error("Incoming call handle end call: ", error);
    }
  };

  const handleAnswerCall = async () => {
    try {
      if (incomingCall) {
        console.log("Receiver CALLID: ", incomingCall.callId);
        await updateDoc(doc(db, "calls", incomingCall.callId), {
          callStatus: "answered",
        });
        router.push({
          pathname: "/calls/outgoing",
          params: {
            callId: incomingCall.callId,
            callerName: incomingCall.callerName,
            mode: "callee",
          },
        });
      }
    } catch (error) {
      console.error("Error answering the call", error);
      Alert.alert("Error", "Could not answer the call.");
    }
  };

  return (
    <View className="flex-1 bg-[#1A1A1A] justify-between px-12 py-20">
      <StatusBar style="light" />

      {/* Caller Information */}
      <View className="items-center mt-5">
        <MaterialCommunityIcons
          name="account-circle"
          size={RFPercentage(16)}
          style={{ padding: 5, color: "#fff" }}
        />
        {/* <Image
          source={{ uri: callerImage }}
          className="w-32 h-32 rounded-full border-4 border-white"
        /> */}
        <Text className="mt-4 text-3xl text-white font-bold">{callerName}</Text>
        <Text className="mt-2 text-lg text-gray-400">Incoming Call</Text>
      </View>

      {/* Buttons (Answer/Decline) */}
      <View className="flex-row justify-between mt-8">
        {/* Decline Button */}
        <TouchableOpacity
          onPress={handleEndCall}
          className="w-24 h-24 bg-red-500 rounded-full justify-center items-center"
        >
          <MaterialCommunityIcons
            name="phone-hangup"
            size={RFPercentage(5)}
            style={{ padding: 5, color: "#fff" }}
          />
        </TouchableOpacity>

        {/* Accept Button */}
        <TouchableOpacity
          onPress={handleAnswerCall}
          className="w-24 h-24 bg-green-500 rounded-full justify-center items-center"
        >
          <MaterialCommunityIcons
            name="phone"
            size={RFPercentage(5)}
            style={{ padding: 5, color: "#fff" }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
