import db from "@/lib/db";
import { User } from "@instantdb/react-native";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthError {
  message: string
}


export interface habitBloomContextType {
  isLoading:boolean,
  error: AuthError| undefined,
  user:User | undefined | null,
  isAuthenticated:boolean
}


const habitBloomContext = createContext<habitBloomContextType| null>(null)


export function HabitBloomContextProvider({children}:{children:React.ReactNode}){
  const [isAuthenticated, setIsAuthenticated]= useState<boolean>(false)

  const {isLoading, error, user } = db.useAuth()

  useEffect(()=>{

    if(user && user.id){
      setIsAuthenticated(true)
    }else{
      setIsAuthenticated(false)
    }

  }, [user])

  return (
    <habitBloomContext.Provider value={{
      isLoading,
      error,
      user,
      isAuthenticated
    }}>
      {children}
    </habitBloomContext.Provider>
  )

}


export function useHabitBloom(){
   const context  = useContext(habitBloomContext)

   if(!context){
    throw new Error("Context must be used inside the provider")
   }

   return context
}





