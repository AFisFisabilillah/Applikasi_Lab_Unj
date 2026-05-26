import { create } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = create({
    baseURL: process.env.EXPO_PUBLIC_API_URL ,
    timeout: 10000,
    headers: {
        "Accept": "application/json",
    }
})

api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
