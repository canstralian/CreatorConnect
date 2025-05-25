import { Link, useLocation } from "wouter";
import { Home, Compass, PlusCircle, MessageCircle, Bell } from "lucide-react";
import { useContext } from "react";
import { PostContext } from "@/contexts/post-context";

export default function MobileNavigation() {
  const [location] = useLocation();
  const { setShowCreatePostModal } = useContext(PostContext);

  return (
    <div className="sm:hidden border-t border-border bg-white dark:bg-background fixed bottom-0 w-full z-40">
      <div className="flex justify-around px-2 py-3">
        <Link href="/">
          <div className={`${location === "/" ? "text-primary" : "text-accent"} flex flex-col items-center text-xs font-medium`}>
            <Home className="h-5 w-5 mb-1" />
            <span>Home</span>
          </div>
        </Link>
        <Link href="/explore">
          <div className={`${location === "/explore" ? "text-primary" : "text-accent"} flex flex-col items-center text-xs font-medium`}>
            <Compass className="h-5 w-5 mb-1" />
            <span>Explore</span>
          </div>
        </Link>
        <div 
          onClick={() => setShowCreatePostModal(true)}
          className="text-accent flex flex-col items-center text-xs font-medium cursor-pointer"
        >
          <PlusCircle className="h-5 w-5 mb-1" />
          <span>Create</span>
        </div>
        <Link href="/messages">
          <div className={`${location.startsWith("/messages") ? "text-primary" : "text-accent"} flex flex-col items-center text-xs font-medium`}>
            <MessageCircle className="h-5 w-5 mb-1" />
            <span>Messages</span>
          </div>
        </Link>
        <Link href="/notifications">
          <div className={`${location === "/notifications" ? "text-primary" : "text-accent"} flex flex-col items-center text-xs font-medium`}>
            <Bell className="h-5 w-5 mb-1" />
            <span>Alerts</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
