import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Story } from "@shared/schema";
import { useAuth } from "@/contexts/auth-context";
import { VerifiedBadge } from "@/components/ui/verified-badge";

interface StoryUser {
  id: number;
  username: string;
  displayName: string;
  profileImage: string;
  isVerified: boolean;
}

interface StoryGroup {
  user: StoryUser;
  stories: Story[];
}

export default function StoryCarousel() {
  const { user } = useAuth();
  
  // Fetch stories
  const { data: storyGroups, isLoading } = useQuery<StoryGroup[]>({
    queryKey: ["/api/stories"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-background rounded-xl shadow-sm p-4 mb-6">
        <h3 className="font-semibold text-foreground mb-4 pl-2">Trending Stories</h3>
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center space-y-2">
              <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="w-12 h-3 bg-gray-200 animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!storyGroups || storyGroups.length === 0) {
    // Show placeholder content when no stories are available
    const placeholderStories = [
      {
        id: 1,
        username: "djmax",
        displayName: "DJMax",
        profileImage: "https://images.unsplash.com/photo-1502872364588-894d7d6ddfab?auto=format&fit=crop&w=80&h=80",
      },
      {
        id: 2,
        username: "yogalife",
        displayName: "YogaLife",
        profileImage: "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?auto=format&fit=crop&w=80&h=80",
      },
      {
        id: 3,
        username: "chefmark",
        displayName: "ChefMark",
        profileImage: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=80&h=80",
      },
      {
        id: 4,
        username: "dancepro",
        displayName: "DancePro",
        profileImage: "https://images.unsplash.com/photo-1516575334481-f85287c2c82d?auto=format&fit=crop&w=80&h=80",
      },
      {
        id: 5,
        username: "writer",
        displayName: "Writer",
        profileImage: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?auto=format&fit=crop&w=80&h=80",
      },
    ];

    return (
      <div className="bg-white dark:bg-background rounded-xl shadow-sm p-4 mb-6">
        <h3 className="font-semibold text-foreground mb-4 pl-2">Trending Stories</h3>
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2">
          {placeholderStories.map((story) => (
            <div key={story.id} className="flex flex-col items-center space-y-2">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-secondary p-[2px]">
                <img
                  className="w-full h-full object-cover rounded-full border-2 border-white dark:border-background"
                  src={story.profileImage}
                  alt={story.displayName}
                />
              </div>
              <span className="text-xs text-foreground font-medium">{story.displayName}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-background rounded-xl shadow-sm p-4 mb-6">
      <h3 className="font-semibold text-foreground mb-4 pl-2">Trending Stories</h3>
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2">
        {storyGroups.map((storyGroup) => (
          <div key={storyGroup.user.id} className="flex flex-col items-center space-y-2">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-secondary p-[2px]">
              <img
                className="w-full h-full object-cover rounded-full border-2 border-white dark:border-background"
                src={storyGroup.user.profileImage}
                alt={storyGroup.user.displayName}
              />
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-foreground font-medium">{storyGroup.user.displayName}</span>
              {storyGroup.user.isVerified && <VerifiedBadge size="xs" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
