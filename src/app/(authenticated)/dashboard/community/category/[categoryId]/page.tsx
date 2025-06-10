
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ArrowLeft, ThumbsUp, MessageCircle as MessageCircleIcon } from 'lucide-react';
import { placeholderCategories, placeholderPosts, type ForumCategory, type ForumPost, USER_POSTS_KEY } from '@/lib/community-data';

export default function CategoryViewPage() {
  const params = useParams();
  const categoryId = params.categoryId as string;

  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (categoryId) {
      setIsLoading(true);
      const foundCategory = placeholderCategories.find(cat => cat.id === categoryId);
      setCategory(foundCategory || null);

      const userPostsString = localStorage.getItem(USER_POSTS_KEY);
      const userPosts: ForumPost[] = userPostsString ? JSON.parse(userPostsString) : [];
      
      const allPosts = [...userPosts.map(p => ({...p, isUserPost: true})), ...placeholderPosts];
      const categoryPosts = allPosts
        .filter(post => post.categoryId === categoryId)
        .sort((a, b) => parseISO(b.timestamp).getTime() - parseISO(a.timestamp).getTime());
      
      setPosts(categoryPosts);
      setIsLoading(false);
    }
  }, [categoryId]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading category posts...</div>;
  }

  if (!category) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground mb-4">Category not found.</p>
         <Button variant="outline" asChild>
          <Link href="/dashboard/community"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Forum</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-3xl font-headline flex items-center gap-2">
            <category.icon className="h-8 w-8 text-primary" /> {category.name}
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground mt-1">
            {category.description}
          </CardDescription>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/community">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Categories
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Posts in {category.name}</CardTitle>
        </CardHeader>
        <CardContent>
          {posts.length > 0 ? (
            <ScrollArea className="h-[60vh] pr-3">
              <div className="space-y-4">
                {posts.map(post => (
                  <Link key={post.id} href={`/dashboard/community/post/${post.id}`} className="block hover:no-underline">
                    <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg hover:text-primary transition-colors">{post.title}</CardTitle>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                          <span>Posted by <span className="font-medium text-foreground">{post.author}</span></span>
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
            <p className="text-muted-foreground text-center py-8">No posts in this category yet. Why not <Link href="/dashboard/community/new-post" className="text-primary underline hover:text-primary/80">create one</Link>?</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

