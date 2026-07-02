import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, Platform } from "react-native";
import { useAuthStore } from "../store/authStore";
import { api } from "../lib/api";
import { useRouter } from "expo-router";

export const useCreateBook = () => {
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState(0);
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [details, setDetails] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const router = useRouter()

  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const mutation = useMutation({
    mutationFn: async (bookData) => {
      if (!token) throw new Error("User not logged in");

      const formData = new FormData();
      formData.append("title", bookData.title);
      formData.append("caption", bookData.caption);
      formData.append("details", bookData.details);
      formData.append("rating", bookData.rating.toString());
      
      if (bookData.image) {
        if (Platform.OS === "web") {
          try {
            const response = await fetch(bookData.image);
            const blob = await response.blob();
            formData.append("image", blob, "book.jpg");
          } catch (e) {
            console.error("Error converting image to blob on web:", e);
            formData.append("image", {
              uri: bookData.image,
              type: "image/jpeg",
              name: "book.jpg",
            });
          }
        } else {
          formData.append("image", {
            uri: bookData.image,
            type: "image/jpeg",
            name: "book.jpg",
          });
        }
      }

      const res = await api.post("/books", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`,
        },
      });

      return res.data;
    },
    onMutate: () => {
      setIsPosting(true);
      setSubmitError("");
      return { isPosting: true };
    },
    onSuccess: (data) => {
      Alert.alert("Success", "Book posted successfully!");
      
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["userBooks"] });
      
      setTitle("");
      setCaption("");
      setDetails("");
      setImage(null);
      setRating(0);
      router.replace("/(tabs)/profile");
    },
    onError: (error) => {
      const errMsg = error.response?.data?.message || "Failed to post";
      setSubmitError(errMsg);
      Alert.alert("Error", errMsg);
    },
    onSettled: () => {
      setIsPosting(false);
    },
  });

  const handleSubmit = () => {
    if (!title || !caption || !details || !rating || !image) {
      setSubmitError("Please fill all fields");
      return;
    }
    mutation.mutate({ title, caption, details, rating, image });
  };

  return {
    title,
    setTitle,
    rating,
    setRating,
    image,
    setImage,
    caption,
    setCaption,
    details,
    setDetails,
    pickImage,
    handleSubmit,
    isPosting,
    submitError,
    isLoading: mutation.isLoading,
  };
};