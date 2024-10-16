import axios from "axios";
import React, { useState, createContext, useEffect, useContext } from "react";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import api from "@/app/api/axios";
import * as FileSystem from "expo-file-system";
interface AuthProps {
  authState?: { token: string | null; authenticated: boolean | null };
  onRegister?: (
    username: string,
    email: string,
    password: string,
    password_confirm: string,
    address: string,
    contact_no: string
  ) => Promise<any>;
  onLogin?: (username: string, password: string) => Promise<any>;
  onVerifyEmail?: (email: string, otp: string) => Promise<any>;
  createReport?: (
    type_of_report: string,
    report_description: string,
    longitude: string,
    latitude: string,
    category: string,
    image_path: string
  ) => Promise<any>;
  onLogout?: () => Promise<any>;
  getUserInfo?: () => Promise<any>;
  updateProfile?: (
    username: string,
    address: string,
    contact_no: string
  ) => Promise<any>;
  verifyCurrentPassword?: (currentPassword: string) => Promise<any>;
  changePassword?: (
    currentPassword: string,
    newPassword: string
  ) => Promise<any>;
}
import * as Network from "expo-network";
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
  const [authState, setAuthState] = useState<{
    token: string | null;
    authenticated: boolean | null;
  }>({
    token: null,
    authenticated: null,
  });

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
    loadToken();
  }, []);

  //register function
  const register = async (
    username: string,
    email: string,
    password: string,
    password_confirm: string,
    address: string,
    contact_no: string
  ) => {
    const ipv = await Network.getIpAddressAsync();
    try {
      const res = await api.post(`api/citizen/registration/`, {
        username,
        email,
        password,
        password_confirm,
        address,
        contact_number: contact_no,
        ipv,
      });

      await SecureStore.setItemAsync("email", email.toString());

      return res;
    } catch (error) {
      console.error(error);
      return { error: true, msg: "Register error!" };
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

      const expirationTime = Date.now() + 60 * 60 * 1000;
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.access}`;

      const storageItems = {
        [TOKEN_KEY]: data.access,
        [REFRESH_KEY]: data.refresh,
        [ROLE]: data.account_type,
        [EXPIRATION]: expirationTime.toString(),
        username: data.username,
        email: data.email,
        address: data.address,
        contact_number: data.contact_number,
        is_email_verified: data.is_email_verified,
      };

      await Promise.all(
        Object.entries(storageItems).map(([key, value]) =>
          SecureStore.setItemAsync(key, value.toString())
        )
      );

      return data;
    } catch (error: any) {
      console.error("Login error occurred:", error);
      if (error.response) {
        console.log("Error response data:", error.response.data);
        if (error.response.status === 401) {
          throw new Error("Invalid username or password");
        } else {
          throw new Error("An unexpected error occurred");
        }
      } else {
        throw new Error("Network error or server not reachable");
      }
    }
  };

  const logout = async () => {
    axios.defaults.headers.common["Authorization"] = "";
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
    await SecureStore.deleteItemAsync(EXPIRATION);
    await SecureStore.deleteItemAsync(ROLE);
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
    category: string,
    image_path: string
  ) => {
    console.log(
      type_of_report,
      report_description,
      longitude,
      latitude,
      category,
      image_path
    );
    const formData = new FormData();
    formData.append("type_of_report", type_of_report);
    formData.append("report_description", report_description);
    formData.append("longitude", longitude);
    formData.append("latitude", latitude);
    formData.append("category", category);

    const imageBase64 = await FileSystem.readAsStringAsync(image_path, {
      encoding: FileSystem.EncodingType.Base64,
    });
    formData.append("image_path", `data:image/jpeg;base64,${imageBase64}`);
    try {
      const res = await api.post("api/create-report/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${authState.token}`,
        },
      });
      if (res.status === 201 || res.status === 200) {
        alert("Report Created!");
        router.push("/(tabs)/reports");
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

      return {
        username,
        email,
        address,
        contact_number,
      };
    } catch (error) {
      console.error("Error retrieving user information:", error);
      return null;
    }
  };

  const updateProfile = async (
    username: string,
    address: string,
    contact_no: string
  ) => {
    try {
      const ipv = await Network.getIpAddressAsync(); // Get the current IP address if required
      const res = await api.put(
        `api/user/profile/`,
        {
          username,
          address,
          contact_number: contact_no,
          ipv, // Include the IP address if it's required for the update
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
      console.error("Error verifying password:", error);
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

  const value = {
    onRegister: register,
    onLogin: login,
    onLogout: logout,
    onVerifyEmail: onVerifyEmail,
    authState,
    createReport: createReport,
    getUserInfo,
    updateProfile,
    verifyCurrentPassword,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
