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
import { useNavigation, useRouter } from "expo-router";
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
  const router = useRouter();
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
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
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
    }
  };
  const handleDelete = async () => {
    router.replace("deleteAccount");
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
    const currentDate = selectedDate;
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
    setStartDate(new Date());
    setEndDate(new Date());
    setReason("");
    setImage(null);
    setShowLeaveDurationField(false);
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
    } else if (leaveType == LeaveTypeEnum.ShortLeave.value || leaveType == 0) {
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
    <>
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="gray" />
        </View>
      ) : (
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                keyboardShouldPersistTaps="handled"
                ref={scrollViewRef}
              >
                <View style={styles.container}>
                  <View style={styles.header}>
                    <Text style={styles.title}>Apply Leaves</Text>
                    <Text style={styles.text}>
                        <TouchableOpacity onPress={handleDelete}>
                          <Text style={styles.linkText}>Delete account!</Text>
                        </TouchableOpacity>
                      </Text>
                    <TouchableOpacity
                      onPress={handleSignOut}
                      style={styles.signoutButton}
                    >
                      <Text style={styles.signOut}>Sign Out</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.label}>Leave Type</Text>
                  <View style={styles.pickerContainer}>
                    <View
                      style={Platform.OS === "ios" ? styles.pickerWrapper : ""}
                    >
                      <Picker
                        selectedValue={leaveType}
                        onValueChange={(itemValue, itemIndex) => {
                          setLeaveType(itemValue);
                          handleLeaveTypeChange(itemValue);
                          seterrorLeaveType(false);
                        }}
                      >
                        <Picker.Item
                          label="Select Leave Type"
                          value={0}
                          enabled={false}
                          color={"gray"}
                        />
                        {Object.values(LeaveTypeEnum).map((item) => (
                          <Picker.Item
                            key={item.value}
                            label={item.name}
                            value={item.value}
                            color={"black"}
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>
                  {errorLeaveType && (
                    <Text style={styles.errorText}>
                      Please select a leave type.
                    </Text>
                  )}

                  {showLeaveDurationField && (
                    <>
                      <Text style={styles.label}>Leave Duration</Text>
                      <View style={styles.pickerContainer}>
                        <View
                          style={
                            Platform.OS === "ios" ? styles.pickerWrapper : ""
                          }
                        >
                          <Picker
                            selectedValue={selectedLeaveDuration}
                            onValueChange={(itemValue) => {
                              setSelectedLeaveDuration(itemValue);
                              seterrorLeaveDuration(false);
                            }}
                          >
                            <Picker.Item
                              label="Select Leave Duration"
                              value={0}
                              enabled={false}
                              color={"gray"}
                            />
                            {leaveDurationOptions.map((item) => (
                              <Picker.Item
                                key={item.value}
                                label={item.label}
                                value={item.value}
                                color={"black"}
                              />
                            ))}
                          </Picker>
                        </View>
                      </View>
                      {errorLeaveDuration && (
                        <Text style={styles.errorText}>
                          Please select leave duration.
                        </Text>
                      )}
                    </>
                  )}

                  <Text style={styles.label}>Start Date</Text>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowStartPicker(true)}
                  >
                    <Text style={styles.datePickerButtonText}>
                      {startDate ? formatDate(startDate) : "Select Start Date"}
                    </Text>
                  </TouchableOpacity>
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
                    <Text style={styles.errorText}>
                      Please select start date.
                    </Text>
                  )}

                  <Text style={styles.label}>End Date</Text>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowEndPicker(true)}
                  >
                    <Text style={styles.datePickerButtonText}>
                      {endDate ? formatDate(endDate) : "Select End Date"}
                    </Text>
                  </TouchableOpacity>
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
                    <Text style={styles.errorText}>
                      Please select end date.
                    </Text>
                  )}

                  <Text style={styles.label}>Reason</Text>
                  <TextInput
                    style={[styles.input, { height: hp("20%") }]}
                    multiline={true}
                    numberOfLines={4}
                    value={reason}
                    onChangeText={(text) => {
                      setReason(text);
                      seterrorReason(false);
                    }}
                  />
                  {errorReason && (
                    <Text style={styles.errorText}>Please enter reason.</Text>
                  )}

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

                  <TouchableOpacity
                    style={styles.buttonS}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.submitButtonText}>Create Leave</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </SafeAreaView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: hp(2.3),
    color: '#000',
  },
  linkText: {
    fontSize: hp(2.3),
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? hp(2) : hp(7),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  signoutButton: {
    height: hp(6),
    backgroundColor: "black",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(3),
  },
  signOut: {
    fontSize: hp(2),
    color: "white",
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 16,
    marginBottom: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  datePickerButtonText: {
    fontSize: 16,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    marginBottom: 16,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  buttonS: {
    height: hp(4),
    backgroundColor: "black",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: hp(1),
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
  pickerWrapper: {
    justifyContent: "center",
    height: 115,
    overflow: "hidden",
  },
});
