import * as SecureStore from 'expo-secure-store';

// Minimal async storage wrapper that provides a small subset of the former MMKV
// synchronous API but using Expo SecureStore under the hood. All methods are
// async and must be awaited by callers.

const storage = {
	async set(key: string, value: string | number | boolean | object) {
		try {
			const payload = typeof value === 'string' ? value : JSON.stringify(value);
			await SecureStore.setItemAsync(key, payload);
		} catch (error) {
			// swallow — callers should handle errors where necessary
			console.warn('SecureStore.set error', error);
		}
	},

	async getItem(key: string): Promise<string | null> {
		try {
			return await SecureStore.getItemAsync(key);
		} catch (error) {
			console.warn('SecureStore.getItem error', error);
			return null;
		}
	},

	async getNumber(key: string): Promise<number | null> {
		try {
			const v = await SecureStore.getItemAsync(key);
			if (v == null) return null;
			try {
				const parsed = JSON.parse(v);
				return typeof parsed === 'number' ? parsed : Number(parsed ?? NaN);
			} catch {
				const n = Number(v);
				return Number.isNaN(n) ? null : n;
			}
		} catch (error) {
			console.warn('SecureStore.getNumber error', error);
			return null;
		}
	},

	async getBoolean(key: string): Promise<boolean | null> {
		try {
			const v = await SecureStore.getItemAsync(key);
			if (v == null) return null;
			try {
				const parsed = JSON.parse(v);
				return typeof parsed === 'boolean' ? parsed : parsed === 'true';
			} catch {
				return v === 'true';
			}
		} catch (error) {
			console.warn('SecureStore.getBoolean error', error);
			return null;
		}
	},

	async remove(key: string) {
		try {
			await SecureStore.deleteItemAsync(key);
		} catch (error) {
			console.warn('SecureStore.deleteItem error', error);
		}
	},

	async getUserID(){
		return await this.getItem('activeUserID')
	}
};

export default storage;