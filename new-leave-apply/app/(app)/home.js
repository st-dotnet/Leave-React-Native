import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Button,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "expo-router";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { useAuth } from "../../context/authContext";
import RNDateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import Toast from "react-native-toast-message";
import { LeaveDurationEnum, LeaveTypeEnum } from "../../constants/leaveEnums";

export default function Home() {
  const navigation = useNavigation();
  const { logOut } = useAuth();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleSignOut = async () => {
    await logOut();
  };

  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  //----------Show/Hide------------
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showLeaveDurationField, setShowLeaveDurationField] = useState(false);

  const [leaveType, setLeaveType] = useState(0);
  const [selectedLeaveDuration, setSelectedLeaveDuration] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reason, setReason] = useState("");
  const [leaveDurationOptions, setLeaveDurationOptions] = useState(() => {
    return Object.values(LeaveDurationEnum).map((item) => {
      return { label: item.name, value: item.value };
    });
  });

  //----------------------- Error States------------------------
  const [errorLeaveType, seterrorLeaveType] = useState(false);
  const [errorLeaveDuration, seterrorLeaveDuration] = useState(false);
  const [errorStartDate, seterrorStartDate] = useState(false);
  const [errorEndDate, seterrorEndDate] = useState(false);
  const [errorReason, seterrorReason] = useState(false);

  const onStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    if (event.type == "set") {
      if (endDate && currentDate > endDate) {
        setEndDate(currentDate); //End Date can not be less than start
      }
      setStartDate(currentDate);
      seterrorStartDate(false);
    }
    setShowStartPicker(false);
  };

  const onEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    if (event.type == "set") {
      setEndDate(currentDate);
      seterrorEndDate(false);
    }
    setShowEndPicker(false);
  };
  const isWeekend = (date) => {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };
  const handleSubmit = () => {
    if (leaveType == 0) seterrorLeaveType(true);
    if (selectedLeaveDuration == 0 && showLeaveDurationField)
      seterrorLeaveDuration(true);
    if (!startDate) seterrorStartDate(true);
    if (!endDate) seterrorEndDate(true);
    if (reason == "") seterrorReason(true);
    if (
      leaveType == 0 ||
      (selectedLeaveDuration == 0 && showLeaveDurationField) ||
      !startDate ||
      !endDate ||
      reason == ""
    ) {
      console.log("xxxxxxxx");
      return;
    }
    //--------------------------
    currentDate = new Date();
    if (
      leaveType == LeaveTypeEnum.SickLeave.value &&
      formatDate(startDate) !== formatDate(currentDate)
    ) {
      Toast.show({
        type: "error",
        text1: "Sick Leave cannot be applied for future date.",
      });
      return;
    }
    if (isWeekend(startDate) || isWeekend(endDate)) {
      Toast.show({
        type: "error",
        text1: "Leaves cannot be applied for weekends.",
      });
      return;
    }
    if (
      (selectedLeaveDuration == LeaveDurationEnum.HalfDay.value ||
        leaveType == LeaveTypeEnum.ShortLeave.value) &&
      formatDate(startDate) !== formatDate(endDate)
    ) {
      Toast.show({
        type: "error",
        text1:
          "End date must match start date for half/short leave.",
      });
      return;
    }
    //--------------------------
    console.log("leaveType:", leaveType);
    console.log("startDate:", startDate);
    console.log("endDate:", endDate);
    console.log("reason:", reason);
    setStartDate(null);
    setEndDate(null);
    setReason("");
    setLeaveType(0);
  };

  const handleLeaveTypeChange = (leaveType) => {
    const defaultLeaveDurationOptions = Object.values(LeaveDurationEnum).map(
      (item) => {
        return { label: item.name, value: item.value };
      }
    );
    if (
      leaveType == LeaveTypeEnum.WorkFromHome.value ||
      leaveType == LeaveTypeEnum.SickLeave.value
    ) {
      setLeaveDurationOptions(
        defaultLeaveDurationOptions.filter(
          (option) => option.value !== LeaveDurationEnum.HalfDay.value
        )
      );
      setSelectedLeaveDuration("0");
      setShowLeaveDurationField(true);
    } else if (leaveType == LeaveTypeEnum.ShortLeave.value) {
      setSelectedLeaveDuration("0");
      setShowLeaveDurationField(false);
    } else {
      setLeaveDurationOptions(defaultLeaveDurationOptions);
      setSelectedLeaveDuration("0");
      setShowLeaveDurationField(true);
    }
  };

  return (
    <SafeAreaView className="flex-1">
      <View
        style={{ paddingTop: hp(5), paddingHorizontal: wp(5) }}
        className="flex-1 gap-12"
      >
        <View className="flex flex-row justify-between items-center">
          <Text style={{ fontSize: 20 }}>Add Leave</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.button}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.container}>
          {/* --------------------------- */}
          <View style={styles.inputContainer}>
            <Text>Leave Type : </Text>
            <Picker
              style={styles.textInput}
              selectedValue={leaveType}
              onValueChange={(itemValue, itemIndex) => {
                handleLeaveTypeChange(itemValue);
                setLeaveType(itemValue);
                seterrorLeaveType(false);
              }}
            >
              <Picker.Item
                label="Please select leave type..."
                value="0"
                enabled={false}
                color={"gray"}
              />
              <Picker.Item label="Sick Leave" value="1" color={"black"} />
              <Picker.Item label="Casual Leave" value="2" />
              <Picker.Item label="Work From Home" value="3" />
              <Picker.Item label="Short Leave" value="4" />
            </Picker>
            {errorLeaveType && (
              <Text className="text-red-500">Please select Leave Type!</Text>
            )}
          </View>
          {/*------------------ Leave Duration ---------------------*/}
          {showLeaveDurationField ? (
            <View style={styles.inputContainer}>
              <Text>Leave Duration : </Text>
              <Picker
                style={styles.textInput}
                selectedValue={selectedLeaveDuration}
                onValueChange={(itemValue, itemIndex) => {
                  // handleLeaveTypeChange(itemValue);
                  setSelectedLeaveDuration(itemValue);
                  seterrorLeaveDuration(false);
                }}
              >
                <Picker.Item
                  label="Please select leave duration..."
                  value="0"
                  enabled={false}
                  color={"gray"}
                />
                {leaveDurationOptions.map((option) => (
                  <Picker.Item
                    key={option.value}
                    label={option.label}
                    value={option.value}
                    color={"black"}
                  />
                ))}
              </Picker>
              {errorLeaveDuration && (
                <Text className="text-red-500">
                  Please select Leave Duration!
                </Text>
              )}
            </View>
          ) : null}
          {/* --------------------------- */}
          <View style={styles.inputContainer}>
            <Text>Start Date</Text>
            <TextInput
              style={styles.textInput}
              onPressIn={() => setShowStartPicker(true)}
              value={startDate ? formatDate(startDate) : ""}
              placeholder="Select start date"
            />
            {showStartPicker && (
              <RNDateTimePicker
                value={startDate || new Date()}
                mode="date"
                display="default"
                onChange={onStartDateChange}
                minimumDate={new Date()}
              />
            )}
            {errorStartDate && (
              <Text className="text-red-500">Please select Start Date!</Text>
            )}
          </View>
          <View style={styles.inputContainer}>
            <Text>End Date</Text>
            <TextInput
              style={styles.textInput}
              onPressIn={() => setShowEndPicker(true)}
              value={endDate ? formatDate(endDate) : ""}
              placeholder="Select end date"
            />
            {showEndPicker && (
              <RNDateTimePicker
                value={endDate || new Date()}
                mode="date"
                display="default"
                onChange={onEndDateChange}
                minimumDate={startDate}
              />
            )}
            {errorEndDate && (
              <Text className="text-red-500">Please select End Date!</Text>
            )}
          </View>
          <View style={styles.inputContainer}>
            <Text>Reason</Text>
            <TextInput
              style={[styles.textInput, { height: 100 }]}
              multiline
              value={reason}
              onChangeText={(text) => {
                setReason(text);
                seterrorReason(false);
              }}
              placeholder="Enter reason"
            />
            {errorReason && (
              <Text className="text-red-500">Please input a Reason!</Text>
            )}
          </View>
          <Button title="Submit" onPress={handleSubmit} />
        </View>
      </View>
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
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
    width: "100%",
  },
  textInput: {
    height: 40,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  picker: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
  },
  disabledItem: {
    color: "gray",
  },
});
