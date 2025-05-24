import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import TopNavigation from "@/components/navigation/top-navigation";
import MobileNavigation from "@/components/navigation/mobile-navigation";
import LeftSidebar from "@/components/sidebar/left-sidebar";
import RightSidebar from "@/components/sidebar/right-sidebar";
import StoryCarousel from "@/components/feed/story-carousel";
import FeedPost from "@/components/feed/feed-post";
import CreatePostModal from "@/components/feed/create-post-modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, checkAuth } = useAuth();

  // Check authentication status
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Fetch posts
  const {
    data: posts,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useQuery({
    queryKey: ["/api/posts"],
    enabled: !!user,
  });

  return (
    <>
      <TopNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-screen">
        <div className="flex flex-col md:flex-row gap-6">
          <LeftSidebar />
          
          <div className="flex-1 pb-16 sm:pb-0">
            <StoryCarousel />
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : isError ? (
              <div className="bg-white dark:bg-background rounded-xl shadow-sm p-8 text-center">
                <p className="text-foreground">Failed to load posts. Please try again later.</p>
              </div>
            ) : posts && posts.length > 0 ? (
              <>
                {posts.map((post) => (
                  <FeedPost key={post.id} post={post} />
                ))}
                <div className="flex justify-center py-6">
                  <Button
                    variant="outline"
                    className="bg-white dark:bg-background text-primary border border-primary hover:bg-primary hover:text-white transition-colors duration-300 font-medium rounded-lg px-6 py-2 flex items-center space-x-2"
                    onClick={() => fetchNextPage()}
                    disabled={!hasNextPage || isFetchingNextPage}
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Loading...</span>
                      </>
                    ) : hasNextPage ? (
                      <span>Load More</span>
                    ) : (
                      <span>No more posts</span>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-background rounded-xl shadow-sm p-8 text-center">
                <p className="text-foreground">
                  {user ? "No posts to show. Start following creators to see their content!" : "Log in to view posts"}
                </p>
              </div>
            )}
          </div>
          
          <RightSidebar />
        </div>
      </div>
      <MobileNavigation />
      <CreatePostModal />
    </>
  );
}
