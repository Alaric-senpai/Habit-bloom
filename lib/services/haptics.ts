import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// ============================================================================
// HapticService
// ============================================================================
export class HapticService {
  private isEnabled: boolean = true;

  /**
   * Enable or disable haptic feedback globally
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Check if haptics are enabled
   */
  isHapticsEnabled(): boolean {
    return this.isEnabled && Platform.OS !== 'web';
  }

  /**
   * Impact feedback (for physical interactions)
   */
  async impact(
    style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium'
  ): Promise<void> {
    if (!this.isHapticsEnabled()) return;

    try {
      switch (style) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'rigid':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
          break;
        case 'soft':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
          break;
      }
    } catch (error) {
      console.error('Error triggering impact haptic:', error);
    }
  }

  /**
   * Selection feedback (for picker/selection changes)
   */
  async selection(): Promise<void> {
    if (!this.isHapticsEnabled()) return;

    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.error('Error triggering selection haptic:', error);
    }
  }

  /**
   * Notification feedback (for task completion/errors)
   */
  async notification(
    type: 'success' | 'warning' | 'error' = 'success'
  ): Promise<void> {
    if (!this.isHapticsEnabled()) return;

    try {
      switch (type) {
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
      }
    } catch (error) {
      console.error('Error triggering notification haptic:', error);
    }
  }

  // ============================================================================
  // Convenience methods for common use cases
  // ============================================================================

  /**
   * Button press feedback
   */
  async buttonPress(): Promise<void> {
    await this.impact('light');
  }

  /**
   * Toggle switch feedback
   */
  async toggle(): Promise<void> {
    await this.impact('medium');
  }

  /**
   * Delete/destructive action feedback
   */
  async destructive(): Promise<void> {
    await this.notification('warning');
  }

  /**
   * Success action feedback
   */
  async success(): Promise<void> {
    await this.notification('success');
  }

  /**
   * Error feedback
   */
  async error(): Promise<void> {
    await this.notification('error');
  }

  /**
   * Swipe gesture feedback
   */
  async swipe(): Promise<void> {
    await this.impact('light');
  }

  /**
   * Long press feedback
   */
  async longPress(): Promise<void> {
    await this.impact('heavy');
  }

  /**
   * Refresh/pull-to-refresh feedback
   */
  async refresh(): Promise<void> {
    await this.impact('medium');
  }

  /**
   * Picker scroll feedback
   */
  async pickerChange(): Promise<void> {
    await this.selection();
  }

  /**
   * Modal open/close feedback
   */
  async modal(): Promise<void> {
    await this.impact('soft');
  }

  /**
   * Achievement unlocked feedback
   */
  async achievement(): Promise<void> {
    await this.notification('success');
    setTimeout(() => this.impact('medium'), 100);
  }

  /**
   * Habit completion feedback (special sequence)
   */
  async habitComplete(): Promise<void> {
    await this.impact('light');
    setTimeout(() => this.notification('success'), 50);
  }

  /**
   * Streak milestone feedback (celebratory sequence)
   */
  async streakMilestone(): Promise<void> {
    await this.impact('medium');
    setTimeout(() => this.impact('medium'), 100);
    setTimeout(() => this.notification('success'), 200);
  }

  /**
   * Custom haptic pattern
   */
  async pattern(
    sequence: Array<{ type: 'impact' | 'selection' | 'notification'; delay: number; intensity?: 'light' | 'medium' | 'heavy'; notificationType?: 'success' | 'warning' | 'error' }>
  ): Promise<void> {
    if (!this.isHapticsEnabled()) return;

    for (const item of sequence) {
      await new Promise(resolve => setTimeout(resolve, item.delay));
      
      switch (item.type) {
        case 'impact':
          await this.impact(item.intensity || 'medium');
          break;
        case 'selection':
          await this.selection();
          break;
        case 'notification':
          await this.notification(item.notificationType || 'success');
          break;
      }
    }
  }
}

export const hapticService = new HapticService();