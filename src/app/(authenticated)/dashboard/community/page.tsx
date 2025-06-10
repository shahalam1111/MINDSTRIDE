
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { MessageSquareText, Users, ThumbsUp, MessageCircle as MessageCircleIcon, Edit3, TrendingUp, LayoutGrid, Search } from 'lucide-react';
import { placeholderCategories, placeholderPosts, type ForumCategory, type ForumPost, USER_POSTS_KEY } from '@/lib/community-data';

export default function CommunityForumPage() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const userPostsString = localStorage.getItem(USER_POSTS_KEY);
    const userPosts: ForumPost[] = userPostsString ? JSON.parse(userPostsString) : [];
    const allPosts = [...userPosts.map(p => ({...p, isUserPost: true})), ...placeholderPosts]
      .sort((a, b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime());
    setPosts(allPosts);
  }, []);

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
    post.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <Card className="shadow-lg border-none bg-gradient-to-r from-primary/10 to-accent/10">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-headline flex items-center gap-2">
                <Users className="h-8 w-8 text-primary" /> Community Forum
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground mt-1">
                Connect, share, and find support with fellow members.
              </CardDescription>
            </div>
            <Button asChild size="lg">
              <Link href="/dashboard/community/new-post">
                <Edit3 className="mr-2 h-5 w-5" /> Create New Post
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content area for posts */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                 <Search className="h-5 w-5 text-primary" /> Search Posts
              </CardTitle>
              <Input 
                type="search"
                placeholder="Search by title, content, tag, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mt-2"
              />
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <MessageSquareText className="h-6 w-6 text-primary" /> Recent Discussions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredPosts.length > 0 ? (
                <ScrollArea className="h-[60vh] pr-3">
                  <div className="space-y-4">
                    {filteredPosts.map(post => (
                      <Link key={post.id} href={`/dashboard/community/post/${post.id}`} className="block hover:no-underline">
                        <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer">
                          <CardHeader>
                            <CardTitle className="text-lg hover:text-primary transition-colors">{post.title}</CardTitle>
                            <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                              <span>Posted by <span className="font-medium text-foreground">{post.author}</span></span>
                              <span>in <Badge variant="secondary">{post.categoryName}</Badge></span>
                              <span>{formatDistanceToNow(parseISO(post.timestamp), { addSuffix: true })}</span>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
                            <div className="mt-2 flex gap-1 flex-wrap">
                                {post.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                            </div>
                          </CardContent>
                          <CardFooter className="text-xs text-muted-foreground flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3.5 w-3.5" /> {post.votes} Votes
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircleIcon className="h-3.5 w-3.5" /> {post.commentsCount} Comments
                            </div>
                          </CardFooter>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-muted-foreground text-center py-8">No posts found matching your criteria. Try a different search or create a new post!</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar for categories and trending */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2"><LayoutGrid className="h-6 w-6 text-primary"/>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {placeholderCategories.map(category => (
                  <li key={category.id}>
                    <Link href={`/dashboard/community/category/${category.id}`}>
                      <Button variant="ghost" className="w-full justify-start gap-2 hover:bg-muted">
                        <category.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary"/>
                        {category.name} 
                        <Badge variant="outline" className="ml-auto">{category.postCount || 0}</Badge>
                      </Button>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2"><TrendingUp className="h-6 w-6 text-primary"/>Trending (Placeholder)</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-primary transition-colors"><Link href="#">Understanding panic attacks</Link></li>
                <li className="hover:text-primary transition-colors"><Link href="#">Tips for managing holiday stress</Link></li>
                <li className="hover:text-primary transition-colors"><Link href="#">Building healthy morning routines</Link></li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
