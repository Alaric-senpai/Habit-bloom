import * as Clipboard from 'expo-clipboard';
import { Platform } from 'react-native';
import { hapticService } from './haptics';

// ============================================================================
// ClipboardService
// ============================================================================
export class ClipboardService {
  /**
   * Copy text to clipboard
   */
  async copy(text: string): Promise<boolean> {
    try {
      await Clipboard.setStringAsync(text);
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }

  /**
   * Copy image to clipboard (iOS only)
   */
  async copyImage(imageUri: string): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        await Clipboard.setImageAsync(imageUri);
        return true;
      }
      console.warn('Image clipboard is only supported on iOS');
      return false;
    } catch (error) {
      console.error('Error copying image to clipboard:', error);
      return false;
    }
  }

  /**
   * Get text from clipboard
   */
  async paste(): Promise<string> {
    try {
      const content = await Clipboard.getStringAsync();
      return content;
    } catch (error) {
      console.error('Error pasting from clipboard:', error);
      return '';
    }
  }

  /**
   * Get image from clipboard (iOS only)
   */
  async pasteImage(): Promise<string | null> {
    try {
      if (Platform.OS === 'ios') {
        const hasImage = await Clipboard.hasImageAsync();
        if (hasImage) {
          const image = await Clipboard.getImageAsync({
            format: 'png'
          });
          return image?.data || null;
        }
      }
      return null;
    } catch (error) {
      console.error('Error pasting image from clipboard:', error);
      return null;
    }
  }

  /**
   * Check if clipboard has text
   */
  async hasText(): Promise<boolean> {
    try {
      return await Clipboard.hasStringAsync();
    } catch (error) {
      console.error('Error checking clipboard for text:', error);
      return false;
    }
  }

  /**
   * Check if clipboard has image (iOS only)
   */
  async hasImage(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        return await Clipboard.hasImageAsync();
      }
      return false;
    } catch (error) {
      console.error('Error checking clipboard for image:', error);
      return false;
    }
  }

  /**
   * Check if clipboard has URL
   */
  async hasUrl(): Promise<boolean> {
    try {
      return await Clipboard.hasUrlAsync();
    } catch (error) {
      console.error('Error checking clipboard for URL:', error);
      return false;
    }
  }

  /**
   * Get URL from clipboard
   */
  async getUrl(): Promise<string | null> {
    try {
      const hasUrl = await this.hasUrl();
      if (hasUrl) {
        return await Clipboard.getStringAsync();
      }
      return null;
    } catch (error) {
      console.error('Error getting URL from clipboard:', error);
      return null;
    }
  }

  /**
   * Copy with feedback (combines copy + haptic + optional toast)
   */
  async copyWithFeedback(
    text: string,
    options?: {
      haptic?: boolean;
      onSuccess?: () => void;
    }
  ): Promise<boolean> {
    const { haptic = true, onSuccess } = options || {};

    const success = await this.copy(text);

    if (success) {
      if (haptic && Platform.OS !== 'web') {
        hapticService.notification('success');
      }
      onSuccess?.();
    }

    return success;
  }

  /**
   * Clear clipboard
   */
  async clear(): Promise<void> {
    try {
      await Clipboard.setStringAsync('');
    } catch (error) {
      console.error('Error clearing clipboard:', error);
    }
  }
}

export const clipboardService = new ClipboardService();
