import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likeBook } from "../lib/api";

export const useLikeBook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookId) => likeBook(bookId),
    onSuccess: () => {
      // Invalidate both books and userBooks queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["books"] });
      queryClient.invalidateQueries({ queryKey: ["userBooks"] });
    },
  });
};
