import SidebarWrapperPopup from "@/components/sidebar-wrapper-popup/SidebarWrapperPopup";
import { useRouter } from "next/router";
import React, { useState } from "react";
import styles from "./CommentSidebar.module.css"; 
import { useAddCommentMutation } from "./api";
import { useDispatch } from "react-redux";
import { errorToast, successToast } from "@/services/slices/toastSlice";

const CommentSidebar = ({ data, handleClosePopup }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isOpen = router?.query?.activePopupId === 's4fsd12';
  const [addComment, { isLoading }] = useAddCommentMutation();
  const [commentText, setCommentText] = useState("");
console.log('data :>> ', data);
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isLoading) return;

    // Destructure ONLY activePopupId out, keeping the remaining parameters (like id) intact!
    const { activePopupId, ...remainingQueries } = router.query;

    try {
      // Trigger the RTK Query mutation using the exact schema parameters
      await addComment({ 
        blogId: data?._id, 
        message: commentText.trim() 
      }).unwrap();

      dispatch(successToast({ message: "Comment posted successfully!" }));
      setCommentText(""); 
      
      // Navigate to remove the sidebar ID from query parameter strings while keeping the original blog ID parameter
      router.push({
        pathname: router.pathname, 
        query: remainingQueries
      }, undefined, { shallow: true }); // shallow prevents unnecessary server-side data lifecycle re-runs
      
    } catch (err) {
      dispatch(
        errorToast({ 
          message: err?.data?.message || "Failed to post comment. Please try again." 
        })
      );
    }
  };

  const handleShareClick = () => {
    const blogUrl = `${window.location.origin}/blog/${data?._id}`;
    
    if (navigator.share) {
      navigator.share({
        title: data?.title,
        text: data?.description,
        url: blogUrl,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(blogUrl);
      dispatch(successToast({ message: "Blog link copied to clipboard!" }));
    }
  };

  return (
    <SidebarWrapperPopup
      isOpen={isOpen}
      onClose={handleClosePopup}
      title="Blog Discussion"
    >
      <div className={styles.sidebarContent}>
        
        {/* Blog Minimal Info Header Card */}
        <div className={styles.blogHeaderCard}>
          <h4 className={styles.blogTitle}>{data?.title}</h4>
          <span className={styles.blogMeta}>ID Reference: #{data?._id}</span>
          
          <button className={styles.shareButton} onClick={handleShareClick} type="button">
            <svg className={styles.shareIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 10.742l4.636-2.318m0 7.152l-4.636-2.318M21 12a3 3 0 11-6 0 3 3 0 016 0zm-6-4.5a3 3 0 11-6 0 3 3 0 016 0zm-6 9a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Share Post Link</span>
          </button>
        </div>

        {/* Dynamic Real Comments Feed Wrapper */}
        <div className={styles.commentsList}>
          <p className={styles.sectionHeading}>
            Responses ({data?.comments?.length || 0})
          </p>

          {data?.comments && Array.isArray(data.comments) && data.comments.length > 0 ? (
            data.comments.map((comment) => (
              <div key={comment._id} className={styles.commentItem}>
                <div className={styles.commentUserMeta}>
                  <div className={styles.miniAvatar} style={{ backgroundColor: "#3b82f6", color: "#fff" }}>
                    {comment.userId?.name ? comment.userId?.name[0] : "?"} 
                  </div>
                  <strong>User ({ comment.userId?.name  ? comment.userId?.name : "Anon"})</strong>
                  <span className={styles.commentDate} style={{ fontSize: '11px', color: '#64748b', marginLeft: 'auto' }}>
                    {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ""}
                  </span>
                </div>
                <p className={styles.commentBody}>{comment.message}</p>
              </div>
            ))
          ) : (
            <p className={styles.noComments} style={{ color: "#64748b", fontStyle: "italic", textAlign: "center", marginTop: "20px" }}>
              No responses yet. Be the first to comment!
            </p>
          )}
        </div>

        {/* Dynamic Static-Bottom Form Element Input */}
        <form onSubmit={handleSubmitComment} className={styles.commentForm}>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              placeholder={isLoading ? "Posting response..." : "What are your thoughts?..."}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className={styles.commentInput}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={!commentText.trim() || isLoading}
            >
              {isLoading ? "Responding..." : "Respond"}
            </button>
          </div>
        </form>

      </div>
    </SidebarWrapperPopup>
  );
};

export default CommentSidebar;