import { Link } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { User, Bookmark, Heart, CreditCard, Settings } from "lucide-react";

export default function LeftSidebar() {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="hidden md:block w-60 flex-shrink-0">
      <div className="bg-white dark:bg-background rounded-xl shadow-sm p-5 mb-6">
        <div className="flex items-center space-x-3 mb-6">
          <img 
            className="h-12 w-12 rounded-full object-cover border-2 border-primary"
            src={user.profileImage || "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?auto=format&fit=crop&w=64&h=64"} 
            alt="User profile" 
          />
          <div>
            <h3 className="font-semibold text-foreground">{user.displayName}</h3>
            <p className="text-xs text-accent">@{user.username}</p>
          </div>
        </div>

        <div className="space-y-4">
          <Link href={`/profile/${user.username}`}>
            <a className="flex items-center space-x-3 text-foreground font-medium hover:text-primary transition-colors">
              <User className="w-5 h-5" />
              <span>My Profile</span>
            </a>
          </Link>
          <Link href="/bookmarks">
            <a className="flex items-center space-x-3 text-foreground font-medium hover:text-primary transition-colors">
              <Bookmark className="w-5 h-5" />
              <span>Bookmarks</span>
            </a>
          </Link>
          <Link href="/liked">
            <a className="flex items-center space-x-3 text-foreground font-medium hover:text-primary transition-colors">
              <Heart className="w-5 h-5" />
              <span>Liked Content</span>
            </a>
          </Link>
          <Link href="/subscriptions">
            <a className="flex items-center space-x-3 text-foreground font-medium hover:text-primary transition-colors">
              <CreditCard className="w-5 h-5" />
              <span>Subscriptions</span>
            </a>
          </Link>
          <Link href="/settings">
            <a className="flex items-center space-x-3 text-foreground font-medium hover:text-primary transition-colors">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </a>
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-background rounded-xl shadow-sm p-5">
        <h3 className="font-semibold text-foreground mb-4">Suggested Creators</h3>
        <div className="space-y-4">
          {[
            {
              id: 1,
              username: "jesslee",
              displayName: "Jessica Lee",
              profileImage: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=64&h=64",
              occupation: "Photographer"
            },
            {
              id: 2,
              username: "miketrainer",
              displayName: "Mike Trainer",
              profileImage: "https://images.unsplash.com/photo-1590086782957-93c06ef21604?auto=format&fit=crop&w=64&h=64",
              occupation: "Fitness Coach"
            },
            {
              id: 3,
              username: "sophiaart",
              displayName: "Sophia Art",
              profileImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=64&h=64",
              occupation: "Visual Artist"
            }
          ].map((creator) => (
            <div key={creator.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={creator.profileImage}
                  alt={`${creator.displayName} profile`}
                />
                <div>
                  <h4 className="font-medium text-sm text-foreground">{creator.displayName}</h4>
                  <p className="text-xs text-accent">{creator.occupation}</p>
                </div>
              </div>
              <button className="text-sm font-medium text-primary hover:text-primary/80">Follow</button>
            </div>
          ))}
          
          <Link href="/explore">
            <a className="block text-center text-secondary text-sm font-medium mt-3 hover:underline">View All</a>
          </Link>
        </div>
      </div>
    </div>
  );
}
