import { useState } from "react";
import { X, Image, Video, Lock, Tag, Upload } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { usePost } from "@/contexts/post-context";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export default function CreatePostModal() {
  const { user } = useAuth();
  const { showCreatePostModal, setShowCreatePostModal } = usePost();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  
  // Post creation mutation
  const createPostMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error("You must be logged in to create a post");
      }
      
      // Create post payload
      const postData = {
        content,
        isPremium,
        imageUrl: imagePreview, // In a real implementation, we would upload the image to a CDN
      };
      
      return apiRequest("POST", "/api/posts", postData);
    },
    onSuccess: () => {
      // Clear form
      setContent("");
      setImage(null);
      setImagePreview(null);
      setIsPremium(false);
      setTags([]);
      setTagInput("");
      
      // Close modal
      setShowCreatePostModal(false);
      
      // Invalidate posts query to refresh feed
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      
      toast({
        title: "Success!",
        description: "Your post has been created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create post",
        variant: "destructive",
      });
    },
  });
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setImage(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle tag addition
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };
  
  // Handle tag removal
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      createPostMutation.mutate();
    }
  };
  
  return (
    <Dialog open={showCreatePostModal} onOpenChange={setShowCreatePostModal}>
      <DialogContent className="bg-white dark:bg-background max-w-xl w-full mx-4 overflow-hidden">
        <DialogHeader>
          <div className="flex justify-between items-center border-b border-border p-4">
            <DialogTitle className="font-semibold text-lg text-foreground">Create New Post</DialogTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowCreatePostModal(false)}
              className="text-accent hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex items-start space-x-3 mb-4">
            <img
              className="h-10 w-10 rounded-full object-cover"
              src={user?.profileImage || "https://i.pravatar.cc/300"}
              alt="User avatar"
            />
            <div className="flex-1">
              <textarea
                className="w-full border-none focus:ring-0 resize-none text-foreground bg-transparent"
                rows={5}
                placeholder="What would you like to share?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              ></textarea>
            </div>
          </div>
          
          {imagePreview ? (
            <div className="relative mb-4">
              <img
                src={imagePreview}
                alt="Upload preview"
                className="w-full h-auto max-h-60 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <label className="border border-dashed border-accent rounded-lg p-8 text-center mb-4 cursor-pointer block">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="text-accent">
                <Upload className="mx-auto h-8 w-8 mb-2" />
                <p className="font-medium">Drop your image or video here</p>
                <p className="text-sm mt-1">or click to browse from your device</p>
              </div>
            </label>
          )}
          
          <div className="flex flex-wrap gap-3 mb-4">
            {tags.map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary"
                className="bg-muted text-accent px-3 py-1 rounded-full text-sm"
              >
                #{tag}
                <button
                  type="button"
                  className="ml-2"
                  onClick={() => handleRemoveTag(tag)}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <input
              type="text"
              className="bg-muted text-accent px-3 py-1 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Add a tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
          </div>
          
          <div className="flex justify-between border-t border-border pt-4">
            <div className="flex space-x-3">
              <button 
                type="button"
                className="text-accent hover:text-primary"
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <Image className="h-5 w-5" />
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </button>
              <button 
                type="button"
                className="text-accent hover:text-primary"
                disabled // Video upload not implemented in this MVP
              >
                <Video className="h-5 w-5" />
              </button>
              <button 
                type="button"
                className={`${isPremium ? "text-primary" : "text-accent hover:text-primary"}`}
                onClick={() => setIsPremium(!isPremium)}
              >
                <Lock className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="text-accent hover:text-primary"
                onClick={() => document.getElementById("tag-input")?.focus()}
              >
                <Tag className="h-5 w-5" />
              </button>
            </div>
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                className="bg-white dark:bg-background border border-accent text-accent hover:bg-muted"
              >
                Save Draft
              </Button>
              <Button
                type="submit"
                className="bg-primary hover:bg-primary/80 text-white"
                disabled={!content.trim() || createPostMutation.isPending}
              >
                {createPostMutation.isPending ? "Posting..." : "Post Now"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
