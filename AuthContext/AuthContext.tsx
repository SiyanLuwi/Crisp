import axios from "axios";
import React, { useState, createContext, useEffect, useContext } from "react";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import api from "@/app/api/axios";
import * as FileSystem from "expo-file-system";
import { app } from "@/firebase/firebaseConfig";
import { addDoc, doc, getFirestore, setDoc } from "firebase/firestore";
const db = getFirestore(app);

interface AuthProps {
  onRefresh?: (refreshToken: string) => Promise<any>;
  USER_ID?: string;
  peerConnection?: any;
  setPeerConnection?: any;
  incomingCall?: any;
  hasNewNotification?: boolean;
  setIncomingCall?: any;
  authState?: { token: string | null; authenticated: boolean | null };
  onRegister?: (
    username: string,
    email: string,
    password: string,
    password_confirm: string,
    address: string,
    coordinates: string,
    contact_no: string
  ) => Promise<any>;
  onLogin?: (username: string, password: string) => Promise<any>;
  onVerifyEmail?: (email: string, otp: string) => Promise<any>;
  createReport?: (
    type_of_report: string,
    report_description: string,
    longitude: string,
    latitude: string,
    is_emergency: string,
    image_path: string,
    custom_type: string,
    floor_number: string
  ) => Promise<any>;
  onLogout?: () => Promise<any>;
  getUserInfo?: () => Promise<any>;
  updateProfile?: (
    username: string,
    address: string,
    contact_no: string,
    coordinates: string
  ) => Promise<any>;
  verifyCurrentPassword?: (currentPassword: string) => Promise<any>;
  changePassword?: (
    currentPassword: string,
    newPassword: string
  ) => Promise<any>;
  verifyAccount?: (
    firstName: string,
    middleName: string,
    lastName: string,
    address: string,
    // birthday: string,
    idNumber: string,
    selfie: string,
    photo: string,
    idPicture: string
  ) => Promise<void>;
}
interface CallerInfo {
  callId: string;
  callerId: string;
  callerName: string;
  receiverId: string;
  callStatus: string;
}
import * as Network from "expo-network";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { scheduleNotification } from "@/app/utils/notifications";
const TOKEN_KEY = "my-jwt";
const REFRESH_KEY = "my-jwt-refresh";
const EXPIRATION = "accessTokenExpiration";
const ROLE = "my-role";
// export const API_URL = "http://192.168.1.191:8000"; //change this based on your url
const AuthContext = createContext<AuthProps>({});
export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: any) => {
  const [hasNewNotification, setHasNewNotification] = useState<boolean>(false);
  const [authState, setAuthState] = useState<{
    token: string | null;
    authenticated: boolean | null;
  }>({
    token: null,
    authenticated: null,
  });
  const [incomingCall, setIncomingCall] = useState<CallerInfo | any>(null); // Store incoming call details
  const [USER_ID, SET_USER_ID] = useState("");
  const [peerConnection, setPeerConnection] = useState(null);

  const router = useRouter();

  // useEffect(() => {
  //   console.log("getting incoming call...")
  //   const q = query(collection(db, 'calls'), where('receiver_id', '==', USER_ID));
  //   console.log("Receiver ID: ", USER_ID)

  //   const unsubscribe = onSnapshot(q, async (snapshot) => {
  //     if (!snapshot.empty) {

  //       const callData = snapshot.docs[0].data();
  //       setIncomingCall(callData);

  //       if (callData.callStatus == 'waiting') {
  //         receiveIncomingCall(callData)
  //         router.push('/(tabs)/screens/IncomingCallScreen');
  //       }
  //       if (callData.callStatus === 'ended') {
  //         setIncomingCall(null);
  //         router.push('/(tabs)/screens/ContactScreen');
  //       }
  //     } else {
  //       if (incomingCall && incomingCall.callStatus !== 'answered' && incomingCall.callStatus !== 'declined') {
  //         setIncomingCall(null);
  //       }
  //     }
  //   });

  //   return () => unsubscribe();
  // }, [USER_ID]);

  const receiveIncomingCall = (callData: any) => {
    setIncomingCall(callData); // Ensure callData contains the expected structure
  };

  const clearIncomingCall = () => {
    setIncomingCall(null);
  };

  useEffect(() => {
    const loadToken = async () => {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      console.log("stored: ", token);
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setAuthState({
          token: token,
          authenticated: true,
        });
      }
    };
    const loadId = async () => {
      const user_id = await SecureStore.getItemAsync("user_id");
      if (user_id) {
        SET_USER_ID(user_id);
      }
    };
    loadId();
    loadToken();
  }, []);

  const getAddressFromCoordinates = async (
    latitude: number,
    longitude: number
  ) => {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "CRISP/1.0.9 crisp.uccbscs@gmail.com", // Replace with your app name and contact email
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error fetching address:", errorText);
        return null;
      }

      const data = await response.json();

      if (data && data.address) {
        console.log(data);
        const { residential, town, state, country } = data.address;
        const addressParts = [residential, town, state, country].filter(
          Boolean
        );
        const address = addressParts.join(", "); // Join non-empty parts
        return addressParts || "Address not found";
      } else {
        console.error("Nominatim API error:", data);
        return "Address not found";
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      return null;
    }
  };

  //register function
  const register = async (
    username: string,
    email: string,
    password: string,
    password_confirm: string,
    address: string,
    coordinates: string,
    contact_no: string
  ) => {
    const ipv = await Network.getIpAddressAsync();
    try {
      const res = await api.post("api/citizen/registration/", {
        username,
        email,
        password,
        password_confirm,
        address,
        coordinates,
        contact_number: contact_no,
        ipv,
      });

      await SecureStore.setItemAsync("email", email.toString());

      return res;
    } catch (error: any) {
      if (error.response && error.response.data) {
        // console.error("Register error details:", error.response.data);
        const errorMessage =
          error.response.data?.username ||
          error.response.data?.email ||
          error.response.data?.contact_number ||
          error.response.data?.ipv ||
          "Unknown error occurred";
        return {
          error: true,
          msg: errorMessage,
        };
      } else {
        console.error("Register error:", error);
        return {
          error: true,
          msg: "An unknown error occurred during registration.",
        };
      }
    }
  };

  //Login function
  const login = async (username: string, password: string) => {
    try {
      console.log("Starting login process for username:", username); // Log the username
      // Implement login functionality here
      const { data } = await api.post(`api/token/`, {
        username,
        password,
      });
      console.log("Login response received:", data); // Log the response from the server

      if (!data.access || !data.refresh) {
        throw new Error(
          "Authentication failed. No access or refresh token received."
        );
      }

      setAuthState({
        token: data.access,
        authenticated: true,
      });
      SET_USER_ID(data.user_id.toString());
      const expirationTime = Date.now() + 60 * 60 * 1000;
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.access}`;

      
      const storageItems: any = {
        [TOKEN_KEY]: data.access,
        [REFRESH_KEY]: data.refresh,
        [ROLE]: data.account_type,
        [EXPIRATION]: expirationTime,
        user_id: data.user_id,
        username: data.username,
        email: data.email,
        address: data.address || "",
        contact_number: data.contact_number,
        account_type: data.account_type,
        is_email_verified: data.is_email_verified,
        is_verified: data.is_verified,
        score: data.score,
        violation: data.violation,
      };
      if(data.account_type === 'worker'){
        console.log("SUpervisor id: ", data.supervisor)
          storageItems.supervisor_id = data.supervisor
      }

      await Promise.all(
        Object.entries(storageItems).map(async ([key, value]) => {
          if (value !== null && value !== undefined) {
            try {
              await SecureStore.setItemAsync(key, value.toString());
            } catch (err) {
              console.error(`Failed to save key ${key} to SecureStore:`, err);
            }
          } else {
            console.warn(`Skipping key ${key} due to null or undefined value`);
          }
        })
      );

      return data;
    } catch (error: any) {
      // console.error("Login error occurred:", error);
      if (error.response) {
        console.log("Error response data:", error.response.data);
        if (error.response.status === 401) {
          throw new Error("Invalid username or password!");
        } else {
          throw new Error("An unexpected error occurred");
        }
      } else {
        throw new Error("Network error or server not reachable");
      }
    }
  };

  const logout = async () => {
    const storageItems = [
      TOKEN_KEY,
      REFRESH_KEY,
      ROLE,
      EXPIRATION,
      "user_id",
      "username",
      "email",
      "address",
      "contact_number",
      "account_type",
      "is_email_verified",
      "is_verified",
      "supervisor_id",
    ];

    await Promise.all(
      storageItems.map(async (key) => {
        await SecureStore.deleteItemAsync(key);
      })
    );
    setAuthState({
      token: null,
      authenticated: null,
    });
    console.log("Logging out...");
    router.push("/pages/login");
  };

  const onVerifyEmail = async (email: string, otp: string) => {
    try {
      const res = await api.post(`api/otp/verify/`, {
        email,
        otp,
      });
      if (res.status === 200 || res.status === 201) {
        await scheduleNotification(
          "Registration Successfully!!",
          "Welcome to the community! Start exploring the app now. Please kindly login your details.",
          1,
          ""
        );
        router.push("/pages/login");
        return;
      }
      throw new Error(res.status.toString() + " status code!");
    } catch (error: any) {
      if (error.response) {
        console.log("Error response data:", error.response.data);
        if (error.response.status === 401) {
          throw new Error("Invalid email or Otp");
        } else {
          throw new Error("An unexpected error occurred");
        }
      } else {
        throw new Error("Network error or server not reachable");
      }
    }
  };

  const createReport = async (
    type_of_report: string,
    report_description: string,
    longitude: string,
    latitude: string,
    is_emergency: string,
    image_path: string,
    custom_type: string,
    floor_number: string
  ) => {
    console.log(
      type_of_report,
      report_description,
      longitude,
      latitude,
      is_emergency,
      image_path,
      custom_type,
      floor_number
    );
    const formData = new FormData();
    formData.append("type_of_report", type_of_report);
    formData.append("report_description", report_description);
    formData.append("longitude", longitude);
    formData.append("latitude", latitude);
    formData.append("is_emergency", is_emergency);

    const imageBase64 = await FileSystem.readAsStringAsync(image_path, {
      encoding: FileSystem.EncodingType.Base64,
    });
    formData.append("image_path", `data:image/jpeg;base64,${imageBase64}`);
    formData.append("custom_type", custom_type);
    formData.append("floor_number", floor_number);
    try {
      const res = await api.post("api/create-report/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authState.token}`,
        },
      });
      if (res.status === 201 || res.status === 200) {
        return res;
      }
    } catch (error: any) {
      console.error("Error details:", error); // Log the complete error object
      if (error.response) {
        console.error("Error response data:", error.response.data); // Log the response data if available
        console.error("Error response status:", error.response.status); // Log the status code
        throw new Error(
          `An unexpected error occurred: ${
            error.response.data.message || error.message
          }`
        );
      } else {
        throw new Error(`An unexpected error occurred: ${error.message}`);
      }
    }
  };

  const getUserInfo = async () => {
    try {
      const username = await SecureStore.getItemAsync("username");
      const email = await SecureStore.getItemAsync("email");
      const address = await SecureStore.getItemAsync("address");
      const contact_number = await SecureStore.getItemAsync("contact_number");
      const is_verified = await SecureStore.getItemAsync("is_verified");
      console.log("is_verified: ", is_verified);

      return {
        username,
        email,
        address,
        contact_number,
        is_verified: is_verified === "true",
      };
    } catch (error) {
      console.error("Error retrieving user information:", error);
      return null;
    }
  };

  const updateProfile = async (
    username: string,
    address: string,
    contact_no: string,
    coordinates: string
  ) => {
    try {
      // const ipv = await Network.getIpAddressAsync(); // Get the current IP address if required
      const res = await api.put(
        `api/user/profile/`,
        {
          username,
          address,
          contact_number: contact_no,
          coordinates,
          // ipv, // Include the IP address if it's required for the update
        },
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        }
      );

      // Update the SecureStore with the new information
      await SecureStore.setItemAsync("username", username);
      await SecureStore.setItemAsync("address", address);
      await SecureStore.setItemAsync("contact_number", contact_no);
      await SecureStore.setItemAsync("coordinates", coordinates);

      return res.data; // Return the updated user data
    } catch (error: any) {
      console.error("Update profile error:", error);

      if (error.response) {
        throw new Error(
          error.response.data.message || "Failed to update profile"
        );
      } else {
        throw new Error("Network error or server not reachable");
      }
    }
  };

  const verifyCurrentPassword = async (currentPassword: string) => {
    try {
      const response = await api.post(
        "api/verify-password/",
        {
          password: currentPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        }
      );

      return response.data.valid; // Assume the API returns { valid: true/false }
    } catch (error) {
      // console.error("Error verifying password:", error);
      throw new Error("Could not verify current password.");
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      const response = await api.put(
        "api/change-password/",
        {
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirm: newPassword, // Include this field
        },
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        }
      );

      return response.data; // Return the response from the server
    } catch (error) {
      console.error("Error changing password:", error);
      throw new Error("Could not change password.");
    }
  };

  const verifyAccount = async (
    firstName: string,
    middleName: string,
    lastName: string,
    address: string,
    // birthday: string,
    idNumber: string,
    selfie: string,
    photo: string,
    idPicture: string
  ) => {
    const formData = new FormData();
    formData.append("first_name", firstName);
    formData.append("middle_name", middleName);
    formData.append("last_name", lastName);
    formData.append("text_address", address);
    // formData.append("birthday", birthday);
    formData.append("id_number", idNumber);

    const selfieBase64 = await FileSystem.readAsStringAsync(selfie, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const photoBase64 = await FileSystem.readAsStringAsync(photo, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const idPictureBase64 = await FileSystem.readAsStringAsync(idPicture, {
      encoding: FileSystem.EncodingType.Base64,
    });

    formData.append(
      "id_selfie_image_path",
      `data:image/jpeg;base64,${selfieBase64}`
    );
    formData.append(
      "photo_image_path",
      `data:image/jpeg;base64,${photoBase64}`
    );
    formData.append(
      "id_picture_image_path",
      `data:image/jpeg;base64,${idPictureBase64}`
    );

    try {
      const res = await api.post("api/verify-account/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authState.token}`,
        },
      });
      if (res.status === 201 || res.status === 200) {
        // alert("Verification request has been sent!");
        const notifCollectionRef = collection(db, 'notifications');
        await addDoc(notifCollectionRef, {
            title: "Verification Request Submitted",
            description: "A citizen has submitted verification information for review. Please take action.",
            for_superadmin: true,
            createdAt: new Date(),
            user_id: USER_ID
        });
        router.push("/(tabs)/profile");
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      if (error.response) {
        alert(`Error: ${error.response.data.message || error.message}`);
      } else {
        alert(`Error: ${error.message}`);
      }
    }
  };
  const refreshAccessToken = async (refreshToken: string) => {
    try {
      console.log(refreshAccessToken);
      const { data } = await api.post("api/token/refresh/", {
        refresh: refreshToken,
      });

      setAuthState({
        token: data.access,
        authenticated: true,
      });
      SET_USER_ID(data.user_id.toString());
      const expirationTime = Date.now() + 60 * 60 * 1000;
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.access}`;

      const storageItems = {
        [TOKEN_KEY]: data.access,
        [REFRESH_KEY]: data.refresh,
        [ROLE]: data.account_type,
        [EXPIRATION]: expirationTime.toString(),
        user_id: data.user_id.toString(),
        username: data.username,
        email: data.email,
        address: data.address,
        contact_number: data.contact_number,
        account_type: data.account_type,
        is_email_verified: data.is_email_verified,
        is_verified: data.is_verified,
      };

      await Promise.all(
        Object.entries(storageItems).map(([key, value]) =>
          SecureStore.setItemAsync(key, value.toString())
        )
      );

      return data;
    } catch (error) {
      console.error("Failed to refresh access token:", error);
      return null;
    }
  };

  const value = {
    onRegister: register,
    onLogin: login,
    onLogout: logout,
    onVerifyEmail: onVerifyEmail,
    authState,
    USER_ID,
    createReport: createReport,
    getUserInfo,
    updateProfile,
    verifyCurrentPassword,
    changePassword,
    verifyAccount,
    onRefresh: refreshAccessToken,
    getAddressFromCoordinates,
    hasNewNotification,
    incomingCall,
    setIncomingCall,
    peerConnection,
    setPeerConnection,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
