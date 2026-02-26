import React from 'react';
import { Pressable, View, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { Text } from '@/components/ui/text';
import db from '@/lib/db';
import { MotiView } from 'moti';
import {FontAwesome} from '@expo/vector-icons'
import { useColorScheme } from 'nativewind';
const GoogleButton = () => {
    const {colorScheme}=useColorScheme()
    
    const isDark = colorScheme === 'dark'
    
    const [isLoading, setIsLoading] = React.useState(false);
    
const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {

      // pre configure

        GoogleSignin.configure({
          webClientId: '681908254289-v40fsir21ng0774phggd3ohnp6pmt3tf.apps.googleusercontent.com',
          offlineAccess: true
        })


        // 1. Ensure services are available
        await GoogleSignin.hasPlayServices();
        
        // 2. Sign in
        const response = await GoogleSignin.signIn();

        // 3. Extract the ID Token correctly
        // In newer versions, it's response.data.idToken
        const idToken = response.data?.idToken;

        if (!idToken) {
            throw new Error("No ID token present!");
        }

        // 4. Authenticate with your DB (Supabase/Custom)
        const res = await db.auth.signInWithIdToken({
          clientName: "google-android",
          idToken,
        });
        
        console.log("Logged in!", res);

    } catch (error: any) {
      if (error.code === 'OTW_STATUS_CODES.SIGN_IN_CANCELLED') {
          console.log("User cancelled the login");
      } else {
          console.error("Sign in error:", error);
      }
    } finally {
      setIsLoading(false);
    }
};

  return (
    <Pressable 
      onPress={handleGoogleSignIn}
      disabled={isLoading}
    //   className="active:opacity-80"
    >
      <MotiView
        animate={{
        //   scale: isLoading ? 0.98 : 1,
        //   backgroundColor: isLoading ? '#1A2C2C' : 'rgba(255, 255, 255, 0.05)'
        }}
        className="h-[70px] w-full flex-row items-center bg-accent justify-center gap-3 rounded-full border border-white/10 px-6"
        style={{
          // Adding a slight glass effect
          backgroundColor: 'rgba(0, 181, 142, 0.03)',
        }}
      >
        {isLoading ? (
          <ActivityIndicator color="#2AF5FF" />
        ) : (
          <>
            
            <FontAwesome name={'google'} size={24}  color={isDark ? 'white': 'black'}/>

            <Text className="text-lg font-semibold text-white">
              Continue with Google
            </Text>
          </>
        )}
      </MotiView>
    </Pressable>
  );
};

export default GoogleButton;