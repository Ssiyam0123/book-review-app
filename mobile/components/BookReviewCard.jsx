import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../store/authStore";
import { useLikeBook } from "../hooks/useLikeBook";
import { useRouter } from "expo-router";

const BookReviewCard = ({ book }) => {
  const user = useAuthStore((s) => s.user);
  const { mutate: likeBook, isPending } = useLikeBook();
  const router = useRouter();

  const isLiked = book?.likes?.includes(user?._id || user?.id);

  const handleLike = () => {
    if (isPending) return;
    likeBook(book._id || book.id);
  };

  const handlePressCard = () => {
    router.push({
      pathname: `/details/${book._id || book.id}`,
      params: {
        title: book.title,
        caption: book.caption,
        rating: book.rating,
        image: book.image,
        details: book.details || "",
      }
    });
  };

  return (
    <TouchableOpacity 
      onPress={handlePressCard} 
      activeOpacity={0.9} 
      className="bg-[#F1FAF1] rounded-2xl p-4 mb-4 w-[95%] mx-auto border border-green-50"
    >
      
      {/* User */}
      <View className="flex-row items-center mb-3">
        <Image
          source={{ uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${book?.user?.username}` }}
          className="w-10 h-10 rounded-full mr-3"
        />
        <Text className="font-semibold text-gray-800">
          {book?.user?.username}
        </Text>
      </View>

      {/* Book Image */}
      <Image
        source={{ uri: book?.image }}
        className="w-full h-44 rounded-xl mb-3"
      />

      {/* Title */}
      <Text className="text-lg font-bold text-green-800 mb-1">
        {book?.title}
      </Text>

      {/* Rating & Likes */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row">
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= book.rating ? "star" : "star-outline"}
              size={16}
              color="#FACC15"
            />
          ))}
        </View>

        <TouchableOpacity 
          onPress={handleLike} 
          disabled={isPending}
          className="flex-row items-center gap-x-1 bg-white px-2 py-1 rounded-full border border-green-100"
        >
          <Ionicons 
            name={isLiked ? "heart" : "heart-outline"} 
            size={18} 
            color={isLiked ? "#EF4444" : "#9CA3AF"} 
          />
          <Text className={isLiked ? "text-red-500 font-medium" : "text-gray-500 font-medium"}>
            {book?.likes?.length || 0}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Caption */}
      <Text className="text-gray-600 text-sm mb-2">
        {book?.caption}
      </Text>

      {/* Date */}
      <Text className="text-xs text-gray-400">
        {new Date(book?.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
};

export default BookReviewCard;
