import { useQuery } from "@tanstack/react-query";
import { fetchBook } from "../lib/api";

export const useBook = (bookId) => {
  return useQuery({
    queryKey: ["book", bookId],
    queryFn: () => fetchBook(bookId),
    enabled: !!bookId,
  });
};
