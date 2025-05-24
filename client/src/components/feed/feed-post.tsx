import { useState } from "react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Send } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/auth-context";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { useToast } from "@/hooks/use-toast";

interface FeedPostProps {
  post: {
    id: number;
    content: string;
    imageUrl?: string;
    isPremium: boolean;
    createdAt: string;
    user: {
      id: number;
      username: string;
      displayName: string;
      profileImage?: string;
      isVerified: boolean;
    };
    comments: Array<{
      id: number;
      content: string;
      createdAt: string;
      user: {
        id: number;
        username: string;
        displayName: string;
        profileImage?: string;
        isVerified: boolean;
      };
    }>;
    likesCount: number;
    isLiked: boolean;
  };
}

export default function FeedPost({ post }: FeedPostProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [localLiked, setLocalLiked] = useState(post.isLiked);
  const [localLikesCount, setLocalLikesCount] = useState(post.likesCount);

  // Format date
  const formattedDate = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  // Toggle like mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("You must be logged in to like posts");
      }
      return apiRequest("POST", `/api/posts/${post.id}/like`);
    },
    onMutate: () => {
      // Optimistic update
      setLocalLiked(!localLiked);
      setLocalLikesCount(localLiked ? localLikesCount - 1 : localLikesCount + 1);
    },
    onError: (error) => {
      // Revert optimistic update
      setLocalLiked(!localLiked);
      setLocalLikesCount(localLiked ? localLikesCount + 1 : localLikesCount - 1);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to like post",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
  });

  // Add comment mutation
  const commentMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("You must be logged in to comment");
      }
      return apiRequest("POST", `/api/posts/${post.id}/comments`, { content: comment });
    },
    onSuccess: (data) => {
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post comment",
        variant: "destructive",
      });
    },
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("You must be logged in to subscribe");
      }
      return apiRequest("POST", `/api/users/${post.user.id}/subscribe`);
    },
    onSuccess: () => {
      toast({
        title: "Subscribed!",
        description: `You are now subscribed to ${post.user.displayName}`,
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

  // Handle like button click
  const handleLike = () => {
    likeMutation.mutate();
  };

  // Handle comment submission
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      commentMutation.mutate();
    }
  };

  // Determine which comments to show
  const displayComments = showAllComments
    ? post.comments
    : post.comments.slice(0, 1);

  return (
    <div className="bg-white dark:bg-background rounded-xl shadow-sm mb-6 overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex justify-between items-center">
        <Link href={`/profile/${post.user.username}`}>
          <a className="flex items-center space-x-3">
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={post.user.profileImage || "https://i.pravatar.cc/300"}
              alt={`${post.user.displayName} avatar`}
            />
            <div>
              <div className="flex items-center">
                <h4 className="font-medium text-foreground">{post.user.displayName}</h4>
                {post.user.isVerified && <VerifiedBadge className="ml-2" />}
              </div>
              <p className="text-xs text-accent">{formattedDate}</p>
            </div>
          </a>
        </Link>
        <button className="text-accent hover:text-foreground">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Post Content */}
      <div>
        <p className="px-4 pb-3 text-foreground">{post.content}</p>
        {post.imageUrl && (
          <img
            className="w-full h-auto max-h-96 object-cover"
            src={post.imageUrl}
            alt="Post content"
          />
        )}
      </div>

      {/* Post Stats */}
      <div className="p-4 border-t border-border">
        <div className="flex justify-between">
          <div className="flex space-x-6">
            <button
              className={`flex items-center space-x-1 ${
                localLiked ? "text-primary" : "text-accent hover:text-primary"
              }`}
              onClick={handleLike}
            >
              <Heart className={`h-5 w-5 ${localLiked ? "fill-current" : "fill-none"}`} />
              <span>{localLikesCount}</span>
            </button>
            <button className="flex items-center space-x-1 text-accent hover:text-primary">
              <MessageCircle className="h-5 w-5" />
              <span>{post.comments.length}</span>
            </button>
            <button className="flex items-center space-x-1 text-accent hover:text-primary">
              <Bookmark className="h-5 w-5" />
            </button>
          </div>
          <Button
            onClick={() => subscribeMutation.mutate()}
            className="bg-primary hover:bg-primary/80 text-white px-4 py-1.5 rounded-lg text-sm font-medium"
            disabled={subscribeMutation.isPending}
          >
            {subscribeMutation.isPending ? "Loading..." : "Subscribe"}
          </Button>
        </div>

        {/* Comments Preview */}
        <div className="mt-3 pt-3 border-t border-border">
          {displayComments.map((comment) => (
            <div key={comment.id} className="flex items-start space-x-3 mb-3">
              <Link href={`/profile/${comment.user.username}`}>
                <a>
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={comment.user.profileImage || "https://i.pravatar.cc/300"}
                    alt={`${comment.user.displayName} avatar`}
                  />
                </a>
              </Link>
              <div className="bg-muted p-2 rounded-lg flex-1">
                <div className="flex items-center mb-1">
                  <Link href={`/profile/${comment.user.username}`}>
                    <a className="font-medium text-sm text-foreground hover:underline">
                      {comment.user.displayName}
                    </a>
                  </Link>
                  {comment.user.isVerified && <VerifiedBadge className="ml-1" size="xs" />}
                  <span className="ml-2 text-xs text-accent">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-foreground">{comment.content}</p>
              </div>
            </div>
          ))}

          {post.comments.length > 1 && !showAllComments && (
            <button
              className="text-accent text-sm hover:text-foreground"
              onClick={() => setShowAllComments(true)}
            >
              View all {post.comments.length} comments
            </button>
          )}

          {user && (
            <form onSubmit={handleCommentSubmit} className="flex items-center space-x-3 mt-3">
              <img
                className="h-8 w-8 rounded-full object-cover"
                src={user.profileImage || "https://i.pravatar.cc/300"}
                alt="Current user avatar"
              />
              <div className="flex-1 relative">
                <Input
                  type="text"
                  className="w-full px-4 py-2 bg-muted rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={commentMutation.isPending}
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary disabled:text-accent"
                  disabled={!comment.trim() || commentMutation.isPending}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
