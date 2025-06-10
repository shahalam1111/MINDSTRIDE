
// src/lib/community-data.ts
import type { LucideIcon } from 'lucide-react';
import { Users, MessageSquareText, LayoutGrid, HeartHandshake, CloudDrizzle, CloudRain, Briefcase, Link2 } from 'lucide-react';

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  postCount?: number; // Optional: to be calculated or fetched
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  categoryName: string;
  author: string; // "Username" or "Anonymous"
  authorId?: string; // Optional: for future linking to user profiles
  timestamp: string; // ISO string
  votes: number;
  commentsCount: number;
  tags: string[];
  isUserPost?: boolean; // Flag for posts created by the current user (for styling/localStorage)
}

export interface ForumComment {
  id:string;
  postId: string;
  author: string;
  authorId?: string;
  content: string;
  timestamp: string; // ISO string
  votes: number;
  isUserComment?: boolean;
}

export const placeholderCategories: ForumCategory[] = [
  { id: 'general', name: 'General Support', description: 'A place for general discussions and support.', icon: HeartHandshake, postCount: 10 },
  { id: 'anxiety', name: 'Anxiety', description: 'Discuss anxiety, coping mechanisms, and share experiences.', icon: CloudDrizzle, postCount: 15 },
  { id: 'depression', name: 'Depression', description: 'Support and discussions related to depression.', icon: CloudRain, postCount: 12 },
  { id: 'work-stress', name: 'Work Stress', description: 'Share and get advice on managing work-related stress.', icon: Briefcase, postCount: 8 },
  { id: 'relationships', name: 'Relationships', description: 'Discussions about personal and professional relationships.', icon: Link2, postCount: 7 },
];

export const placeholderPosts: ForumPost[] = [
  {
    id: 'static-post1',
    title: 'Feeling overwhelmed this week, any tips?',
    content: 'Lately, I\'ve been feeling completely swamped with work and personal commitments. It feels like I\'m drowning and can\'t catch a break. Does anyone have any practical tips for managing overwhelming feelings? What works for you?\n\nI\'ve tried a few things like making lists, but even that feels daunting right now. Any simple, actionable advice would be amazing. Thanks in advance for your support!',
    categoryId: 'general',
    categoryName: 'General Support',
    author: 'User123',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    votes: 15,
    commentsCount: 2,
    tags: ['overwhelm', 'stress', 'coping'],
  },
  {
    id: 'static-post2',
    title: 'Struggling with social anxiety at new job',
    content: 'I just started a new job and my social anxiety is through the roof. I find it hard to speak up in meetings or even make small talk with colleagues. Has anyone else experienced this? How did you cope?\n\nThe company culture seems nice, but I\'m worried I\'m coming across as rude or uninterested because I\'m so quiet. I really want to make a good impression.',
    categoryId: 'anxiety',
    categoryName: 'Anxiety',
    author: 'Anonymous',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    votes: 22,
    commentsCount: 1,
    tags: ['social anxiety', 'new job', 'workplace'],
  },
  {
    id: 'static-post3',
    title: 'Finding motivation when feeling low',
    content: 'Some days it\'s just so hard to find any motivation to do anything, even things I usually enjoy. It\'s like a heavy blanket. How do you all find that spark or push through when depression makes motivation disappear?\n\nI know I should exercise or reach out to friends, but the thought itself is exhausting.',
    categoryId: 'depression',
    categoryName: 'Depression',
    author: 'HopeSeeker',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    votes: 30,
    commentsCount: 0,
    tags: ['motivation', 'depression', 'self-help'],
  },
   {
    id: 'static-post4',
    title: 'Tips for better sleep hygiene?',
    content: 'I\'ve been having trouble sleeping lately. I either can\'t fall asleep or wake up multiple times during the night. Does anyone have good tips for improving sleep hygiene? I\'m trying to avoid screens before bed but it\'s hard!',
    categoryId: 'general',
    categoryName: 'General Support',
    author: 'SleepyHead',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    votes: 18,
    commentsCount: 0,
    tags: ['sleep', 'insomnia', 'wellness'],
  },
];

export const placeholderComments: ForumComment[] = [
  { id: 'static-comment1', postId: 'static-post1', author: 'HelpfulHannah', content: 'Deep breathing exercises really help me when I feel overwhelmed. Try the 4-7-8 technique!', timestamp: new Date(Date.now() - 0.5 * 60 * 60 * 1000).toISOString(), votes: 5 },
  { id: 'static-comment2', postId: 'static-post1', author: 'User123', content: 'Thanks @HelpfulHannah, I\'ll give that a try!', timestamp: new Date(Date.now() - 0.4 * 60 * 60 * 1000).toISOString(), votes: 2 },
  { id: 'static-comment3', postId: 'static-post2', author: 'BraveHeart', content: 'Starting small helped me. Maybe try talking to one colleague you feel most comfortable with first.', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), votes: 7 },
];

export const USER_POSTS_KEY = 'mindstrideUserForumPosts';
export const USER_COMMENTS_KEY_PREFIX = 'mindstrideUserForumComments_'; //postId will be appended
