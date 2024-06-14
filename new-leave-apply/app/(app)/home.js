import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import React, { useEffect } from "react";
import { useNavigation } from "expo-router";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useAuth } from "../../context/authContext";

export default function Home() {
  const navigation = useNavigation();
  const { logOut } = useAuth();

  const handleSignOut = async () => {
    await logOut();
  };

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  return (
    <SafeAreaView className="flex-1">
      <View
        style={{ paddingTop: hp(5), paddingHorizontal: wp(5) }}
        className="flex-1 gap-12"
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 20 }}>New Header Name</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.button}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text>Home</Text>
    </SafeAreaView>
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
    letterSpacing: 1.5, // Adjust this value to match 'tracking-wider'
  },
});
