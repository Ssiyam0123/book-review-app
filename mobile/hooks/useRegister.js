import { useMutation } from "@tanstack/react-query";
import { registerApi } from "../services/auth.service.js";

export const useRegister = () => {
  return useMutation({
    mutationFn: registerApi,
  });
};
