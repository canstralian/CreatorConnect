import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TopNavigation from "@/components/navigation/top-navigation";
import MobileNavigation from "@/components/navigation/mobile-navigation";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { User, Settings, Grid, Bookmark, Heart, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Profile() {
  const params = useParams();
  const [location, navigate] = useLocation();
  const { user: currentUser, checkAuth } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const username = params.username;

  // Check authentication status
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Fetch profile user and their posts
  const { data: profile, isLoading } = useQuery({
    queryKey: [`/api/users/${username}/posts`],
    enabled: !!username,
  });

  // Follow/unfollow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser || !profile?.user?.id) {
        throw new Error("Authentication required");
      }
      return apiRequest("POST", `/api/users/${profile.user.id}/follow`);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${username}/posts`] });
      toast({
        title: data.following ? "Following" : "Unfollowed",
        description: data.following 
          ? `You are now following ${profile?.user?.displayName}` 
          : `You have unfollowed ${profile?.user?.displayName}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update follow status",
        variant: "destructive",
      });
    },
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser || !profile?.user?.id) {
        throw new Error("Authentication required");
      }
      return apiRequest("POST", `/api/users/${profile.user.id}/subscribe`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${username}/posts`] });
      toast({
        title: "Subscribed!",
        description: `You are now subscribed to ${profile?.user?.displayName}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to subscribe",
        variant: "destructive",
      });
    },
  });

  // Handle follow button click
  const handleFollow = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    followMutation.mutate();
  };

  // Handle subscribe button click
  const handleSubscribe = () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    subscribeMutation.mutate();
  };

  if (isLoading) {
    return (
      <>
        <TopNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white dark:bg-background rounded-xl shadow-sm p-6 animate-pulse">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-gray-200"></div>
              <div className="flex-1">
                <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-20 w-full bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <MobileNavigation />
      </>
    );
  }

  if (!profile?.user) {
    return (
      <>
        <TopNavigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white dark:bg-background rounded-xl shadow-sm p-8 text-center">
            <User className="h-12 w-12 mx-auto text-accent mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">User Not Found</h2>
            <p className="text-accent mb-4">The profile you're looking for doesn't exist or may have been removed.</p>
            <Button onClick={() => navigate("/")}>Back to Home</Button>
          </div>
        </div>
        <MobileNavigation />
      </>
    );
  }

  const isOwnProfile = currentUser?.id === profile.user.id;

  return (
    <>
      <TopNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-16 sm:pb-6">
        {/* Profile Header */}
        <div className="bg-white dark:bg-background rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <img
                src={profile.user.profileImage || "https://i.pravatar.cc/300"}
                alt={profile.user.displayName}
                className="h-24 w-24 md:h-32 md:w-32 rounded-full object-cover border-4 border-primary"
              />
            </div>
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                <div>
                  <div className="flex items-center">
                    <h1 className="text-2xl font-bold text-foreground mr-2">{profile.user.displayName}</h1>
                    {profile.user.isVerified && <VerifiedBadge size="md" />}
                  </div>
                  <p className="text-accent">@{profile.user.username}</p>
                </div>
                <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
                  {isOwnProfile ? (
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={() => navigate("/settings")}
                    >
                      <Settings className="h-4 w-4" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={handleFollow}
                        disabled={followMutation.isPending}
                      >
                        {profile.user.isFollowing ? "Following" : "Follow"}
                      </Button>
                      {profile.user.isCreator && (
                        <Button 
                          className="bg-primary hover:bg-primary/80 text-white"
                          onClick={handleSubscribe}
                          disabled={subscribeMutation.isPending}
                        >
                          {profile.user.isSubscribed ? "Subscribed" : "Subscribe"}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
              <p className="text-foreground mb-4">{profile.user.bio || "No bio provided."}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Grid className="h-4 w-4 text-accent" />
                  <span><strong>{profile.posts.length}</strong> Posts</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-accent" />
                  <span><strong>{profile.user.followers || 0}</strong> Followers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-accent" />
                  <span><strong>{profile.user.following || 0}</strong> Following</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="bg-white dark:bg-background rounded-xl shadow-sm w-full mb-6">
            <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
            <TabsTrigger value="media" className="flex-1">Media</TabsTrigger>
            <TabsTrigger value="likes" className="flex-1">Likes</TabsTrigger>
            {profile.user.isCreator && (
              <TabsTrigger value="subscriptions" className="flex-1">Premium</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="posts">
            {profile.posts.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {profile.posts.map((post) => (
                  <div key={post.id} className="bg-white dark:bg-background rounded-xl shadow-sm overflow-hidden">
                    <div className="p-4">
                      <p className="text-foreground mb-3">{post.content}</p>
                      {post.imageUrl && (
                        <img
                          src={post.imageUrl}
                          alt="Post content"
                          className="w-full h-auto rounded-lg mb-3"
                        />
                      )}
                      <div className="flex justify-between text-accent text-sm">
                        <div className="flex gap-4">
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {post.likesCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            {post.commentsCount}
                          </span>
                        </div>
                        <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-background rounded-xl shadow-sm p-8 text-center">
                <p className="text-accent">No posts to display.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="media">
            {profile.posts.filter(post => post.imageUrl).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {profile.posts
                  .filter(post => post.imageUrl)
                  .map((post) => (
                    <div key={post.id} className="relative group aspect-square rounded-lg overflow-hidden">
                      <img
                        src={post.imageUrl}
                        alt="Post media"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white">
                        <span className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          {post.likesCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {post.commentsCount}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-background rounded-xl shadow-sm p-8 text-center">
                <p className="text-accent">No media content to display.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="likes">
            <div className="bg-white dark:bg-background rounded-xl shadow-sm p-8 text-center">
              <Heart className="h-12 w-12 mx-auto text-accent mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Liked Content</h2>
              <p className="text-accent mb-4">Content that {isOwnProfile ? "you've" : `${profile.user.displayName} has`} liked will appear here.</p>
            </div>
          </TabsContent>
          
          {profile.user.isCreator && (
            <TabsContent value="subscriptions">
              <div className="bg-white dark:bg-background rounded-xl shadow-sm p-8 text-center">
                <Bookmark className="h-12 w-12 mx-auto text-accent mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">Premium Content</h2>
                <p className="text-accent mb-4">
                  {isOwnProfile 
                    ? "Your premium content is only visible to your subscribers." 
                    : "Subscribe to see premium content from this creator."}
                </p>
                {!isOwnProfile && !profile.user.isSubscribed && (
                  <Button 
                    className="bg-primary hover:bg-primary/80 text-white"
                    onClick={handleSubscribe}
                    disabled={subscribeMutation.isPending}
                  >
                    Subscribe Now
                  </Button>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
      <MobileNavigation />
    </>
  );
}
