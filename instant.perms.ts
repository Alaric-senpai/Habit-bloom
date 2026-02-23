// permissions.ts
import type { InstantRules } from '@instantdb/react-native';

/**
 * Habit Bloom Permissions
 * 
 * Security model:
 * - Users own their data completely
 * - No public reads except for system achievements
 * - All habit, mood, and profile data is private
 */

const rules = {
  // ============== SYSTEM ==============
  
  $users: {
    allow: {
      view: 'auth.id != null && auth.id == data.id',
      create: 'false', // REQUIRED by Instant
      update: 'auth.id != null && auth.id == data.id',
      delete: 'false',
    },
  },
  $files: {
    allow: {
      // Users can view their own files
      view: 'auth.id != null && data.path.startsWith(auth.id + "/")',
      create: 'auth.id != null && data.path.startsWith(auth.id + "/")',
      update: 'auth.id != null && data.path.startsWith(auth.id + "/")',
      delete: 'auth.id != null && data.path.startsWith(auth.id + "/")',
    },
  },

  // ============== USER PROFILE ==============
  
  userProfile: {
    bind: {
      isOwner: 'auth.id != null && auth.id == data.user.id',
    },
    allow: {
      view: 'isOwner',
      create: 'auth.id != null',
      update: 'isOwner',
      delete: 'isOwner',
    },
  },

  // ============== HABITS ==============
  
  habit: {
    bind: {
      isOwner: 'auth.id != null && auth.id == data.owner.id',
    },
    allow: {
      view: 'isOwner',
      create: 'auth.id != null',
      update: 'isOwner',
      delete: 'isOwner',
    },
  },

  habitLog: {
    bind: {
      isOwner: 'auth.id != null && auth.id == data.habit.owner.id',
    },
    allow: {
      view: 'isOwner',
      create: 'isOwner',
      update: 'isOwner',
      delete: 'isOwner',
    },
  },

  habitStats: {
    bind: {
      isOwner: 'auth.id != null && auth.id == data.habit.owner.id',
    },
    allow: {
      view: 'isOwner',
      create: 'isOwner',
      update: 'isOwner',
      delete: 'isOwner',
    },
  },

  // ============== MOOD TRACKING ==============
  
  moodLog: {
    bind: {
      isOwner: 'auth.id != null && auth.id == data.owner.id',
    },
    allow: {
      view: 'isOwner',
      create: 'auth.id != null',
      update: 'isOwner',
      delete: 'isOwner',
    },
  },

  moodStats: {
    bind: {
      isOwner: 'auth.id != null && auth.id == data.owner.id',
    },
    allow: {
      view: 'isOwner',
      create: 'isOwner',
      update: 'isOwner',
      delete: 'isOwner',
    },
  },

  // ============== ACHIEVEMENTS ==============
  
  achievement: {
    // System-defined achievements are readable by all, only admins can create
    allow: {
      view: 'true', // Public read for achievement definitions
      create: 'false', // Only via admin/migration
      update: 'false',
      delete: 'false',
    },
  },

  userAchievement: {
    bind: {
      isOwner: 'auth.id != null && auth.id == data.user.id',
    },
    allow: {
      view: 'isOwner',
      create: 'isOwner', // Created when user unlocks
      update: 'isOwner', // Mark as viewed
      delete: 'false', // Keep achievement history
    },
  },

  // ============== NOTIFICATIONS ==============
  
  notification: {
    bind: {
      isOwner: 'auth.id != null && auth.id == data.user.id',
    },
    allow: {
      view: 'isOwner',
      create: 'isOwner', // Created by client scheduler or push webhook
      update: 'isOwner', // Mark as read/dismissed
      delete: 'isOwner',
    },
  },

  // ============== DAILY SNAPSHOTS ==============
  
  dailySnapshot: {
    bind: {
      isOwner: 'auth.id != null && auth.id == data.user.id',
    },
    allow: {
      view: 'isOwner',
      create: 'isOwner',
      update: 'isOwner',
      delete: 'isOwner',
    },
  },

} satisfies InstantRules;

export default rules;