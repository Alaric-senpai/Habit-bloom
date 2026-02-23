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
        GoogleSignin.configure()
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();

        if(isSuccessResponse(userInfo)){
            const idToken = userInfo.data.idToken;
            if (!idToken) {
                console.error("No ID token present!");
                return;
            }
            const res = await db.auth.signInWithIdToken({
              clientName: "google-android",
              idToken,
            });
            
            console.log("Logged in!", res);

        }else{
            console.log('user res', userInfo)
            return
        }



    } catch (error) {
      console.log("Error signing in", error);
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
            {/* <View className="mr-3 h-6 w-6 items-center justify-center bg-white rounded-full"> */}
               {/* Using a CDN link for the Google G logo for reliability */}
              {/* <Image 
                source="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_Color_Icon.svg"
                style={{ width: 14, height: 14 }}
              /> */}
            <FontAwesome name={'google'} size={24}  color={isDark ? 'white': 'black'}/>

            {/* </View> */}
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