import axios from "axios";
import { Platform } from "react-native";
const API_URL = "https://crm.supremetechnologiesindia.com/backend/api";

const addNewLeave = async (value, image, accessToken) => {
  let formData = new FormData();
  if (image) {
    var imageUri = image.assets[0].uri;
    formData.append("file", {
      name: image.assets[0].fileName,
      type: "image/jpeg",
      uri: Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri,
    });
  } else {
    formData = null;
  }
  try {
    const response = await axios.post(
      `${API_URL}/Leaves/createLeave`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
        params: value,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Create Leave API Error:", error);
    throw error;
  }
};

const getAllPendingLeaves = async (accessToken) => {
  try {
    const response = await axios.get(`${API_URL}/Leaves/getAllPendingLeaves`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (response.data) {
      return response.data.leaveValue;
    }
  } catch (error) {
    console.error("Error api:", error);
    setIsAuthenticated(false);
    return;
  }
};

const approveLeaveByTL = async (
  leaveId,
  accessToken,
  isApprovedByHr = false
) => {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };
  const response = await axios
    .put(
      `${API_URL}/Leaves/approveLeave?leaveId=${leaveId}&isApprovedByHr=${isApprovedByHr}`,
      {},
      { headers }
    )
    .then((response) => response)
    .catch((error) => {
      return error.response;
    });
  return response;
};

const approveLeaveByHR = async (
  leaveId,
  accessToken,
  IsApprovedByHr = true
) => {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };
  const response = await axios
    .put(
      `${API_URL}/Leaves/approveLeave?leaveId=${leaveId}&isApprovedByHr=${IsApprovedByHr}`,
      {},
      { headers }
    )
    .then((response) => response)
    .catch((error) => {
      return error.response;
    });
  return response;
};

export const LeaveService = {
  addNewLeave,
  getAllPendingLeaves,
  approveLeaveByTL,
  approveLeaveByHR,
};
