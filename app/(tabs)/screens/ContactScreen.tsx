// screens/ContactScreen.tsx
import { useAuth } from '@/AuthContext/AuthContext';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { app } from '@/firebase/firebaseConfig';
import { addDoc, collection, doc, getFirestore, onSnapshot, query, setDoc, arrayUnion  } from 'firebase/firestore';
const db = getFirestore(app)
import uuid from 'react-native-uuid';
import * as SecureStore from 'expo-secure-store'
import {Camera} from 'expo-camera'
import {RTCPeerConnection} from 'react-native-webrtc'




const contacts = [
  { id: '19', name: 'Justin', number: '123-456-7890', avatar: '' },
  { id: '22', name: 'Jane Smith', number: '098-765-4321', avatar: '' },
];

const ContactScreen = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCalling, setIsCalling] = useState<boolean>(false)

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const { USER_ID, setPeerConnection }: any = useAuth()
 
  const router = useRouter()


  const filteredContacts = contacts.filter((contact) =>
    contact.id !== USER_ID
  );

  useEffect(() => {
    async function requestPermissions() {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Camera permission is required to make calls.");
      }
    }
    requestPermissions();
  }, []);

  const handleCall = async (contactId) => {
    try {
      const callId = uuid.v4();
      console.log("From Caller. CallID: ", callId)
        const callRef = doc(db, 'calls', callId);
        await setDoc(callRef, {
            callId: callId,
            caller_id: USER_ID,
            offer: null,
            answer: null,
            callStatus: 'waiting',
            receiver_id: contactId,
        });
        router.push({
            pathname: '/(tabs)/screens/CallingProgressScreen',
            params: { mode: 'caller', callId },
        });

        console.log("Successfully created a room for calling. Waiting for answer...");
    } catch (error: any) {
        Alert.alert("Error calling: ", error.message || "An unknown error occurred.");
        console.error(error);
    }
};

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search Contacts"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.contactItem}>
            <Text style={styles.contactName}>{item.name}</Text>
            <Text>{item.number}</Text>
            <TouchableOpacity onPress={() => handleCall(item.id)}>
              <Ionicons name="call" size={24} color="green" />
            </TouchableOpacity>
          </View>
        )}
      />
  
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  searchBar: { height: 40, borderColor: 'gray', borderWidth: 1, borderRadius: 8, marginBottom: 20, paddingLeft: 10 },
  contactItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15 },
  contactName: { fontWeight: 'bold' },
  createButton: { padding: 10, backgroundColor: '#4CAF50', borderRadius: 8, marginTop: 20 },
  createButtonText: { color: 'white', textAlign: 'center' },
});

export default ContactScreen;
