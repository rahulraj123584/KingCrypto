'use client'

import WebApp from '@twa-dev/sdk'
import { useEffect, useState } from 'react'

const API_ENDPOINT = 'https://awmfwke4f2.execute-api.ap-south-1.amazonaws.com/telegram-bot-handler';

// Define the interface for user data
interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}
let toddle = ""

export default function Home() {
  const [startAppParam, setStartAppParam] = useState<string | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [channelLink, setChannelLink] = useState<string | null>(null)

  useEffect(() => {
    try {
      if (!WebApp.initDataUnsafe) {
        console.error("Error: WebApp.initDataUnsafe is undefined");
        return;
      }

      // Get startapp parameter safely
      let param = WebApp.initDataUnsafe?.start_param || null;
      setStartAppParam(param);

      // Get user details safely
      if (WebApp.initDataUnsafe?.user) {
        const user = WebApp.initDataUnsafe.user as UserData;
        setUserData(user);

        // First, store user data, then fetch the channel link
        sendUserData(user).then(() => {
          toddle = "dangerouslySetInnerHTML";
          if (param) decryptLink(param);


        });
      }
    } catch (error) {
      console.error("Error initializing WebApp:", error);
    }
  }, []);

  const sendUserData = async (user: UserData) => {
    const payload = {
      operation: "store-user-data",
      data: JSON.stringify({
        id: user.id.toString(),
        first_name: user.first_name || "None",
        user_name: user.username || "None",
        last_name: user.last_name || "None"
      })
    };

    try {
      
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
     
    } catch (error) {
      console.error("Error sending user data:", error);
    }
  };


  // const closeAndRedirect = (channelLink: string) => {
  //   if (typeof window !== "undefined") {
    
  //     window.location.href = channelLink;
  //     WebApp.close()
  //   }
  // };
  const closeAndRedirect = (channelLink: string) => {
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.location.href = channelLink;
        WebApp.close();
      }, 500); // 1-second delay
    }
  };
  
  const decryptLink = async (encryptedName: string) => {
    
    try {
    
        let paddedInput = encryptedName.replace(/-/g, "+").replace(/_/g, "/");

      
        paddedInput += "=".repeat((4 - (paddedInput.length % 4)) % 4);

  
        let encryptedBytes = atob(paddedInput);

       
        let decryptedText = "";
        for (let i = 0; i < encryptedBytes.length; i++) {
            decryptedText += String.fromCharCode(
                encryptedBytes.charCodeAt(i) ^ toddle.charCodeAt(i % toddle.length)
            );
        }

       
        let channelLink = `https://t.me/+${decryptedText}`;
      

        
        closeAndRedirect(channelLink);
    } catch (error) {
        console.error("Decryption failed:", error);
    }
  };

  
  


  return (
    <main className="p-4">

    </main>
  )
}



