import { useQuery } from "@tanstack/react-query";
import { fetchUserBooks } from "../lib/api.js";

export const useUserBook = () => {
  return useQuery({
    queryKey: ["userBooks"],
    queryFn: fetchUserBooks,
  });
}