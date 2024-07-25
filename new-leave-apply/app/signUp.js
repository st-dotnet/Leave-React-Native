import { AntDesign, Octicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  Platform,
  TextInput,
  Alert,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";

const SignUp = () => {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const resetFields = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSignUpClicked = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Please fill all the fields!');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Email is invalid');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }
    resetFields();
    Alert.alert(
      "Sign Up",
      "Request sent! Your account will be approved within 24 hours.",
      [
        { text: "OK", onPress: () => handleBack() }
      ]
    );
  };

  const handleBack = async () => {
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
              <View style={styles.header}>
                <AntDesign
                  name="left"
                  size={24}
                  onPress={handleBack}
                  color="black"
                />
                <Text style={styles.title}>Sign Up</Text>
                <View style={styles.rightSpacer}></View>
              </View>
              <View
                className="gap-10"
                style={{ paddingTop: hp(5), paddingHorizontal: wp(5) }}
              >
                <View className="gap-4">
                  <View
                    style={{ height: hp(7) }}
                    className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-2xl"
                  >
                    <AntDesign name="user" size={hp(2.7)} color="gray" />
                    <TextInput
                      value={firstName}
                      onChangeText={setFirstName}
                      style={{ fontSize: hp(2) }}
                      className="flex-1 font-semibold text-neutral-700"
                      placeholder="First Name"
                      placeholderTextColor={"gray"}
                    />
                  </View>
                  <View
                    style={{ height: hp(7) }}
                    className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-2xl"
                  >
                    <AntDesign name="user" size={hp(2.7)} color="gray" />
                    <TextInput
                      value={lastName}
                      onChangeText={setLastName}
                      style={{ fontSize: hp(2) }}
                      className="flex-1 font-semibold text-neutral-700"
                      placeholder="Last Name"
                      placeholderTextColor={"gray"}
                    />
                  </View>
                  <View
                    style={{ height: hp(7) }}
                    className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-2xl"
                  >
                    <Octicons name="mail" size={hp(2.7)} color="gray" />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
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
                      value={password}
                      onChangeText={setPassword}
                      style={{ fontSize: hp(2) }}
                      className="flex-1 font-semibold text-neutral-700"
                      placeholder="Password"
                      placeholderTextColor={"gray"}
                      secureTextEntry
                    />
                  </View>
                  <View
                    style={{ height: hp(7) }}
                    className="flex-row gap-4 px-4 bg-neutral-100 items-center rounded-2xl"
                  >
                    <Octicons name="lock" size={hp(2.7)} color="gray" />
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      style={{ fontSize: hp(2) }}
                      className="flex-1 font-semibold text-neutral-700"
                      placeholder="Confirm Password"
                      placeholderTextColor={"gray"}
                      secureTextEntry
                    />
                  </View>
                  <View className="items-center">
                    <TouchableOpacity
                      onPress={handleSignUpClicked}
                      style={styles.button}
                    >
                      <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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
    letterSpacing: 1.5, // Adjust this value to match 'tracking-wider'
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? hp(2) : hp(7),
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  rightSpacer: {
    width: 24,
  },
});

export default SignUp;
