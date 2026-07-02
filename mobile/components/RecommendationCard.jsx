import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const RecommendationCard = ({ book, onDelete, onEdit }) => {
  const router = useRouter();

  const handleDeletePress = () => {
    Alert.alert(
      "Delete Book",
      "Are you sure you want to delete this book recommendation? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(book?._id),
        },
      ],
      { cancelable: true }
    );
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
    <View className="bg-[#F1FAF1] rounded-2xl p-3 mx-4 mb-3 flex-row items-center shadow-sm">
      
      {/* Clickable Content area */}
      <TouchableOpacity 
        onPress={handlePressCard} 
        activeOpacity={0.8} 
        className="flex-row items-center flex-1"
      >
        {/* Book Image */}
        <Image
          source={{ uri: book?.image }}
          className="w-16 h-20 rounded-lg mr-3"
          resizeMode="cover"
        />

        {/* Content */}
        <View className="flex-1 mr-2">
          <Text className="text-green-800 font-semibold text-base">
            {book?.title}
          </Text>

          {/* Rating & Likes */}
          <View className="flex-row items-center justify-between my-1">
            <View className="flex-row">
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= book?.rating ? "star" : "star-outline"}
                  size={14}
                  color="#FACC15"
                />
              ))}
            </View>
            <View className="flex-row items-center gap-x-1">
              <Ionicons 
                name="heart" 
                size={14} 
                color="#EF4444" 
              />
              <Text className="text-xs text-gray-500">{book?.likes?.length || 0}</Text>
            </View>
          </View>

          <Text
            className="text-gray-600 text-sm"
            numberOfLines={2}
          >
            {book?.caption}
          </Text>

          <Text className="text-xs text-gray-400 mt-1">
            {new Date(book?.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Actions */}
      <View className="flex-row items-center gap-x-3 pl-2">
        {onEdit && (
          <TouchableOpacity onPress={() => onEdit(book)}>
            <Ionicons
              name="pencil-outline"
              size={20}
              color="#3B82F6"
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleDeletePress}>
          <Ionicons
            name="trash-outline"
            size={20}
            color="#EF4444"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RecommendationCard;