import { 
  users, User, InsertUser, 
  posts, Post, InsertPost,
  follows, Follow, InsertFollow,
  comments, Comment, InsertComment,
  likes, Like, InsertLike,
  messages, Message, InsertMessage,
  stories, Story, InsertStory
} from "@shared/schema";
import { hashPassword } from "./auth";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listUsers(): Promise<User[]>;
  
  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPost(id: number): Promise<Post | undefined>;
  listPosts(): Promise<Post[]>;
  getPostsByUser(userId: number): Promise<Post[]>;
  getFeedPosts(userId: number): Promise<Post[]>;
  
  // Follow operations
  createFollow(follow: InsertFollow): Promise<Follow>;
  deleteFollow(followerId: number, followedId: number): Promise<void>;
  isFollowing(followerId: number, followedId: number): Promise<boolean>;
  getFollowersByUser(userId: number): Promise<Follow[]>;
  getFollowingByUser(userId: number): Promise<Follow[]>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPost(postId: number): Promise<Comment[]>;
  
  // Like operations
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(userId: number, postId: number): Promise<void>;
  getLikesByPost(postId: number): Promise<Like[]>;
  isLiked(userId: number, postId: number): Promise<boolean>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByUser(userId: number): Promise<Message[]>;
  getConversation(user1Id: number, user2Id: number): Promise<Message[]>;
  markMessageAsRead(messageId: number): Promise<void>;
  
  // Story operations
  createStory(story: InsertStory): Promise<Story>;
  getStoriesByUser(userId: number): Promise<Story[]>;
  getFeedStories(userId: number): Promise<Story[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private follows: Map<number, Follow>;
  private comments: Map<number, Comment>;
  private likes: Map<number, Like>;
  private messages: Map<number, Message>;
  private stories: Map<number, Story>;
  
  private userIdCounter: number;
  private postIdCounter: number;
  private followIdCounter: number;
  private commentIdCounter: number;
  private likeIdCounter: number;
  private messageIdCounter: number;
  private storyIdCounter: number;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.follows = new Map();
    this.comments = new Map();
    this.likes = new Map();
    this.messages = new Map();
    this.stories = new Map();
    
    this.userIdCounter = 1;
    this.postIdCounter = 1;
    this.followIdCounter = 1;
    this.commentIdCounter = 1;
    this.likeIdCounter = 1;
    this.messageIdCounter = 1;
    this.storyIdCounter = 1;
    
    // Seed some initial data (async operation)
    this.seedInitialData().catch(console.error);
  }

  private async seedInitialData() {
    // Create some initial users with hashed passwords
    const users = [
      {
        username: "jesslee",
        password: await hashPassword("password123"),
        displayName: "Jessica Lee",
        bio: "Professional photographer capturing moments of beauty and grace.",
        profileImage: "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=200&h=200",
        isCreator: true,
        isVerified: true,
      },
      {
        username: "miketrainer",
        password: "password123",
        displayName: "Mike Trainer",
        bio: "Fitness expert helping people transform their bodies and lives.",
        profileImage: "https://images.unsplash.com/photo-1590086782957-93c06ef21604?auto=format&fit=crop&w=200&h=200",
        isCreator: true,
        isVerified: true,
      },
      {
        username: "sophiaart",
        password: "password123",
        displayName: "Sophia Art",
        bio: "Visual artist sharing creative works and inspirations.",
        profileImage: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&h=200",
        isCreator: true,
        isVerified: true,
      },
      {
        username: "djmax",
        password: "password123",
        displayName: "DJ Max",
        bio: "Music producer and DJ, dropping new beats every week.",
        profileImage: "https://images.unsplash.com/photo-1502872364588-894d7d6ddfab?auto=format&fit=crop&w=200&h=200",
        isCreator: true,
        isVerified: true,
      },
      {
        username: "yogalife",
        password: "password123",
        displayName: "Yoga Life",
        bio: "Bringing mindfulness and wellness through yoga practice.",
        profileImage: "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?auto=format&fit=crop&w=200&h=200",
        isCreator: true,
        isVerified: true,
      },
      {
        username: "emilyp",
        password: "password123",
        displayName: "Emily Parker",
        bio: "Just a fan of great content.",
        profileImage: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?auto=format&fit=crop&w=200&h=200",
        isCreator: false,
        isVerified: false,
      },
    ];

    users.forEach(user => this.createUser(user as InsertUser));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { ...insertUser, id, createdAt: now };
    this.users.set(id, user);
    return user;
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Post operations
  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.postIdCounter++;
    const now = new Date();
    const post: Post = { ...insertPost, id, createdAt: now };
    this.posts.set(id, post);
    return post;
  }

  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async listPosts(): Promise<Post[]> {
    return Array.from(this.posts.values());
  }

  async getPostsByUser(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(
      (post) => post.userId === userId,
    );
  }

  async getFeedPosts(userId: number): Promise<Post[]> {
    // Get users that the current user follows
    const following = await this.getFollowingByUser(userId);
    const followingIds = following.map((follow) => follow.followedId);
    
    // Include user's own posts and posts from followed users
    return Array.from(this.posts.values())
      .filter((post) => post.userId === userId || followingIds.includes(post.userId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by newest first
  }

  // Follow operations
  async createFollow(insertFollow: InsertFollow): Promise<Follow> {
    const id = this.followIdCounter++;
    const now = new Date();
    const follow: Follow = { ...insertFollow, id, createdAt: now };
    this.follows.set(id, follow);
    return follow;
  }

  async deleteFollow(followerId: number, followedId: number): Promise<void> {
    const follow = Array.from(this.follows.values()).find(
      (f) => f.followerId === followerId && f.followedId === followedId,
    );
    
    if (follow) {
      this.follows.delete(follow.id);
    }
  }

  async isFollowing(followerId: number, followedId: number): Promise<boolean> {
    return Array.from(this.follows.values()).some(
      (follow) => follow.followerId === followerId && follow.followedId === followedId,
    );
  }

  async getFollowersByUser(userId: number): Promise<Follow[]> {
    return Array.from(this.follows.values()).filter(
      (follow) => follow.followedId === userId,
    );
  }

  async getFollowingByUser(userId: number): Promise<Follow[]> {
    return Array.from(this.follows.values()).filter(
      (follow) => follow.followerId === userId,
    );
  }

  // Comment operations
  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.commentIdCounter++;
    const now = new Date();
    const comment: Comment = { ...insertComment, id, createdAt: now };
    this.comments.set(id, comment);
    return comment;
  }

  async getCommentsByPost(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter((comment) => comment.postId === postId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by newest first
  }

  // Like operations
  async createLike(insertLike: InsertLike): Promise<Like> {
    // Check if already liked
    const existing = Array.from(this.likes.values()).find(
      (like) => like.postId === insertLike.postId && like.userId === insertLike.userId,
    );
    
    if (existing) {
      return existing;
    }
    
    const id = this.likeIdCounter++;
    const now = new Date();
    const like: Like = { ...insertLike, id, createdAt: now };
    this.likes.set(id, like);
    return like;
  }

  async deleteLike(userId: number, postId: number): Promise<void> {
    const like = Array.from(this.likes.values()).find(
      (like) => like.userId === userId && like.postId === postId,
    );
    
    if (like) {
      this.likes.delete(like.id);
    }
  }

  async getLikesByPost(postId: number): Promise<Like[]> {
    return Array.from(this.likes.values()).filter(
      (like) => like.postId === postId,
    );
  }

  async isLiked(userId: number, postId: number): Promise<boolean> {
    return Array.from(this.likes.values()).some(
      (like) => like.userId === userId && like.postId === postId,
    );
  }

  // Message operations
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const now = new Date();
    const message: Message = { ...insertMessage, id, createdAt: now };
    this.messages.set(id, message);
    return message;
  }

  async getMessagesByUser(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((message) => message.senderId === userId || message.receiverId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by newest first
  }

  async getConversation(user1Id: number, user2Id: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(
        (message) =>
          (message.senderId === user1Id && message.receiverId === user2Id) ||
          (message.senderId === user2Id && message.receiverId === user1Id),
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()); // Sort by oldest first
  }

  async markMessageAsRead(messageId: number): Promise<void> {
    const message = this.messages.get(messageId);
    if (message) {
      message.isRead = true;
      this.messages.set(messageId, message);
    }
  }

  // Story operations
  async createStory(insertStory: InsertStory): Promise<Story> {
    const id = this.storyIdCounter++;
    const now = new Date();
    const story: Story = { ...insertStory, id, createdAt: now };
    this.stories.set(id, story);
    return story;
  }

  async getStoriesByUser(userId: number): Promise<Story[]> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return Array.from(this.stories.values())
      .filter(
        (story) =>
          story.userId === userId && story.createdAt > twentyFourHoursAgo,
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by newest first
  }

  async getFeedStories(userId: number): Promise<Story[]> {
    // Get users that the current user follows
    const following = await this.getFollowingByUser(userId);
    const followingIds = following.map((follow) => follow.followedId);
    
    // Include user's own stories and stories from followed users
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return Array.from(this.stories.values())
      .filter(
        (story) =>
          (story.userId === userId || followingIds.includes(story.userId)) &&
          story.createdAt > twentyFourHoursAgo,
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by newest first
  }
}

export const storage = new MemStorage();
