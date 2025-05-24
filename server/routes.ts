import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import { z } from "zod";
import {
  insertUserSchema,
  insertPostSchema,
  insertFollowSchema,
  insertCommentSchema,
  insertLikeSchema,
  insertMessageSchema,
  insertStorySchema,
  loginSchema,
} from "@shared/schema";
import MemoryStore from "memorystore";

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "adultconnect-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 86400000 }, // 24h
      store: new SessionStore({
        checkPeriod: 86400000, // 24h
      }),
    })
  );

  // Auth middleware
  const authenticated = (req: Request, res: Response, next: Function) => {
    if (req.session && req.session.userId) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const user = await storage.createUser(userData);
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(credentials.username);
      if (!user || user.password !== credentials.password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Set session
      req.session.userId = user.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", authenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId as number);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // User routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.listUsers();
      
      // Return users without passwords
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.status(200).json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Post routes
  app.post("/api/posts", authenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const postData = insertPostSchema.parse({ ...req.body, userId });
      
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/posts", authenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const posts = await storage.getFeedPosts(userId);
      
      // Get user info for each post
      const postsWithUserInfo = await Promise.all(
        posts.map(async (post) => {
          const user = await storage.getUser(post.userId);
          const comments = await storage.getCommentsByPost(post.id);
          const likes = await storage.getLikesByPost(post.id);
          const isLiked = await storage.isLiked(userId, post.id);
          
          // Get user info for each comment
          const commentsWithUserInfo = await Promise.all(
            comments.map(async (comment) => {
              const commentUser = await storage.getUser(comment.userId);
              return {
                ...comment,
                user: commentUser ? { 
                  id: commentUser.id,
                  username: commentUser.username,
                  displayName: commentUser.displayName,
                  profileImage: commentUser.profileImage,
                  isVerified: commentUser.isVerified
                } : null,
              };
            })
          );
          
          return {
            ...post,
            user: user ? { 
              id: user.id,
              username: user.username,
              displayName: user.displayName,
              profileImage: user.profileImage,
              isVerified: user.isVerified
            } : null,
            comments: commentsWithUserInfo,
            likesCount: likes.length,
            isLiked,
          };
        })
      );
      
      res.status(200).json(postsWithUserInfo);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/users/:id/posts", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const posts = await storage.getPostsByUser(userId);
      
      // Determine if authenticated and if so, check if posts are liked
      const currentUserId = req.session.userId as number | undefined;
      
      // Get user info
      const user = await storage.getUser(userId);
      
      // Get likes and comments for each post
      const postsWithDetails = await Promise.all(
        posts.map(async (post) => {
          const comments = await storage.getCommentsByPost(post.id);
          const likes = await storage.getLikesByPost(post.id);
          const isLiked = currentUserId ? await storage.isLiked(currentUserId, post.id) : false;
          
          return {
            ...post,
            commentsCount: comments.length,
            likesCount: likes.length,
            isLiked,
          };
        })
      );
      
      res.status(200).json({
        user: user ? { 
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          profileImage: user.profileImage,
          bio: user.bio,
          isVerified: user.isVerified,
          isCreator: user.isCreator,
        } : null,
        posts: postsWithDetails,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Comment routes
  app.post("/api/posts/:id/comments", authenticated, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.session.userId as number;
      
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const commentData = insertCommentSchema.parse({
        ...req.body,
        postId,
        userId,
      });
      
      const comment = await storage.createComment(commentData);
      
      // Get user info
      const user = await storage.getUser(userId);
      
      res.status(201).json({
        ...comment,
        user: user ? { 
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          profileImage: user.profileImage,
          isVerified: user.isVerified
        } : null,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Like routes
  app.post("/api/posts/:id/like", authenticated, async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.session.userId as number;
      
      const post = await storage.getPost(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if already liked
      const isLiked = await storage.isLiked(userId, postId);
      
      if (isLiked) {
        await storage.deleteLike(userId, postId);
        res.status(200).json({ liked: false });
      } else {
        const likeData = insertLikeSchema.parse({
          postId,
          userId,
        });
        
        await storage.createLike(likeData);
        res.status(201).json({ liked: true });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Follow routes
  app.post("/api/users/:id/follow", authenticated, async (req, res) => {
    try {
      const followedId = parseInt(req.params.id);
      const followerId = req.session.userId as number;
      
      // Cannot follow yourself
      if (followerId === followedId) {
        return res.status(400).json({ message: "Cannot follow yourself" });
      }
      
      const followedUser = await storage.getUser(followedId);
      if (!followedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if already following
      const isFollowing = await storage.isFollowing(followerId, followedId);
      
      if (isFollowing) {
        await storage.deleteFollow(followerId, followedId);
        res.status(200).json({ following: false });
      } else {
        const followData = insertFollowSchema.parse({
          followerId,
          followedId,
          isSubscribed: false, // Default to not subscribed
        });
        
        await storage.createFollow(followData);
        res.status(201).json({ following: true });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/users/:id/subscribe", authenticated, async (req, res) => {
    try {
      const creatorId = parseInt(req.params.id);
      const subscriberId = req.session.userId as number;
      
      // Cannot subscribe to yourself
      if (subscriberId === creatorId) {
        return res.status(400).json({ message: "Cannot subscribe to yourself" });
      }
      
      const creator = await storage.getUser(creatorId);
      if (!creator || !creator.isCreator) {
        return res.status(404).json({ message: "Creator not found" });
      }
      
      // Check if already following
      const isFollowing = await storage.isFollowing(subscriberId, creatorId);
      
      if (isFollowing) {
        // Already following, update to subscribed
        await storage.deleteFollow(subscriberId, creatorId);
        const followData = insertFollowSchema.parse({
          followerId: subscriberId,
          followedId: creatorId,
          isSubscribed: true,
        });
        
        await storage.createFollow(followData);
        res.status(200).json({ subscribed: true });
      } else {
        // Not following, create new follow with subscription
        const followData = insertFollowSchema.parse({
          followerId: subscriberId,
          followedId: creatorId,
          isSubscribed: true,
        });
        
        await storage.createFollow(followData);
        res.status(201).json({ subscribed: true });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Message routes
  app.post("/api/messages", authenticated, async (req, res) => {
    try {
      const senderId = req.session.userId as number;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId,
      });
      
      // Check if receiver exists
      const receiver = await storage.getUser(messageData.receiverId);
      if (!receiver) {
        return res.status(404).json({ message: "Receiver not found" });
      }
      
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/messages", authenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const messages = await storage.getMessagesByUser(userId);
      
      // Group messages by conversation partner
      const conversationsMap = new Map();
      
      for (const message of messages) {
        const partnerId = message.senderId === userId ? message.receiverId : message.senderId;
        
        if (!conversationsMap.has(partnerId)) {
          const partner = await storage.getUser(partnerId);
          
          conversationsMap.set(partnerId, {
            partner: partner ? {
              id: partner.id,
              username: partner.username,
              displayName: partner.displayName,
              profileImage: partner.profileImage,
              isVerified: partner.isVerified,
              isOnline: Math.random() > 0.5, // Random online status for demo
            } : null,
            lastMessage: message,
            unreadCount: message.senderId !== userId && !message.isRead ? 1 : 0,
          });
        } else {
          const conversation = conversationsMap.get(partnerId);
          
          // Update last message if this one is newer
          if (message.createdAt > conversation.lastMessage.createdAt) {
            conversation.lastMessage = message;
          }
          
          // Count unread messages
          if (message.senderId !== userId && !message.isRead) {
            conversation.unreadCount += 1;
          }
        }
      }
      
      // Convert map to array and sort by last message time
      const conversations = Array.from(conversationsMap.values())
        .sort((a, b) => b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime());
      
      res.status(200).json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/messages/:userId", authenticated, async (req, res) => {
    try {
      const currentUserId = req.session.userId as number;
      const partnerId = parseInt(req.params.userId);
      
      const partner = await storage.getUser(partnerId);
      if (!partner) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const conversation = await storage.getConversation(currentUserId, partnerId);
      
      // Mark messages as read
      for (const message of conversation) {
        if (message.receiverId === currentUserId && !message.isRead) {
          await storage.markMessageAsRead(message.id);
        }
      }
      
      res.status(200).json({
        partner: {
          id: partner.id,
          username: partner.username,
          displayName: partner.displayName,
          profileImage: partner.profileImage,
          isVerified: partner.isVerified,
          isOnline: Math.random() > 0.5, // Random online status for demo
        },
        messages: conversation,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Story routes
  app.post("/api/stories", authenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const storyData = insertStorySchema.parse({
        ...req.body,
        userId,
      });
      
      const story = await storage.createStory(storyData);
      res.status(201).json(story);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/stories", authenticated, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const stories = await storage.getFeedStories(userId);
      
      // Group stories by user
      const storiesByUser = new Map();
      
      for (const story of stories) {
        if (!storiesByUser.has(story.userId)) {
          const user = await storage.getUser(story.userId);
          
          storiesByUser.set(story.userId, {
            user: user ? {
              id: user.id,
              username: user.username,
              displayName: user.displayName,
              profileImage: user.profileImage,
              isVerified: user.isVerified,
            } : null,
            stories: [story],
          });
        } else {
          storiesByUser.get(story.userId).stories.push(story);
        }
      }
      
      // Convert map to array
      const groupedStories = Array.from(storiesByUser.values());
      
      res.status(200).json(groupedStories);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
