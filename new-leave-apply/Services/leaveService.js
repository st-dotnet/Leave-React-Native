import axios from "axios";
import { Platform } from "react-native";
const API_URL = "https://stagingcrm.supremetechnologiesindia.com/backend/api";

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

export const LeaveService = {
  addNewLeave,
};
