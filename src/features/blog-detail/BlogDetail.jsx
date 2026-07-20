import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './BlogDetail.module.css';
import { useAddCommentMutation } from '../dashboard/comment-sibar/api';

// Note: Ensure you import your RTK Query mutations/hooks and toast dispatches here or pass them as props:
// import { useAddCommentMutation } from '@/redux/api/blogApi';
// import { useDispatch } from 'react-redux';
// import { successToast, errorToast } from '@/redux/slices/toastSlice';

export default function BlogDetail({ 
  blogData, 
  relatedBlogs = [], 
  // addComment,     // Passed down or imported directly
  // isLoading,      // Mutation loading state
  dispatch        // Redux dispatch reference if global context is configured
}) {
  const router = useRouter();
    const [addComment, { isLoading }] = useAddCommentMutation();
  
  // Mock authentication state (replace with your real auth sync context down the road)
  const isLoggedIn = true; 

  // Component States
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(blogData?.likesCount ?? blogData?.likes ?? 0);
  const [commentText, setCommentText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Sync state cleanly if blogData updates via data layer re-fetches
  useEffect(() => {
    if (blogData) {
      setLikesCount(blogData.likesCount ?? blogData.likes ?? 0);
    }
  }, [blogData]);

  // Interactive Handlers
  const handleLike = () => {
    if (!isLoggedIn) return;
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };


  const processContent = (htmlContent) => {
  if (!htmlContent) return "";
  
  // Use a regex to find <h2> tags and add an id attribute
  return htmlContent.replace(/<h2>(.*?)<\/h2>/g, (match, title) => {
    const id = title.toLowerCase().replace(/<[^>]*>/g, '').replace(/\s+/g, '-');
    return `<h2 id="${id}">${title}</h2>`;
  });
};

  // Asynchronous API Mutation Handler for Comments
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isLoading) return;

    // Destructure ONLY activePopupId out, keeping the remaining parameters (like id) intact!
    const { activePopupId, ...remainingQueries } = router.query;
    console.log('blogData :>> ', blogData);
    try {
      // Trigger the RTK Query mutation using the exact schema parameters
      await addComment({ 
        blogId: blogData?._id || blogData?.id, 
        message: commentText.trim() 
      }).unwrap();

      if (dispatch && typeof successToast === 'function') {
        dispatch(successToast({ message: "Comment posted successfully!" }));
      }
      
      setCommentText(""); 
      
      // Navigate to remove the sidebar ID from query parameter strings while keeping the original blog ID parameter
      router.push({
        pathname: router.pathname, 
        query: remainingQueries
      }, undefined, { shallow: true }); // shallow prevents unnecessary server-side data lifecycle re-runs
      
    } catch (err) {
      if (dispatch && typeof errorToast === 'function') {
        dispatch(
          errorToast({ 
            message: err?.data?.message || "Failed to post comment. Please try again." 
          })
        );
      }
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      router.push({
        pathname: '/dashboard',
        query: { ...router.query, search: searchQuery }
      });
    }
  };

  // --- Dynamic Router-Driven Breadcrumb Logic ---
  const generateBreadcrumbs = () => {
    const linkPath = router.asPath.split('?')[0].split('/').filter(path => path);
    
    const breadcrumbs = linkPath.map((path, index) => {
      const url = '/' + linkPath.slice(0, index + 1).join('/');
      let label = path.replace(/-/g, ' ');
      
      if (blogData && (path === String(blogData.id) || path === String(blogData._id) || path === router.query.blog_id || path === router.query.id)) {
        label = blogData.title;
      }

      return {
        label: label?.charAt(0).toUpperCase() + label?.slice(1), 
        url: url,
        isLast: index === linkPath.length - 1
      };
    });

    if (breadcrumbs[0]?.url !== '/dashboard') {
      breadcrumbs.unshift({ label: 'Dashboard', url: '/dashboard', isLast: false });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  const commentsList = blogData?.commentsFeed || [];

  return (
    <div className={styles.pageContainer}>
      
      <div className={styles.utilityHeader}>
        {/* Dynamic Breadcrumb Navigation */}
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.url}>
              {idx > 0 && <span className={styles.separator}>/</span>}
              {crumb.isLast ? (
                <span className={styles.activePage} aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <span 
                  onClick={() => router.push({ pathname: crumb.url, query: { ...router.query } })}
                  className={styles.crumbLink}
                >
                  {crumb.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      <hr className={styles.divider} />

      <div className={styles.articleLayout}>
        <article className={styles.primaryContent}>
          <div className={styles.bannerWrapper}>
            <img src={blogData?.banner || "/api/placeholder/800/400"} alt="" className={styles.bannerImage} />
          </div>

          <h1 className={styles.mainTitle}>{blogData?.title}</h1>

          <div className={styles.authorCard}>
            <div className={styles.authorAvatar} style={{ backgroundColor: blogData?.authorBg || '#2563eb' }}>
              {blogData?.authorInitials || 'A'}
            </div>
            <div className={styles.authorMeta}>
              <p className={styles.authorName}>{blogData?.author || 'Senior Publisher'}</p>
              <p className={styles.publishDate}>Published on {blogData?.date || 'July 18, 2026'}</p>
            </div>
          </div>

          <div className={styles.engagementMetrics}>
            <div className={styles.metricItem}>
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.metaIcon}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{blogData?.views || 0} Views</span>
            </div>

            <button 
              className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`} 
              // onClick={handleLike}
              disabled={!isLoggedIn}
              title={isLoggedIn ? "Like this post" : "Log in to like posts"}
            >
              <svg fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" className={styles.metaIcon}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{likesCount} Likes</span>
            </button>
          </div>

          {/* Dynamic Article HTML Body */}
          <div className={styles.richTextBody}>
            {console.log('blogData :>> ', blogData)}
            {blogData?.content && (
              <div
              
dangerouslySetInnerHTML={{ __html: processContent(blogData.content) }}              />
            ) }
          </div>

          {/* Core Comments Form & Feed Interface */}
          <section className={styles.commentsSection}>
            <h3>Discussion ({commentsList.length})</h3>

            {isLoggedIn ? (
              <form onSubmit={handleSubmitComment} className={styles.commentForm}>
                <textarea
                  placeholder="Share your thoughts on this article..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className={styles.commentTextArea}
                  rows={3}
                  disabled={isLoading}
                  required
                />
                <button type="submit" className={styles.submitCommentBtn} disabled={isLoading}>
                  {isLoading ? 'Posting...' : 'Post Comment'}
                </button>
              </form>
            ) : (
              <div className={styles.loginPrompt}>
                <p>Please log in to participate in the conversation and add comments.</p>
              </div>
            )}

            <div className={styles.commentsFeed}>
              {commentsList.length > 0 ? (
                commentsList.map(comment => (
                  <div key={comment.id || comment._id} className={styles.commentBubble}>
                    <div className={styles.commentAvatar}>{comment.avatar || 'U'}</div>
                    <div className={styles.commentRight}>
                      <div className={styles.commentInfo}>
                        <span className={styles.commentAuthorName}>{comment.author}</span>
                        <span className={styles.commentTime}>{comment.date}</span>
                      </div>
                      <p className={styles.commentTextContent}>{comment.text || comment.message}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ fontStyle: 'italic', color: '#64748b', textAlign: 'center', padding: '20px 0' }}>
                  No responses yet. Be the first to share your thoughts!
                </p>
              )}
            </div>
          </section>
        </article>

        <aside className={styles.sidePanel}>
          <div className={styles.stickyCard}>
            <h4 className={styles.tocTitle}>Table of Contents</h4>
            <ul className={styles.tocList}>
              {blogData?.tableOfContents && blogData.tableOfContents.length > 0 ? (
                blogData.tableOfContents.map((item) => (
                  <li key={item.id || item._id}>
                    <a href={`#${item.text?.toLowerCase().replace(/\s+/g, '-')}`}>
                      {item.text}
                    </a>
                  </li>
                ))
              ) : (
                <>
                  <li><a href="#introduction">Introduction</a></li>
                  <li><a href="#core-concepts">Core Concepts & Architecture</a></li>
                  <li><a href="#future-outlook">Future Outlook</a></li>
                </>
              )}
            </ul>
          </div>
        </aside>
      </div>

      <footer className={styles.relatedSection}>
        <h3 className={styles.sectionHeadingTitle}>Related Articles You Might Like</h3>
        <div className={styles.relatedGrid}>
          {relatedBlogs.slice(0, 3).map((item) => (
            <div key={item.id || item._id} className={styles.relatedCard} onClick={() => {}}>
              <img src={item.banner || "/api/placeholder/400/200"} alt="" className={styles.relatedImage} />
              <div className={styles.relatedBody}>
                {console.log('item >> ', item)}
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
