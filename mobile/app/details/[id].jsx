import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useBook } from "../../hooks/useBook";
import { useLikeBook } from "../../hooks/useLikeBook";
import { useAuthStore } from "../../store/authStore";
import { useComments } from "../../hooks/useComments";

export default function BookDetailsPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: book, isLoading, error, refetch } = useBook(id);
  const { mutate: likeBook, isPending: isLiking } = useLikeBook();

  const { comments, addComment, isAdding } = useComments(id);
  const [commentText, setCommentText] = useState("");

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const isLiked = book?.likes?.includes(user?._id || user?.id);

  const handleLike = () => {
    if (isLiking || !book) return;
    likeBook(book._id || book.id, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    addComment(
      { text: commentText },
      {
        onSuccess: () => {
          setCommentText("");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#EEF8EE]">
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error || !book) {
    return (
      <View className="flex-1 justify-center items-center bg-[#EEF8EE] p-6">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-xl font-bold text-gray-800 mt-4 mb-2">
          Failed to load book details
        </Text>
        <Text className="text-gray-600 text-center mb-6">
          {error?.response?.data?.message || error?.message || "Something went wrong."}
        </Text>
        <TouchableOpacity
          onPress={handleBack}
          className="bg-green-500 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold text-lg">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#EEF8EE]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-green-100 bg-[#EFF8F2]">
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={28} color="#166534" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-green-800">Book Details</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-green-50 mb-6">
          {/* Cover & Rating */}
          <View className="items-center mb-6">
            <Image
              source={{ uri: book.image }}
              className="w-48 h-72 rounded-2xl shadow-lg mb-4"
              resizeMode="cover"
            />

            <Text className="text-2xl font-bold text-green-900 text-center mb-2">
              {book.title}
            </Text>

            {/* Stars */}
            <View className="flex-row justify-center mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= book.rating ? "star" : "star-outline"}
                  size={24}
                  color="#FBBF24"
                  style={{ marginRight: 4 }}
                />
              ))}
            </View>

            {/* Like Button */}
            <TouchableOpacity
              onPress={handleLike}
              disabled={isLiking}
              className={`flex-row items-center gap-x-2 px-6 py-3 rounded-full border ${
                isLiked
                  ? "bg-red-50 border-red-200"
                  : "bg-green-50 border-green-100"
              }`}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={22}
                color={isLiked ? "#EF4444" : "#15803d"}
              />
              <Text
                className={`font-semibold text-base ${
                  isLiked ? "text-red-500" : "text-green-800"
                }`}
              >
                {book.likes?.length || 0} Likes
              </Text>
            </TouchableOpacity>
          </View>

          {/* Reviewer Section */}
          <View className="flex-row items-center p-4 bg-green-50/50 rounded-xl mb-6">
            <Image
              source={{
                uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${book.user?.username}`,
              }}
              className="w-12 h-12 rounded-full mr-4"
            />
            <View>
              <Text className="text-xs text-gray-400">Recommended by</Text>
              <Text className="font-semibold text-gray-800 text-base">
                {book.user?.username || "Anonymous"}
              </Text>
            </View>
          </View>

          {/* Caption / Thoughts */}
          <View className="mb-6">
            <Text className="text-green-800 font-bold text-lg mb-2">
              Reviewer's Thoughts
            </Text>
            <Text className="text-gray-700 text-base leading-6 bg-[#F4FBF4] p-4 rounded-xl border border-green-100">
              {book.caption}
            </Text>
          </View>

          {/* Book Details */}
          <View className="mb-6">
            <Text className="text-green-800 font-bold text-lg mb-2">
              Book Details
            </Text>
            <Text className="text-gray-700 text-base leading-6 bg-[#F4FBF4] p-4 rounded-xl border border-green-100">
              {book.details || "No details provided for this book."}
            </Text>
          </View>

          {/* Comments Section */}
          <View className="border-t border-green-100 pt-6">
            <Text className="text-green-800 font-bold text-lg mb-4">
              Comments ({comments.length})
            </Text>

            {/* Comment List */}
            {comments.map((comment) => (
              <View
                key={comment._id || comment.id}
                className="flex-row mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100"
              >
                <Image
                  source={{
                    uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${comment.user?.username}`,
                  }}
                  className="w-8 h-8 rounded-full mr-3"
                />
                <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="font-semibold text-gray-800 text-sm">
                      {comment.user?.username}
                    </Text>
                    <Text className="text-xs text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text className="text-gray-600 text-sm leading-5">
                    {comment.text}
                  </Text>
                </View>
              </View>
            ))}

            {comments.length === 0 && (
              <Text className="text-gray-400 text-sm text-center my-4 italic">
                No comments yet. Be the first to share your thoughts!
              </Text>
            )}

            {/* Add Comment Input */}
            <View className="flex-row items-center mt-4">
              <View className="flex-1 bg-[#F4FBF4] border border-green-200 rounded-xl px-4 py-2 mr-3 justify-center min-h-12">
                <TextInput
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder="Add a comment..."
                  placeholderTextColor="#9CA3AF"
                  className="text-gray-700 text-sm"
                  multiline
                  style={{ maxHeight: 80 }}
                />
              </View>
              <TouchableOpacity
                onPress={handleAddComment}
                disabled={isAdding || !commentText.trim()}
                className={`h-12 w-12 items-center justify-center rounded-xl ${
                  isAdding || !commentText.trim()
                    ? "bg-gray-300"
                    : "bg-green-600 active:bg-green-700"
                }`}
              >
                {isAdding ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="send" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
