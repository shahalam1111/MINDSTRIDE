
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Info } from 'lucide-react';
import { placeholderCategories, type ForumPost, USER_POSTS_KEY } from '@/lib/community-data';

const newPostSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters.").max(150, "Title must be 150 characters or less."),
  content: z.string().min(20, "Content must be at least 20 characters.").max(5000, "Content must be 5000 characters or less."),
  categoryId: z.string().min(1, "Please select a category."),
  tags: z.string().optional(), // Comma-separated
  isAnonymous: z.boolean().default(false),
});

type NewPostFormValues = z.infer<typeof newPostSchema>;

export default function NewPostPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useState(() => {
     const email = localStorage.getItem('wellspringUserEmail'); // Keep this key as is
     setUserEmail(email);
  });

  const form = useForm<NewPostFormValues>({
    resolver: zodResolver(newPostSchema),
    defaultValues: {
      title: '',
      content: '',
      categoryId: '',
      tags: '',
      isAnonymous: false,
    },
  });

  const onSubmit = (data: NewPostFormValues) => {
    const selectedCategory = placeholderCategories.find(cat => cat.id === data.categoryId);
    if (!selectedCategory) {
      toast({ title: "Error", description: "Invalid category selected.", variant: "destructive" });
      return;
    }

    const newPost: ForumPost = {
      id: `user-${Date.now().toString()}`, // Simple unique ID for prototype
      title: data.title,
      content: data.content,
      categoryId: data.categoryId,
      categoryName: selectedCategory.name,
      author: data.isAnonymous ? 'Anonymous' : (userEmail?.split('@')[0] || 'User'),
      timestamp: new Date().toISOString(),
      votes: 0,
      commentsCount: 0,
      tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      isUserPost: true,
    };

    try {
      const existingPostsString = localStorage.getItem(USER_POSTS_KEY);
      const existingPosts: ForumPost[] = existingPostsString ? JSON.parse(existingPostsString) : [];
      existingPosts.unshift(newPost); // Add to the beginning
      localStorage.setItem(USER_POSTS_KEY, JSON.stringify(existingPosts));

      toast({
        title: "Post Created!",
        description: "Your post has been successfully submitted.",
      });
      router.push(`/dashboard/community/post/${newPost.id}`);
    } catch (error) {
      console.error("Failed to save post:", error);
      toast({
        title: "Error",
        description: "Failed to save your post. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
       <Button variant="outline" asChild>
          <Link href="/dashboard/community">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Forum
          </Link>
        </Button>
      <Card className="w-full max-w-3xl mx-auto shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Create New Post</CardTitle>
          <CardDescription>Share your thoughts, ask questions, or offer support to the community.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-accent/50 border border-accent rounded-lg text-sm text-accent-foreground">
            <h4 className="font-semibold mb-1 flex items-center gap-1"><Info className="h-4 w-4"/>Community Guidelines (Placeholder)</h4>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Be respectful and kind to others.</li>
              <li>No hate speech, bullying, or harassment.</li>
              <li>Keep discussions relevant to mental wellness.</li>
              <li>Do not share identifiable personal information excessively.</li>
              <li>This is not a substitute for professional medical advice.</li>
            </ul>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Post Title</FormLabel>
                    <FormControl><Input placeholder="Enter a clear and concise title" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Content</FormLabel>
                    <FormControl><Textarea placeholder="Share your thoughts in detail..." {...field} rows={10} /></FormControl>
                    <FormDescription>You can use plain text. Rich text formatting will be available in the future.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {placeholderCategories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., stress, coping, mindfulness" {...field} /></FormControl>
                    <FormDescription>Comma-separated tags to help others find your post.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isAnonymous"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Post Anonymously</FormLabel>
                      <FormDescription>
                        If checked, your username will not be displayed with this post.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Submitting Post..." : "Submit Post"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
