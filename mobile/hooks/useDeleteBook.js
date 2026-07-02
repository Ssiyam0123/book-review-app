import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBook } from "../lib/api.js";
import { useAuthStore } from "../store/authStore.js";

export const useDeleteBook = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);

  return useMutation({
    mutationFn: (bookId) => deleteBook(bookId),

    onMutate: async (bookId) => {
      await queryClient.cancelQueries({ queryKey: ["userBooks"] });

      const previousBooks = queryClient.getQueryData(["userBooks"]);

      queryClient.setQueryData(["userBooks"], (old) =>
        old?.filter((book) => book._id !== bookId)
      );

      return { previousBooks };
    },

    onError: (err, bookId, context) => {
      queryClient.setQueryData(
        ["userBooks"],
        context.previousBooks
      );
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["userBooks"] });
    },
  });
};
