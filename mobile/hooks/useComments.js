import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchComments, postComment } from "../lib/api";

export const useComments = (bookId) => {
  const queryClient = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: ["comments", bookId],
    queryFn: () => fetchComments(bookId),
    enabled: !!bookId,
  });

  const commentMutation = useMutation({
    mutationFn: ({ text }) => postComment(bookId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", bookId] });
    },
  });

  return {
    comments: commentsQuery.data || [],
    isLoading: commentsQuery.isLoading,
    isError: commentsQuery.isError,
    error: commentsQuery.error,
    addComment: commentMutation.mutate,
    isAdding: commentMutation.isPending,
  };
};
