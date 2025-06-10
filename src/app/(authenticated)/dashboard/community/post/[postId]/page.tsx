
"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label'; // Changed from FormLabel
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ArrowLeft, ThumbsUp, ThumbsDown, MessageCircle, SmilePlus, Heart, Flag, Send } from 'lucide-react';
import { placeholderPosts, placeholderComments, type ForumPost, type ForumComment, USER_POSTS_KEY, USER_COMMENTS_KEY_PREFIX } from '@/lib/community-data';

export default function PostViewPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const postId = params.postId as string;

  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
     const email = localStorage.getItem('wellspringUserEmail'); // Keep this key as is
     setUserEmail(email);
  }, []);

  useEffect(() => {
    if (postId) {
      setIsLoading(true);
      // Simulate fetching post and comments
      const userPostsString = localStorage.getItem(USER_POSTS_KEY);
      const userPosts: ForumPost[] = userPostsString ? JSON.parse(userPostsString) : [];
      const allPosts = [...userPosts, ...placeholderPosts];
      const foundPost = allPosts.find(p => p.id === postId);
      
      if (foundPost) {
        setPost(foundPost);
        
        const userCommentsKey = `${USER_COMMENTS_KEY_PREFIX}${postId}`;
        const userCommentsString = localStorage.getItem(userCommentsKey);
        const userComments: ForumComment[] = userCommentsString ? JSON.parse(userCommentsString) : [];
        
        const allComments = [
            ...userComments.map(c=> ({...c, isUserComment: true})), 
            ...placeholderComments.filter(c => c.postId === postId)
        ].sort((a, b) => parseISO(a.timestamp).getTime() - parseISO(b.timestamp).getTime());
        setComments(allComments);

      } else {
        toast({ title: "Post not found", variant: "destructive" });
        // router.push('/dashboard/community');
      }
      setIsLoading(false);
    }
  }, [postId, toast, router]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !post) return;

    const commentToAdd: ForumComment = {
      id: `usercomment-${Date.now()}`,
      postId: post.id,
      author: userEmail?.split('@')[0] || 'User', // Or allow anonymous comments
      content: newComment.trim(),
      timestamp: new Date().toISOString(),
      votes: 0,
      isUserComment: true,
    };

    const updatedComments = [...comments, commentToAdd];
    setComments(updatedComments);
    
    // Save user-specific comments to localStorage
    const userCommentsKey = `${USER_COMMENTS_KEY_PREFIX}${post.id}`;
    const existingUserCommentsString = localStorage.getItem(userCommentsKey);
    const existingUserComments: ForumComment[] = existingUserCommentsString ? JSON.parse(existingUserCommentsString) : [];
    existingUserComments.push(commentToAdd);
    localStorage.setItem(userCommentsKey, JSON.stringify(existingUserComments));

    setNewComment('');
    toast({ title: "Comment added!" });
    
    // Update comment count on the post object (if it's a user post)
    const userPostsString = localStorage.getItem(USER_POSTS_KEY);
    if (userPostsString && post.isUserPost) {
        let userPosts: ForumPost[] = JSON.parse(userPostsString);
        userPosts = userPosts.map(p => p.id === post.id ? {...p, commentsCount: p.commentsCount + 1} : p);
        localStorage.setItem(USER_POSTS_KEY, JSON.stringify(userPosts));
        setPost(prev => prev ? {...prev, commentsCount: prev.commentsCount +1} : null);
    }
  };
  
  // Placeholder for voting actions
  const handleVote = (type: 'upvote' | 'downvote') => {
    toast({ title: `Vote action (${type}) simulated.`, description: "This would update backend in a real app."});
    if(post) {
        const change = type === 'upvote' ? 1 : -1;
        setPost(prev => prev ? {...prev, votes: prev.votes + change } : null);
         // Update vote count on the post object (if it's a user post)
        const userPostsString = localStorage.getItem(USER_POSTS_KEY);
        if (userPostsString && post.isUserPost) {
            let userPosts: ForumPost[] = JSON.parse(userPostsString);
            userPosts = userPosts.map(p => p.id === post.id ? {...p, votes: p.votes + change} : p);
            localStorage.setItem(USER_POSTS_KEY, JSON.stringify(userPosts));
        }
    }
  };

  const handleReaction = (reaction: string) => {
    toast({ title: `Reacted with ${reaction}!`, description: "Reaction simulated."});
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading post...</div>;
  }

  if (!post) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground mb-4">Post not found.</p>
        <Button variant="outline" asChild>
          <Link href="/dashboard/community"><ArrowLeft className="mr-2 h-4 w-4"/>Back to Forum</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild>
        <Link href="/dashboard/community">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Forum
        </Link>
      </Button>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-headline">{post.title}</CardTitle>
          <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap mt-1">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://placehold.co/40x40.png?text=${post.author.charAt(0)}`} alt={post.author} data-ai-hint="person initial letter"/>
              <AvatarFallback>{post.author.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span>Posted by <span className="font-medium text-foreground">{post.author}</span></span>
            <span>in <Badge variant="secondary" asChild><Link href={`/dashboard/community/category/${post.categoryId}`}>{post.categoryName}</Link></Badge></span>
            <span>{formatDistanceToNow(parseISO(post.timestamp), { addSuffix: true })}</span>
          </div>
          <div className="mt-2 flex gap-1 flex-wrap">
            {post.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm sm:prose-base max-w-none text-foreground whitespace-pre-line">
            {post.content}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => handleVote('upvote')}>
              <ThumbsUp className="mr-1.5 h-4 w-4" /> ({post.votes})
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleVote('downvote')}>
              <ThumbsDown className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6"/>
            <Button variant="ghost" size="sm" onClick={() => handleReaction('❤️')}>❤️</Button>
            <Button variant="ghost" size="sm" onClick={() => handleReaction('🤗')}>🤗</Button>
            <Button variant="ghost" size="sm" onClick={() => handleReaction('👍')}>👍</Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => toast({title: "Report action simulated."})}>
            <Flag className="mr-1.5 h-4 w-4" /> Report Post
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary"/> Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {comments.length > 0 ? (
            comments.map(comment => (
              <div key={comment.id} className={`p-3 rounded-md ${comment.isUserComment ? 'bg-primary/10 border-primary/30' : 'bg-muted/50 border-muted/30'} border`}>
                <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
                   <Avatar className="h-6 w-6">
                    <AvatarImage src={`https://placehold.co/40x40.png?text=${comment.author.charAt(0)}`} alt={comment.author} data-ai-hint="person initial letter"/>
                    <AvatarFallback>{comment.author.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">{comment.author}</span>
                  <span>&bull;</span>
                  <span>{formatDistanceToNow(parseISO(comment.timestamp), { addSuffix: true })}</span>
                </div>
                <p className="text-sm text-foreground whitespace-pre-line">{comment.content}</p>
                <div className="mt-1 flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toast({title:"Vote simulated"})}>
                        <ThumbsUp className="h-3 w-3"/>
                    </Button>
                    <span className="text-xs text-muted-foreground">{comment.votes}</span>
                     <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toast({title:"Vote simulated"})}>
                        <ThumbsDown className="h-3 w-3"/>
                    </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No comments yet. Be the first to share your thoughts!</p>
          )}
          <Separator className="my-6"/>
          <form onSubmit={handleCommentSubmit} className="space-y-3">
            <Label htmlFor="new-comment" className="text-md font-semibold">Add Your Comment</Label>
            <Textarea
              id="new-comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write your comment here..."
              rows={4}
              className="text-sm"
              required
            />
            <Button type="submit" disabled={!newComment.trim()}>
              <Send className="mr-2 h-4 w-4"/> Post Comment
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

