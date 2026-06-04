'use client'
import { useEffect, useState, Suspense } from "react";
import SawaFlix from "../../../components/Dashboard/SawaFlix";
import { createClient } from '../../../utils/supabase/client'
import { User as SupabseUser } from '@supabase/supabase-js'
import { useRouter } from "next/navigation";
import { FeedSkeleton } from "../../../components/Dashboard/Skeletons";

type UserData = {
  username:string | null;
  role: string | null;
}

export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<UserData | null>(null);
  const [currentUser, setCurrentUser] = useState<SupabseUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        if (user) {
          const { data: profileData, error } = await supabase
          .from('users')
          .select('username, role')
          .eq('id', user.id)
          .single<UserData>();

          if (error) {
            console.error('error fetching user:', error.message);
          } else if (profileData) {
            setUserProfile(profileData);
          }
        }
      } catch (error) {
        console.error('error fetching user:', error);
      }
    };
    fetchUser();
  }, []); 

  return (
    <div className="min-h-full">
      <Suspense fallback={<FeedSkeleton />}>
        <SawaFlix />
      </Suspense>
    </div>
  );
}