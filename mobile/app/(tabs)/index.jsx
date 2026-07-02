import { View, FlatList, ActivityIndicator } from "react-native";
import BookReviewCard from "../../components/BookReviewCard";
import { useBooks } from "../../hooks/useBooks";

export default function Index() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useBooks();

  const books = data?.pages.flatMap((page) => page.books) ?? [];

  if (isLoading) {
    return <ActivityIndicator size="large" className="mt-10" />;
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={books}
        keyExtractor={(item, index) => (item._id || item.id || "") + "-" + index}
        renderItem={({ item }) => <BookReviewCard book={item} />}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.6}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator size="small" className="my-4" />
          ) : null
        }
      />
    </View>
  );
}
