import type { InstantRules } from '@instantdb/react-native';

/**
 * Habit Bloom Fixed Permissions
 * * Fix: Use direct property checks or defensive logic to prevent
 * 'ATTRIBUTE_NOT_FOUND' during link/transact operations.
 */

const rules = {
  // ============== SYSTEM ==============
  
  $users: {
    allow: {
      view: 'auth.id != null && auth.id == data.id',
      create: 'false', 
      update: 'auth.id != null && auth.id == data.id',
      delete: 'false',
    },
  },
  $files: {
    allow: {
      view: 'auth.id != null && data.path.startsWith(auth.id + "/")',
      create: 'auth.id != null && data.path.startsWith(auth.id + "/")',
      update: 'auth.id != null && data.path.startsWith(auth.id + "/")',
      delete: 'auth.id != null && data.path.startsWith(auth.id + "/")',
    },
  },

  // ============== USER PROFILE ==============
  
  userProfile: {
    bind: {
      // Defensive check for the user link
      isOwner: 'auth.id != null && data.user != null && auth.id == data.user.id',
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
      // Fix: Ensure data.owner exists before accessing .id
      isOwner: 'auth.id != null && data.owner != null && auth.id == data.owner.id',
    },
    allow: {
      view: 'isOwner',
      // Allow create if authenticated; link is handled in the same transaction
      create: 'auth.id != null',
      update: 'isOwner',
      delete: 'isOwner',
    },
  },

  habitLog: {
    bind: {
      // Traversal fix: Check habit and habit.owner levels
      isOwner: 'auth.id != null && data.habit != null && data.habit.owner != null && auth.id == data.habit.owner.id',
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
      isOwner: 'auth.id != null && data.habit != null && data.habit.owner != null && auth.id == data.habit.owner.id',
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
      isOwner: 'auth.id != null && data.owner != null && auth.id == data.owner.id',
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
      isOwner: 'auth.id != null && data.owner != null && auth.id == data.owner.id',
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
    allow: {
      view: 'true', 
      create: 'false', 
      update: 'false',
      delete: 'false',
    },
  },

  userAchievement: {
    bind: {
      isOwner: 'auth.id != null && data.user != null && auth.id == data.user.id',
    },
    allow: {
      view: 'isOwner',
      create: 'isOwner', 
      update: 'isOwner', 
      delete: 'false', 
    },
  },

  // ============== NOTIFICATIONS ==============
  
  notification: {
    bind: {
      isOwner: 'auth.id != null && data.user != null && auth.id == data.user.id',
    },
    allow: {
      view: 'isOwner',
      create: 'isOwner', 
      update: 'isOwner', 
      delete: 'isOwner',
    },
  },

  // ============== DAILY SNAPSHOTS ==============
  
  dailySnapshot: {
    bind: {
      isOwner: 'auth.id != null && data.user != null && auth.id == data.user.id',
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