import { Link, useLocation } from "wouter";
import { Home, Compass, PlusCircle, MessageCircle, Bell } from "lucide-react";

export default function MobileNavigation() {
  const [location] = useLocation();
  const { setShowCreatePostModal } = useContext(require("@/contexts/post-context").PostContext);

  return (
    <div className="sm:hidden border-t border-border bg-white dark:bg-background fixed bottom-0 w-full z-40">
      <div className="flex justify-around px-2 py-3">
        <Link href="/">
          <a className={`${location === "/" ? "text-primary" : "text-accent"} flex flex-col items-center text-xs font-medium`}>
            <Home className="h-5 w-5 mb-1" />
            <span>Home</span>
          </a>
        </Link>
        <Link href="/explore">
          <a className={`${location === "/explore" ? "text-primary" : "text-accent"} flex flex-col items-center text-xs font-medium`}>
            <Compass className="h-5 w-5 mb-1" />
            <span>Explore</span>
          </a>
        </Link>
        <a 
          onClick={() => setShowCreatePostModal(true)}
          className="text-accent flex flex-col items-center text-xs font-medium cursor-pointer"
        >
          <PlusCircle className="h-5 w-5 mb-1" />
          <span>Create</span>
        </a>
        <Link href="/messages">
          <a className={`${location.startsWith("/messages") ? "text-primary" : "text-accent"} flex flex-col items-center text-xs font-medium`}>
            <MessageCircle className="h-5 w-5 mb-1" />
            <span>Messages</span>
          </a>
        </Link>
        <Link href="/notifications">
          <a className={`${location === "/notifications" ? "text-primary" : "text-accent"} flex flex-col items-center text-xs font-medium`}>
            <Bell className="h-5 w-5 mb-1" />
            <span>Alerts</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
