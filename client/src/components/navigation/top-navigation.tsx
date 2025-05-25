import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { usePost } from "@/contexts/post-context";
import { Search } from "lucide-react";

export default function TopNavigation() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { setShowCreatePostModal } = usePost();

  return (
    <nav className="bg-white dark:bg-background shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-primary font-bold text-2xl cursor-pointer">AdultConnect</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/">
                <div
                  className={`${
                    location === "/" 
                      ? "border-b-2 border-primary text-foreground" 
                      : "border-transparent border-b-2 hover:border-accent text-accent hover:text-foreground"
                  } px-1 pt-1 font-medium text-sm`}
                >
                  Home
                </div>
              </Link>
              <Link href="/explore">
                <div
                  className={`${
                    location === "/explore" 
                      ? "border-b-2 border-primary text-foreground" 
                      : "border-transparent border-b-2 hover:border-accent text-accent hover:text-foreground"
                  } px-1 pt-1 font-medium text-sm`}
                >
                  Explore
                </div>
              </Link>
              <Link href="/messages">
                <div
                  className={`${
                    location.startsWith("/messages") 
                      ? "border-b-2 border-primary text-foreground" 
                      : "border-transparent border-b-2 hover:border-accent text-accent hover:text-foreground"
                  } px-1 pt-1 font-medium text-sm`}
                >
                  Messages
                </div>
              </Link>
              <Link href="/notifications">
                <div
                  className={`${
                    location === "/notifications" 
                      ? "border-b-2 border-primary text-foreground" 
                      : "border-transparent border-b-2 hover:border-accent text-accent hover:text-foreground"
                  } px-1 pt-1 font-medium text-sm`}
                >
                  Notifications
                </div>
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="hidden sm:block mx-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-accent" />
                </div>
                <Input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-input rounded-lg bg-muted focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Search creators..."
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setShowCreatePostModal(true)} 
                className="hidden md:block bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Create Post
              </Button>
              {user ? (
                <Link href={`/profile/${user.username}`}>
                  <div className="relative cursor-pointer">
                    <img 
                      className="h-10 w-10 rounded-full object-cover border-2 border-primary"
                      src={user.profileImage || "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?auto=format&fit=crop&w=64&h=64"} 
                      alt="User profile" 
                    />
                  </div>
                </Link>
              ) : (
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
