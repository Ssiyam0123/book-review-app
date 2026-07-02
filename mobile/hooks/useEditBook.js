import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, Platform } from "react-native";
import { editBook } from "../lib/api";
import { useRouter } from "expo-router";

export const useEditBook = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ bookId, bookData }) => {
      const formData = new FormData();
      if (bookData.title) formData.append("title", bookData.title);
      if (bookData.caption) formData.append("caption", bookData.caption);
      if (bookData.details) formData.append("details", bookData.details);
      if (bookData.rating) formData.append("rating", bookData.rating.toString());
      
      // if image is provided and it's a local file (not http from db)
      if (bookData.image && !bookData.image.startsWith("http") && !bookData.image.startsWith("data:")) {
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

      // We only pass formData if we added fields, but we should always have title, caption, rating
      return editBook(bookId, formData);
    },
    onSuccess: () => {
      Alert.alert("Success", "Book updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["userBooks"] });
      router.back();
    },
    onError: (error) => {
      Alert.alert("Error", error.response?.data?.message || "Failed to update book");
    },
  });
};
