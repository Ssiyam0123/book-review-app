import { View, Text, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../store/authStore.js";
import { useRouter } from "expo-router";

const UserProfileCard = ({ user, onLogout }) => {
    const logOut = useAuthStore((s) => s.logout);
    const router = useRouter();
  const handleLogout = () => {
    logOut();
    router.replace("/(auth)");
  }
  // console.log(user);
  return (
    <View className="bg-[#F1FAF1] rounded-2xl p-4 mx-4 mt-4 shadow-sm">
      {/* User Info */}
      <View className="flex-row items-center mb-4">
        <Image
          source={{
            uri: `https://api.dicebear.com/7.x/avataaars/png?seed=${user?.username}`,
          }}
          className="w-14 h-14 rounded-full mr-4"
        />

        <View>
          <Text className="text-lg font-semibold text-green-800">
            {user?.username}
          </Text>
          <Text className="text-gray-500 text-sm">{user?.email}</Text>
          <Text className="text-gray-400 text-xs mt-1">
            Member since {new Date(user?.createdAt).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        onPress={handleLogout}
        className="bg-green-500 rounded-xl py-3 flex-row justify-center items-center"
      >
        <Ionicons name="log-out-outline" size={20} color="white" />
        <Text className="text-white font-semibold ml-2 text-base">Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UserProfileCard;
