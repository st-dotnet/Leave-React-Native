import React, { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import "../global.css";
import { AuthContextProvider, useAuth } from "../context/authContext";
import Toast from "react-native-toast-message";

const MainLayout = () => {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  useEffect(() => {
    if (typeof isAuthenticated == "undefined") return;
    const inApp = segments[0] == "(app)";
    if (isAuthenticated && !inApp) {
      router.replace("(app)/home", { headerShown: false });
    } else if (isAuthenticated == false) {
      router.replace("signIn");
    }
  }, [isAuthenticated]);
  return (
    <>
      <Slot />
      <Toast />
    </>
  );
};

export default function _layout() {
  return (
    <AuthContextProvider>
      <MainLayout />
    </AuthContextProvider>
  );
}
