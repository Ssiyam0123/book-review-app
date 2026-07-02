import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchBooks } from "../lib/api";

export const useBooks = () => {
  return useInfiniteQuery({
    queryKey: ["books"],
    queryFn: fetchBooks,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
  });
};
