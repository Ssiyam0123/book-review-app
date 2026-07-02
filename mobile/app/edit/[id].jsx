import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useEditBook } from "../../hooks/useEditBook";

export default function EditBookPage() {
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const [title, setTitle] = useState(params.title || "");
  const [rating, setRating] = useState(Number(params.rating) || 0);
  const [image, setImage] = useState(params.image || null);
  const [caption, setCaption] = useState(params.caption || "");
  const [details, setDetails] = useState(params.details || "");

  const { mutate, isPending: isUpdating, error } = useEditBook();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleUpdate = () => {
    mutate({
      bookId: params.id,
      bookData: { title, caption, details, rating, image }
    });
  };

  return (
    <ScrollView
      className="flex-1 bg-[#E8F6E9] p-2 mx-auto w-full"
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-row items-center mt-6 px-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#166534" />
        </TouchableOpacity>
      </View>

      <View className="flex-1 bg-[#EFF8F2] w-[90%] mx-auto mt-4 p-6 rounded-2xl mb-8">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-green-700 mb-2">
            Edit Recommendation
          </Text>
          <Text className="text-gray-600">
            Update your book details
          </Text>
        </View>

        {/* Book Title */}
        <View className="mb-4">
          <Text className="text-gray-600 mb-1">Book Title *</Text>
          <View className="bg-white rounded-xl border border-green-200 px-4 h-12 justify-center">
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter book title"
              className="text-gray-700 text-base"
              editable={!isUpdating}
            />
          </View>
        </View>

        {/* Rating */}
        <View className="mb-4">
          <Text className="text-gray-600 mb-1">Your Rating *</Text>
          <View className="flex-row">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => !isUpdating && setRating(star)}
                disabled={isUpdating}
              >
                <Ionicons
                  name={star <= rating ? "star" : "star-outline"}
                  size={32}
                  color={isUpdating ? "#D1D5DB" : "#FBBF24"}
                  style={{ marginRight: 8 }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Book Image */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-gray-600">Book Image *</Text>
            <TouchableOpacity
              onPress={() => {
                setImage("https://picsum.photos/200/300?random=" + Math.random());
              }}
            >
              <Text className="text-green-600 font-semibold">Random Image</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={pickImage}
            disabled={isUpdating}
            className={`bg-white border rounded-xl h-40 mb-4 items-center justify-center ${
              isUpdating ? "border-gray-300" : "border-green-200"
            }`}
          >
            {image ? (
              <View className="relative w-full h-full">
                <Image
                  source={{ uri: image }}
                  className="w-full h-full rounded-xl"
                  resizeMode="cover"
                />
                {isUpdating && (
                  <View className="absolute inset-0 bg-black/40 rounded-xl items-center justify-center">
                    <ActivityIndicator size="large" color="white" />
                  </View>
                )}
              </View>
            ) : (
              <View className="items-center">
                <Ionicons
                  name="image-outline"
                  size={48}
                  color={isUpdating ? "#9CA3AF" : "#4CAF50"}
                />
                <Text
                  className={`mt-2 ${isUpdating ? "text-gray-400" : "text-gray-500"}`}
                >
                  {isUpdating ? "Uploading..." : "Tap to select image"}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Caption */}
        <View className="mb-4">
          <Text className="text-gray-600 mb-1">Caption *</Text>
          <View className="bg-white rounded-xl border border-green-200 px-4 py-3">
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="Write your review, thoughts, or why you recommend this book..."
              multiline
              className="text-gray-700 text-base"
              textAlignVertical="top"
              style={{ minHeight: 80 }}
              editable={!isUpdating}
            />
          </View>
        </View>

        {/* Book Details */}
        <View className="mb-6">
          <Text className="text-gray-600 mb-1">Book Details *</Text>
          <View className="bg-white rounded-xl border border-green-200 px-4 py-3">
            <TextInput
              value={details}
              onChangeText={setDetails}
              placeholder="Enter details about the book (author, genre, description, etc.)..."
              multiline
              className="text-gray-700 text-base"
              textAlignVertical="top"
              style={{ minHeight: 100 }}
              editable={!isUpdating}
            />
          </View>
        </View>

        {/* Error message */}
        {!!error && (
          <View className="mb-4 p-3 bg-red-50 rounded-xl border border-red-200">
            <Text className="text-red-600 font-semibold text-sm text-center">
              {error.response?.data?.message || error.message || "Failed to update book"}
            </Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleUpdate}
          disabled={isUpdating || !title || !caption || !details || !image || rating === 0}
          className={`rounded-xl h-14 items-center justify-center mb-6 ${
            isUpdating || !title || !caption || !details || !image || rating === 0
              ? "bg-gray-400"
              : "bg-green-500 active:bg-green-600"
          }`}
        >
          {isUpdating ? (
            <View className="flex-row items-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white text-lg font-semibold ml-3">
                Updating...
              </Text>
            </View>
          ) : (
            <Text className="text-white text-lg font-semibold">
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
