import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import React, { useRef, useState } from "react";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Octicons } from "@expo/vector-icons";
import Loading from "../components/loading";
import { useAuth } from "../context/authContext";
import { useRouter } from "expo-router";

export default function SignIn() {
  const router = useRouter();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSignIn = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert("Sign In", "Please fill all the fields!");
      return;
    }
    setLoading(true);
    await login(emailRef.current, passwordRef.current);
    setLoading(false);
  };

  const handleSignUp = async () => {
    router.push("signUp");
  };

  return (
    <View className="flex-1">
      <View
        style={{ paddingTop: hp(20), paddingHorizontal: wp(5) }}
        className="flex-1 gap-12"
      >
        <View className="items-center">
          <Image
            style={{ height: hp(7) }}
            resizeMode="contain"
            source={require("../assets/images/SupremeLogo.png")}
          />
        </View>
        <View className="gap-10">
          <View className="gap-4">
            <View
              style={{ height: hp(7) }}
              className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-2xl"
            >
              <Octicons name="mail" size={hp(2.7)} color="gray" />
              <TextInput
                onChangeText={(value) => (emailRef.current = value)}
                style={{ fontSize: hp(2) }}
                className="flex-1 font-semibold text-neutral-700"
                placeholder="Email address"
                placeholderTextColor={"gray"}
              />
            </View>
            <View
              style={{ height: hp(7) }}
              className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-2xl"
            >
              <Octicons name="lock" size={hp(2.7)} color="gray" />
              <TextInput
                onChangeText={(value) => (passwordRef.current = value)}
                style={{ fontSize: hp(2) }}
                className="flex-1 font-semibold text-neutral-700"
                placeholder="Password"
                placeholderTextColor={"gray"}
                secureTextEntry
              />
            </View>
            <View className="items-center" style={{ paddingTop: hp(2)}}>
              {loading ? (
                <View className="flex-flow justify-center">
                  <Loading size={hp(6.5)} />
                </View>
              ) : (
                <TouchableOpacity onPress={handleSignIn} style={styles.button}>
                  <Text style={styles.buttonText}>SignIn</Text>
                </TouchableOpacity>
              )}
            </View>
            <View className="items-center" style={styles.container}>
              <Text style={styles.text}>
                Don't have an account?{" "}
                <TouchableOpacity onPress={handleSignUp}>
                  <Text style={styles.linkText}>Sign up now!</Text>
                </TouchableOpacity>
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: hp(6.5),
    backgroundColor: "black",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    width: wp(30),
  },
  buttonText: {
    fontSize: hp(2.7),
    color: "white",
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: hp(1),
  },
  text: {
    fontSize: hp(2.3),
    color: '#000',
  },
  linkText: {
    fontSize: hp(2.3),
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
});
