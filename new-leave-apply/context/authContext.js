import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import parseJwt from "./ParseJwt";

const TOKEN_KEY = "accessToken";
const USER = "user";
const ROLE = "role";
const API_URL = "https://crm.supremetechnologiesindia.com/backend/api";
export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);
  isValidToken = (accessToken) => {
    const parseToken = parseJwt(accessToken);
    const currentTime = Date.now() / 1000;
    if (parseToken.exp < currentTime || !accessToken) {
      return false;
    } else {
      return true;
    }
  };
  useEffect(() => {
    async function fetchAccessToken() {
      try {
        const accessToken = await AsyncStorage.getItem(TOKEN_KEY);
        if (accessToken && isValidToken(accessToken)) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error fetching access token:", error);
        setIsAuthenticated(false);
      }
    }

    fetchAccessToken();
  }, []);

  login = async (username, password) => {
    try {
      const body = {
        email: username,
        password: password,
        isExternalLogin: false,
      };
      const response = await axios
        .post(`${API_URL}/employee/authenticate`, body, {})
        .then((response) => response)
        .catch((error) => {
          console.error("Error api0:", error);
          setIsAuthenticated(false);
          return;
        });

      if (response.data.success) {
        await AsyncStorage.setItem(TOKEN_KEY, response.data.api_token);
        await AsyncStorage.setItem(USER, JSON.stringify(response.data.user));
        await AsyncStorage.setItem(ROLE, response.data.user.role);
        setIsAuthenticated(true);
        return true;
      }
    } catch (error) {
      console.error("Error api:", error);
      setIsAuthenticated(false);
      return;
    }
  };

  logOut = async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      await AsyncStorage.removeItem(USER);
      await AsyncStorage.removeItem(ROLE);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  getUserDetail = async () => {
    const userDetail = await AsyncStorage.getItem(USER);
    return userDetail;
  };

  getAccessToken = async () => {
    const accessToken = await AsyncStorage.getItem(TOKEN_KEY);
    return accessToken;
  };
  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logOut, getUserDetail, getAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be wrapped inside AuthContextProvider");
  }
  return value;
};
