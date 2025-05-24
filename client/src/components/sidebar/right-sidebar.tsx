import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export default function RightSidebar() {
  return (
    <div className="hidden lg:block w-80 flex-shrink-0">
      <div className="bg-white dark:bg-background rounded-xl shadow-sm p-5 mb-6">
        <h3 className="font-semibold text-foreground mb-4">Popular Creators</h3>
        <div className="space-y-4">
          {[
            {
              id: 1,
              username: "sophiaart",
              displayName: "Sophia Art",
              profileImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=64&h=64",
              subscribers: "14.2k",
            },
            {
              id: 2,
              username: "djmax",
              displayName: "DJ Max",
              profileImage: "https://images.unsplash.com/photo-1502872364588-894d7d6ddfab?auto=format&fit=crop&w=64&h=64",
              subscribers: "11.8k",
            },
            {
              id: 3,
              username: "yogalife",
              displayName: "Yoga Life",
              profileImage: "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?auto=format&fit=crop&w=64&h=64",
              subscribers: "9.5k",
            }
          ].map((creator) => (
            <div key={creator.id} className="flex items-center space-x-3">
              <img
                className="h-12 w-12 rounded-full object-cover"
                src={creator.profileImage}
                alt={`${creator.displayName} profile`}
              />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-sm text-foreground">{creator.displayName}</h4>
                  <Badge variant="secondary" className="text-xs text-white px-2 py-0.5 rounded-full">Top</Badge>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-accent">{creator.subscribers} subscribers</p>
                  <Link href={`/profile/${creator.username}`}>
                    <a className="text-xs text-primary font-medium hover:text-primary/80">View</a>
                  </Link>
                </div>
              </div>
            </div>
          ))}
          
          <Link href="/explore">
            <a className="block text-center text-secondary text-sm font-medium mt-3 hover:underline">See All Popular Creators</a>
          </Link>
        </div>
      </div>
      
      <div className="bg-white dark:bg-background rounded-xl shadow-sm p-5 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-foreground">Recent Messages</h3>
          <Link href="/messages">
            <a className="text-secondary text-sm hover:underline">See All</a>
          </Link>
        </div>
        <div className="space-y-4">
          {[
            {
              id: 1,
              username: "djmax",
              displayName: "DJ Max",
              profileImage: "https://images.unsplash.com/photo-1502872364588-894d7d6ddfab?auto=format&fit=crop&w=64&h=64",
              message: "Hey, thanks for subscribing! Check out my...",
              time: "5m",
              isOnline: true,
            },
            {
              id: 2,
              username: "yogalife",
              displayName: "Yoga Life",
              profileImage: "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?auto=format&fit=crop&w=64&h=64",
              message: "Would you be interested in a private...",
              time: "1h",
              isOnline: true,
            },
            {
              id: 3,
              username: "sophiaart",
              displayName: "Sophia Art",
              profileImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=64&h=64",
              message: "I just posted a new time-lapse of my...",
              time: "2d",
              isOnline: false,
            }
          ].map((message) => (
            <Link key={message.id} href={`/messages/${message.id}`}>
              <a className="flex items-center space-x-3">
                <div className="relative">
                  <img 
                    className="h-10 w-10 rounded-full object-cover" 
                    src={message.profileImage} 
                    alt={`${message.displayName} avatar`} 
                  />
                  {message.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-background rounded-full"></span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm text-foreground">{message.displayName}</h4>
                    <span className="text-xs text-accent">{message.time}</span>
                  </div>
                  <p className="text-xs text-accent truncate w-48">{message.message}</p>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl shadow-sm p-5 text-white">
        <h3 className="font-semibold mb-3">Become a Creator</h3>
        <p className="text-sm mb-4 text-white text-opacity-90">Start earning by sharing your content with subscribers around the world.</p>
        <button className="bg-white text-primary hover:bg-muted font-medium rounded-lg px-4 py-2 text-sm transition duration-300">Get Started</button>
      </div>
    </div>
  );
}
