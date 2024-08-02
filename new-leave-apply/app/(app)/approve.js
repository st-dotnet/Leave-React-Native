import { AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  SafeAreaView,
  FlatList,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { LeaveService } from "../../Services/leaveService";
import { LeaveDurationEnum, LeaveTypeEnum } from "../../constants/leaveEnums";
import Toast from "react-native-toast-message";

const Approve = () => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [userDetail, setUserDetail] = useState(null);

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    const fetchUserDetail = async () => {
      try {
        const userDetailJSON = await getUserDetail();
        const userDetail = JSON.parse(userDetailJSON);
        setUserDetail(userDetail);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetail();
  }, []);

  const getEnumName = (enumObj, value) => {
    return (
      Object.values(enumObj).find((type) => type.value === value)?.name ||
      "Unknown"
    );
  };

  const fetchData = async () => {
    const accessToken = await getAccessToken();
    var response = await LeaveService.getAllPendingLeaves(accessToken);
    setData(response);
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemText}>
          {item.firstName} {item.lastName}
        </Text>
        <Text style={styles.itemDate}>
          {formatDate(item.startDate)} - {formatDate(item.endDate)}
        </Text>
      </View>
      <View style={styles.itemRight}>
        {(((userDetail.role == "BDM" || userDetail.role == "TeamLead") &&
          userDetail.employeeId != item.employeeId &&
          item.isEditable == true) ||
          (userDetail.role == "HR" && !item.isApprovedByHr)) && (
          <TouchableOpacity onPress={() => handleTickPress(item)}>
            <AntDesign name="check" size={24} color="green" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => handleInfoPress(item)}
          style={styles.infoIcon}
        >
          <AntDesign name="infocirlce" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleInfoPress = (item) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const handleTickPress = async (item) => {
    setLoading(true);
    let response;
    const accessToken = await getAccessToken();
    if (userDetail.role == "TeamLead" || userDetail.role == "BDM") {
      response = await LeaveService.approveLeaveByTL(item.id, accessToken);
    }
    if (userDetail.role == "HR") {
      response = await LeaveService.approveLeaveByHR(item.id, accessToken);
    }
    if (response?.data.success) {
      Toast.show({
        type: "success",
        text1: `${response?.data.message}`,
      });
    } else {
      Toast.show({
        type: "error",
        text1: `${response?.data.message}`,
      });
    }
    fetchData();
  };

  return (
    <>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="gray" />
        </View>
      ) : (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.header}>
              <AntDesign
                name="left"
                size={24}
                onPress={handleBack}
                color="black"
              />
              <Text style={styles.title}>Pending Leaves</Text>
              <View style={styles.rightSpacer}></View>
            </View>
            <View style={styles.listContainer}>
              {data.length === 0 ? (
                <View style={styles.noDataContainer}>
                  <AntDesign name="inbox" size={160} color="#777" />
                  <Text style={styles.noDataText}>No Pending Leaves</Text>
                </View>
              ) : (
                <FlatList
                  data={data}
                  keyExtractor={(item) => item.id}
                  renderItem={renderItem}
                />
              )}
            </View>
            {selectedItem && (
              <Modal
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
              >
                <View style={styles.modalBackground}>
                  <View style={styles.modalContainer}>
                    <ScrollView contentContainerStyle={styles.scrollContainer}>
                      <Text style={styles.modalTitle}>
                        {selectedItem.firstName} {selectedItem.lastName}
                      </Text>
                      <View style={styles.infoContainer}>
                        <Text style={styles.infoLabel}>Leave Type:</Text>
                        <Text style={styles.infoValue}>
                          {getEnumName(LeaveTypeEnum, selectedItem.leaveType)}
                        </Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={styles.infoLabel}>Start Date:</Text>
                        <Text style={styles.infoValue}>
                          {formatDate(selectedItem.startDate)}
                        </Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={styles.infoLabel}>End Date:</Text>
                        <Text style={styles.infoValue}>
                          {formatDate(selectedItem.endDate)}
                        </Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={styles.infoLabel}>Leave Duration:</Text>
                        <Text style={styles.infoValue}>
                          {getEnumName(
                            LeaveDurationEnum,
                            selectedItem.leaveDuration
                          )}
                        </Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={styles.infoLabel}>Unpaid Leave:</Text>
                        <Text style={styles.infoValue}>
                          {selectedItem.isUnpaidLeave
                            ? "Unpaid Leave"
                            : "Paid Leave"}
                        </Text>
                      </View>
                      <View style={styles.infoContainer}>
                        <Text style={styles.infoLabel}>Reason:</Text>
                        <Text style={styles.infoValue}>
                          {selectedItem.reason}
                        </Text>
                      </View>
                    </ScrollView>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            )}
          </View>
        </SafeAreaView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? hp(1.5) : hp(7),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
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
  item: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemLeft: {
    flex: 1,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemText: {
    fontSize: 18,
  },
  itemDate: {
    fontSize: 14,
    color: "#777",
  },
  listContainer: {
    flex: 1,
    paddingTop: hp(3),
    paddingHorizontal: wp(5),
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  safeArea: {
    flex: 1,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#007BFF",
    borderRadius: 5,
    alignSelf: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  infoIcon: {
    marginLeft: 10,
  },
  infoContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "400",
    color: "#777",
    flex: 2,
    textAlign: "right",
    flexWrap: "wrap",
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    fontSize: 24,
    color: "#777",
  },
});

export default Approve;
