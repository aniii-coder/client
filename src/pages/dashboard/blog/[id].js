// import { useGetBlogByIdQuery } from "@/features/blog-detail/api";
// import BlogDetail from "@/features/blog-detail/BlogDetail";
// import { mockBlogs } from "@/features/dashboard/utils";
// import { useRouter } from "next/router";
// import Head from "next/head";

// export default function BlogPage() {
//   const router = useRouter();
//   const { id: blog_id } = router.query;

//   const { data: response, isLoading, isError, error } = useGetBlogByIdQuery(blog_id, { 
//     skip: !blog_id 
//    });

//   if (isLoading) return <div>Loading blog...</div>;
//   if (isError) return <div>Error: {error?.data?.message || "Failed to load"}</div>;

//   const blog = response?.data;
//   const canonicalUrl =
//   blog?.canonical?.trim()
//     ? blog.canonical
//     : `${process.env.FRONTEND_URL}/blog/${blog?.slug}`;

//   // Map API fields neatly while preserving all original keys
//   const blogProps = blog ? {
//     ...blog, // Retains all existing keys like slug, seo, published, tags, etc.
//     id: blog._id, // Standardize ID property name if needed by components
//     author: blog.author || "Admin", 
//     authorInitials: blog.authorInitials || "AD",
//     date: blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'July 18, 2026',
    
//     // Convert array of user IDs to a count for UI display
//     likesCount: Array.isArray(blog.likes) ? blog.likes.length : (typeof blog.likes === 'number' ? blog.likes : 0),
    
//     // Map comments structure to match what UI expects
//     commentsFeed: (blog.comments || []).map(comment => ({
//       id: comment._id || Math.random().toString(),
//       author: comment?.userId?.name || 'Anonymous User',
//       avatar: comment.userId?.name[0] || 'U',
//       text: comment.message, // Map backend 'message' to frontend 'text'
//       date: comment.createdAt ? new Date(comment.createdAt).toLocaleRelativeTime?.() || new Date(comment.createdAt).toLocaleDateString() : 'Just now'
//     }))
//   } : null;

//   return (
//     <BlogDetail 
//       blogData={blogProps} 
//       relatedBlogs={mockBlogs.filter((b) => b.id !== blog_id && b._id !== blog_id)} 
//     />
//   );
// }



import Head from "next/head";
import { mockBlogs } from "@/features/dashboard/utils";
import BlogDetail from "@/features/blog-detail/BlogDetail";

export default function BlogPage({ blog }) {
  console.log('blog :>> ', blog);
  const canonicalUrl =
    blog?.seo?.canonical?.trim()
      ? blog.seo?.canonical
      : `${process.env.RONTEND_URL}/dashboard/blogs/${blog?.slug}`;

  const blogProps = {
    ...blog,
    id: blog?._id,
    author: blog?.author || "Admin",
    authorInitials: blog?.authorInitials || "AD",
    date: blog?.createdAt
      ? new Date(blog?.createdAt).toLocaleDateString()
      : "July 18, 2026",

    likesCount: Array.isArray(blog?.likes)
      ? blog?.likes.length
      : typeof blog?.likes === "number"
      ? blog?.likes
      : 0,

    commentsFeed: (blog?.comments || []).map((comment) => ({
      id: comment._id,
      author: comment?.userId?.name || "Anonymous User",
      avatar: comment?.userId?.name?.[0] || "U",
      text: comment.message,
      date: comment.createdAt
        ? new Date(comment.createdAt).toLocaleDateString()
        : "Just now",
    })),
  };

  return (
    <>
      <Head>
        <title>{blog?.seo?.seoTitle || blog?.seo?.title}</title>

        <meta
          name="description"
          content={blog?.seo?.seoDescription || blog?.seo?.description}
        />

        <link
          rel="canonical"
          href={canonicalUrl}
        />
      </Head>

      <BlogDetail
        blogData={blogProps}
        relatedBlogs={mockBlogs.filter(
          (b) => b.id !== blog?._id && b._id !== blog?._id
        )}
      />
    </>
  );
}

export async function getServerSideProps({ params }) {
  const url = `${process.env.BACKEND_URL}/blogs/${params.id}`;

  try {
    const res = await fetch(url);

    // Handle HTTP errors
    if (!res.ok) {
      return {
        notFound: true,
      };
    }

    const response = await res.json();

    if (!response.success || !response.data) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        blog: response.data,
      },
    };
  } catch (err) {
    console.error("Error fetching blog:", err);

    return {
      notFound: true,
    };
  }
}