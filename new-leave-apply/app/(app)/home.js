import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Button,
  Image,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
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
import * as ImagePicker from "expo-image-picker";
import { LeaveService } from "../../Services/leaveService";

export default function Home() {
  const navigation = useNavigation();
  const { logOut, getUserDetail, getAccessToken } = useAuth();
  const scrollViewRef = useRef();

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
  const [loading, setLoading] = useState(false);
  //----------Show/Hide------------
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showLeaveDurationField, setShowLeaveDurationField] = useState(false);
  const [showMedicalField, setShowMedicalField] = useState(false);

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
  const [image, setImage] = useState(null);
  const handleMedicalChange = async () => {
    // Ask for the necessary permissions
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
        return;
      }
    }

    // Launch the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result);
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }
  };

  //----------------------- Error States------------------------
  const [errorLeaveType, seterrorLeaveType] = useState(false);
  const [errorLeaveDuration, seterrorLeaveDuration] = useState(false);
  const [errorStartDate, seterrorStartDate] = useState(false);
  const [errorEndDate, seterrorEndDate] = useState(false);
  const [errorReason, seterrorReason] = useState(false);
  const [medicalFieldRequired, setMedicalFieldRequired] = useState(true);

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
  const handleSubmit = async () => {
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
        text1: "End date must match start date for half/short leave.",
      });
      return;
    }
    const maxAllowedDays =
      leaveType == LeaveTypeEnum.CasualLeave.value ? 12 : 9;
    const durationInDays =
      Math.floor(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;

    if (durationInDays > maxAllowedDays) {
      Toast.show({
        type: "error",
        text1: `Maximum allowed leave duration is ${maxAllowedDays} days.`,
      });
      return;
    } else {
      setLoading(true);
      var userDetailJSON = await getUserDetail();
      var userDetail = JSON.parse(userDetailJSON);
      const accessToken = await getAccessToken();
      var data = {
        leaveType: leaveType,
        startDate: formatDateToSend(startDate),
        endDate: formatDateToSend(endDate),
        reason: reason,
        leaveDuration: selectedLeaveDuration,
        medicalFile: "",
        employeeId: userDetail.employeeId,
        status: 1,
        isActive: true,
        isEditable: true,
        isUnpaidLeave: false,
        IsApprovedByHr: false,
      };
      await LeaveService.addNewLeave(data, image, accessToken)
        .then((response) => {
          if (response?.success) {
            Toast.show({
              type: "success",
              text1: `Leave Applied Successfully`,
            });
            resetAllFields();
          } else {
            Toast.show({
              type: "error",
              text1: `${response?.message}`,
            });
          }
        })
        .catch((error) => {
          Toast.show({
            type: "error",
            text1: `Failed to apply leave`,
          });
        });
      setLoading(false);
    }
  };
  const resetAllFields = () => {
    setLeaveType(0);
    setSelectedLeaveDuration(0);
    setStartDate(null);
    setEndDate(null);
    setReason("");
    setImage(null);
  };
  const formatDateToSend = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
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

  useEffect(() => {
    const onChangeHandleMedical = async () => {
      if (
        leaveType == 0 ||
        selectedLeaveDuration == 0 ||
        !startDate ||
        !endDate
      ) {
        setShowMedicalField(false);
        return;
      }
      const durationInDays =
        Math.floor(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        ) + 1;
      if (
        leaveType == LeaveTypeEnum.SickLeave.value &&
        selectedLeaveDuration == LeaveDurationEnum.FullDay.value
      ) {
        setShowMedicalField(true);
      } else {
        setShowMedicalField(false);
      }

      if (durationInDays > 2) {
        setMedicalFieldRequired(true);
      } else {
        setMedicalFieldRequired(false);
      }
    };

    onChangeHandleMedical();
  }, [leaveType, selectedLeaveDuration, startDate, endDate]);

  return (
    <SafeAreaView className="flex-1">
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="gray" />
        </View>
      ) : (
        <>
          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Add Leave</Text>
            <TouchableOpacity onPress={handleSignOut} style={styles.button}>
              <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
          </View>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.flex1}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={styles.scrollContent}
              >
                {/* --------------------------- */}
                <View style={styles.inputContainer}>
                  <Text
                    className="font-bold tracking-wider text-gray-700"
                    style={{ fontSize: hp(2) }}
                  >
                    Leave Type :{" "}
                  </Text>
                  <View style={styles.pickerContainer}>
                    <Picker
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
                      <Picker.Item
                        label="Sick Leave"
                        value="1"
                        color={"black"}
                      />
                      <Picker.Item label="Casual Leave" value="2" />
                      <Picker.Item label="Work From Home" value="3" />
                      <Picker.Item label="Short Leave" value="4" />
                    </Picker>
                  </View>
                  {errorLeaveType && (
                    <Text className="text-red-500">
                      Please select Leave Type!
                    </Text>
                  )}
                </View>
                {/*------------------ Leave Duration ---------------------*/}
                {showLeaveDurationField ? (
                  <View style={styles.inputContainer}>
                    <Text
                      className="font-bold tracking-wider text-gray-700"
                      style={{ fontSize: hp(2) }}
                    >
                      Leave Duration :{" "}
                    </Text>
                    <View style={styles.pickerContainer}>
                      <Picker
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
                    </View>
                    {errorLeaveDuration && (
                      <Text className="text-red-500">
                        Please select Leave Duration!
                      </Text>
                    )}
                  </View>
                ) : null}
                {/* --------------------------- */}
                <View style={styles.inputContainer}>
                  <Text
                    className="font-bold tracking-wider text-gray-700"
                    style={{ fontSize: hp(2) }}
                  >
                    Start Date
                  </Text>
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
                    <Text className="text-red-500">
                      Please select Start Date!
                    </Text>
                  )}
                </View>
                <View style={styles.inputContainer}>
                  <Text
                    className="font-bold tracking-wider text-gray-700"
                    style={{ fontSize: hp(2) }}
                  >
                    End Date
                  </Text>
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
                    <Text className="text-red-500">
                      Please select End Date!
                    </Text>
                  )}
                </View>
                <View style={styles.inputContainer}>
                  <Text
                    className="font-bold tracking-wider text-gray-700"
                    style={{ fontSize: hp(2) }}
                  >
                    Reason
                  </Text>
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
                {showMedicalField ? (
                  <View style={{ paddingBottom: hp(2) }}>
                    <View
                      className="flex flex-row justify-between items-center"
                      style={{ paddingBottom: hp(0.5) }}
                    >
                      <Text
                        className="font-bold tracking-wider text-gray-700"
                        style={{ fontSize: hp(2) }}
                      >
                        Medical Report
                      </Text>
                      <TouchableOpacity
                        style={styles.buttonS}
                        onPress={handleMedicalChange}
                      >
                        <Text
                          className="font-bold tracking-wider text-white"
                          style={{ fontSize: hp(2) }}
                        >
                          Select Image
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.imageC}>
                      {image && (
                        <Image
                          source={{ uri: image.assets[0].uri }}
                          style={styles.imageO}
                        />
                      )}
                    </View>
                    {medicalFieldRequired && !image && (
                      <Text className="text-red-500 text-center">
                        Please Select Medical Report!
                      </Text>
                    )}
                  </View>
                ) : null}
                <View style={styles.btnC}>
                  <TouchableOpacity
                    style={styles.buttonSubmit}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.buttonText}>Create Leave</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: hp(7),
    paddingHorizontal: wp(5),
    marginBottom: hp(2),
  },
  headerText: {
    fontSize: hp(3),
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  button: {
    height: hp(6),
    backgroundColor: "black",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(3),
  },
  buttonText: {
    fontSize: hp(2),
    color: "white",
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: wp(10),
  },
  flex1: {
    flex: 1,
    paddingTop: hp(3),
    paddingBottom: hp(3),
  },
  inputContainer: {
    marginBottom: hp(3),
    width: "100%",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#ccc",
    justifyContent: "center",
    height: hp(5),
  },
  textInput: {
    height: hp(5), // Adjust as per your design
    fontSize: hp(2),
    paddingHorizontal: wp(4),
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#ccc",
  },
  imageC: {
    alignItems: "center",
    width: "100%",
    height: 200,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#ccc",
  },
  imageO: {
    width: 200,
    height: 200,
  },
  btnC: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonS: {
    height: hp(4),
    backgroundColor: "black",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: hp(1),
  },
  buttonSubmit: {
    height: hp(6),
    backgroundColor: "black",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
});
