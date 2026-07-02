import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

export default function AddBookForm() {
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState(0);
  const [image, setImage] = useState(null);
  const [caption, setCaption] = useState("");

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#EEF8EE] p-6">
      <Text className="text-2xl font-bold text-green-700 mb-2">
        Add Book Recommendation
      </Text>
      <Text className="text-gray-600 mb-4">
        Share your favorite reads with others
      </Text>

      {/* Book Title */}
      <Text className="text-gray-600 mb-1">Book Title</Text>
      <View className="bg-white rounded-xl border border-green-200 px-4 h-12 mb-4 justify-center">
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter book title"
          className="text-gray-700"
        />
      </View>

      {/* Rating */}
      <Text className="text-gray-600 mb-1">Your Rating</Text>
      <View className="flex-row mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Ionicons
              name={star <= rating ? "star" : "star-outline"}
              size={32}
              color="#FBBF24" // yellow
              className="mr-2"
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Book Image */}
      <Text className="text-gray-600 mb-1">Book Image</Text>
      <TouchableOpacity
        onPress={pickImage}
        className="bg-white border border-green-200 rounded-xl h-40 mb-4 items-center justify-center"
      >
        {image ? (
          <Image
            source={{ uri: image }}
            contentFit="contain"
            className="w-full h-full rounded-xl"
          />
        ) : (
          <Ionicons name="image-outline" size={48} color="#4CAF50" />
        )}
      </TouchableOpacity>

      {/* Caption */}
      <Text className="text-gray-600 mb-1">Caption</Text>
      <View className="bg-white rounded-xl border border-green-200 px-4 py-2 mb-6">
        <TextInput
          value={caption}
          onChangeText={setCaption}
          placeholder="Write your review or thoughts about this book..."
          multiline
          numberOfLines={4}
          className="text-gray-700"
        />
      </View>

      {/* Post Button */}
      <TouchableOpacity className="bg-green-500 rounded-xl h-12 items-center justify-center">
        <Text className="text-white text-lg font-semibold">
          Post Recommendation
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
