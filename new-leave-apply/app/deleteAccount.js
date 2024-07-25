import { AntDesign } from "@expo/vector-icons";
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
import { useAuth } from "../context/authContext";

const DeleteAccount = () => {
  const router = useRouter();
  const { logOut } = useAuth();
  const [email, setEmail] = useState("");
  const [checked, setChecked] = useState(false);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSignUpClicked = async () => {
    if (!email) {
      Alert.alert("Please fill the email field!");
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert("Email is invalid");
      return;
    }
    if (!checked) {
      Alert.alert("Please agree to the terms and conditions");
      return;
    }
    Alert.alert(
      "Please Confirm",
      "Are you sure that you want to delete your account?",
      [{ text: "Yes", onPress: () => confirmDelete() }, { text: "No" }]
    );
  };

  const confirmDelete = async () => {
    Alert.alert(
      "Delete Account",
      "Your account will be deleted within 24 hours and you will not be able to log in anymore.",
      [{ text: "OK", onPress: () => handleDelete() }]
    );
  };

  const handleBack = async () => {
    router.replace("home");
  };

  const handleDelete = async () => {
    await logOut();
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
                <Text style={styles.title}>Delete Account</Text>
                <View style={styles.rightSpacer}></View>
              </View>
              <View style={{ paddingTop: hp(5), paddingHorizontal: wp(5) }}>
                <View style={styles.inputContainer}>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    placeholder="Email address"
                    placeholderTextColor={"gray"}
                  />
                </View>
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    onPress={() => setChecked(!checked)}
                    style={styles.checkbox}
                  >
                    <AntDesign
                      name={checked ? "checksquare" : "checksquareo"}
                      size={24}
                      color="black"
                    />
                  </TouchableOpacity>
                  <Text style={styles.text}>
                    By agreeing to the terms and conditions, you acknowledge
                    that you will not be able to log in to your account after it
                    has been deleted.
                  </Text>
                </View>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    onPress={handleSignUpClicked}
                    style={styles.button}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
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
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: hp(2),
  },
  text: {
    marginLeft: 8,
    fontSize: hp(2),
    color: "#333",
  },
  inputContainer: {
    height: hp(7),
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: hp(2),
  },
  input: {
    flex: 1,
    fontSize: hp(2),
    color: "#333",
  },
  buttonContainer: {
    alignItems: "center",
  },
});

export default DeleteAccount;
