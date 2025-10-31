<img src='/assets/images/logo.png'  />
# Habit Bloom — Your Personal Habit & Mood Tracker

Habit Bloom is a beautifully designed habit tracking and mood journaling app that helps users build consistency, improve productivity, and visualize progress.  
With a calm dark theme and intuitive flow, Hability transforms daily self-improvement into a motivating visual journey.

---

## ✨ Overview

The app allows users to:
- Create and track habits visually with custom icons and colors  
- Log daily moods and patterns  
- View progress analytics and streaks  
- Receive reminders and motivational prompts  
- Securely sign in with local email & password authentication  
- Set personalized preferences, goals, and themes

---

## 📱 App Flow & Features

### 🧭 Onboarding
- Personalized welcome flow guiding users through key features  
- Quick questionnaire to understand user routines (sleep time, focus levels, procrastination habits, etc.)  
- User signs up using email & password and completes onboarding to tailor reminders and visuals  

### 🧑‍💼 Authentication
- Local email/password authentication  
- Password recovery and OTP reset screens  
- Secure account with encrypted credentials  

### 🧠 Habit Management
- Create habits with:
  - Custom name, icon, and color  
  - Repetition schedule (daily, weekly, or custom)  
  - Optional numeric target (e.g., drink 2L of water)  
- Track completion daily with single-tap logging  
- Organize habits into a vibrant, color-coded list  
- Archive inactive habits without losing data  

### 📊 Analytics & Reports
- View weekly/monthly stats on progress and completion rates  
- Visualize streaks and performance trends with charts  
- See progress summaries for each habit and total completions  

### 😄 Mood Tracker
- Log daily mood with emoji-based entries  
- Add optional notes for emotional journaling  
- View historical mood trends on an interactive chart  

### 🔔 Reminders & Notifications
- Daily reminders for habits and reflections  
- Configurable notification time and frequency  

### ⚙️ Settings & Customization
- Theme options (Dark / Light)  
- Custom reminder time and daily notification toggle  
- Manage account details and password reset  

---

## 🧩 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | React Native / Expo (for mobile) |
| **Backend** | Local Sqlite db Appwrite(future)|
| **Database** | Appwrite Databases & Collections |
| **Design** | Figma / Vector-based Icon Set |
| **Charts** | Recharts / Victory Native |
| **State Management** | Zustand or Recoil |
| **Styling** | Tailwind CSS (NativeWind) |

---

## 🧮 Example Flow

**Signup → Questionnaire → Habit Creation → Daily Tracking → Reports**

1. User registers with email and password.  
2. App prompts onboarding quiz to customize recommendations.  
3. User creates habits (e.g., “Read 20 pages”).  
4. Daily logs update `habit_logs` and trigger recalculation of `habit_stats`.  
5. Reports visualize data from `reports` and `habit_stats`.  
6. User optionally logs mood each day in `mood_logs`.  

---


## 🚀 Setup Instructions

1. **Clone the repo**
   ```bash
   git clone https://github.com/Alaric-senpai/Habit-bloom.git habitbloom
   cd  habitbloom
    ````

2. **Install dependencies**

   ```bash
   pnpm install
4. **Run app locally**

   ```bash
   pnpm dev
   ```

---

## 📈 Future Enhancements

* Social accountability (friends & shared goals)
* AI habit suggestions based on usage patterns
* Calendar sync (Google/Apple)
* Offline mode with local caching

---

## 🧑‍💻 Contributing

Contributions are welcome!
To propose changes:

1. Fork the repo
2. Create a new branch
3. Commit your changes
4. Submit a pull request

---

## 🪄 License

Licensed under the **MIT License** — free to use, modify, and distribute with attribution.

---

## 💜 Credits

Designed by **[Alaric senpai](https://devcharles.me)**
Developed with 💡, ☕, and lots of late-night debugging sessions.


