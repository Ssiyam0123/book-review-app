import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../services/auth.service.js";

export const useLogin = () =>{
    return useMutation({
        mutationFn : loginApi,
    })
}