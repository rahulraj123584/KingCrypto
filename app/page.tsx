'use client'

import WebApp from '@twa-dev/sdk'
import { useEffect, useState } from 'react'

const API_ENDPOINT = 'https://iutqwuscug.execute-api.ap-south-1.amazonaws.com/telegram-bot-handler';

// Define the interface for user data
interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

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
      const param = WebApp.initDataUnsafe?.start_param || null;
      setStartAppParam(param);

      // Get user details safely
      if (WebApp.initDataUnsafe?.user) {
        const user = WebApp.initDataUnsafe.user as UserData;
        setUserData(user);

        // First, store user data, then fetch the channel link
        sendUserData(user).then(() => {
          if (param) fetchChannelLink(param);
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
      console.log("Sending user data:", payload);
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      console.log("User data sent successfully:", result);
    } catch (error) {
      console.error("Error sending user data:", error);
    }
  };


  const closeAndRedirect = (channelLink: string) => {
    if (typeof window !== "undefined") {
      console.log("Closing Mini App and Redirecting to:", channelLink);
      window.location.href = channelLink; 
      WebApp.close()
    }
  };
  const fetchChannelLink = async (encryptedName: string) => {
    const payload = {
      operation: "fetch-channel-link",
      data: JSON.stringify({ encrpyted_name: encryptedName })
    };
  
    try {
      console.log("Fetching channel link with:", payload);
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
  
      const channelLink = (await response.text()).replace(/^"|"$/g, '');
      // Directly get plain text response
  
      console.log("Channel link fetched:", channelLink);
  
      // Ensure the fetched link is a valid Telegram link before redirecting
      if (channelLink.startsWith("https://t.me/")) {
        console.log("Redirecting to:", channelLink);
        // WebApp.close(); 
        closeAndRedirect(channelLink);
        // window.location.href = channelLink; // Redirect
      } else {
        console.error("Invalid channel link received:", channelLink);
      }
    } catch (error) {
      console.error("Error fetching channel link:", error);
    }
  };
  

  return (
    <main className="p-4">
      
    </main>
  )
}



