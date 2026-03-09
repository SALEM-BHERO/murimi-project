import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@murimi_token';
const USER_KEY = '@murimi_user';

// --- Token ---
export const saveToken = async (token) => {
    try {
        await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
        console.warn('Failed to save token:', e);
    }
};

export const getToken = async () => {
    try {
        return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (e) {
        console.warn('Failed to get token:', e);
        return null;
    }
};

export const removeToken = async () => {
    try {
        await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (e) {
        console.warn('Failed to remove token:', e);
    }
};

// --- User ---
export const saveUser = async (user) => {
    try {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
        console.warn('Failed to save user:', e);
    }
};

export const getUser = async () => {
    try {
        const json = await AsyncStorage.getItem(USER_KEY);
        return json ? JSON.parse(json) : null;
    } catch (e) {
        console.warn('Failed to get user:', e);
        return null;
    }
};

export const removeUser = async () => {
    try {
        await AsyncStorage.removeItem(USER_KEY);
    } catch (e) {
        console.warn('Failed to remove user:', e);
    }
};

// --- Clear all ---
export const clearStorage = async () => {
    await removeToken();
    await removeUser();
};
