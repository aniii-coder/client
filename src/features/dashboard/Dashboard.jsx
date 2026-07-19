import React, { useState, useEffect } from "react";
import styles from "./Dashboard.module.css";
import Cookies from "js-cookie";
import { popupIds } from "./utils";
import SidebarWrapperPopup from "@/components/sidebar-wrapper-popup/SidebarWrapperPopup";
import { useRouter } from "next/router";
import CommentSidebar from "./comment-sibar/CommentSidebar";
import { Eye, MessageCircle, Share2, ThumbsUp, LayoutGrid, List, User } from "lucide-react";
import { useGetAllBlogsQuery, useLikeBlogMutation } from "./api";
import { useAuthCheck } from "@/helper/isUserAuthenticated";
import { useDispatch } from "react-redux";
import { errorToast, successToast } from "@/services/slices/toastSlice";

export default function Dashboard() {
  const router = useRouter();
  const { activePopupId, id, search, sort, category } = router.query;

  const auth = useAuthCheck("user");
  const [searchInput, setSearchInput] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const dispatch = useDispatch();
  const [likeBlog, { isLoading: isLiking }] = useLikeBlogMutation();

  const [limit, setLimit] = useState(9);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (auth) {
      setIsAuthenticated(auth.isAuthenticated);
      setUserData(auth.user);
    }
  }, [auth?.isAuthenticated, JSON.stringify(auth?.user)]);

  useEffect(() => {
    setSearchInput(search || "");
  }, [search]);

  useEffect(() => {
    setLimit(9);
  }, [search, sort, category]);

  const { data: blogResponse, isLoading, isError } = useGetAllBlogsQuery({
    search: search || "",
    sort: sort || "",
    category: category || "All",
    limit: limit,
  });

  const blogsList = blogResponse?.blogs || [];
  const mainData = blogsList.find((b) => b?._id === id) || null;

  const hasMore = blogResponse?.totalCount 
    ? blogsList.length < blogResponse.totalCount 
    : blogsList.length >= limit;

  const handleLoadMore = () => {
    setLimit((prevLimit) => prevLimit + 9);
  };

  const handlePreviewClick = (blog) => {
    // const routeOptions = {
    //   id: blog?._id,
    //   // authorId: blog?.authorId,
    //   previewMode: true
    // };
    // console.log('blog :>> ', routeOptions);
   router.push({
    pathname: '/dashboard/blog/[id]',
    query: { 
      id: blog?._id,           // This fills the [id] dynamic segment
      // authorId: blog?.authorId, // Extra query params
      // previewMode: 'true'       // Note: query values should be strings
    }
  });
  };

  const handleComment = (item) => {
    if (!isAuthenticated) {
      router.push("/auth");
      return;
    }
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        activePopupId: popupIds["commentSidebar"],
        id: item?._id,
      },
    });
  };

  const handleLikeClick = async (blogId) => {
    if (!isAuthenticated) {
      dispatch(
        errorToast({
          message: "You must be logged in to like a post!",
        })
      );
      router.push("/auth");
      return;
    }

    if (isLiking) return; 

    try {
      const response = await likeBlog(blogId).unwrap();
      
      if (response?.success) {
        dispatch(
          successToast({
            message: response?.message || "Blog post updated!",
          })
        );
      } else {
        dispatch(
          errorToast({
            message: response?.message || "Could not complete this action.",
          })
        );
      }
    } catch (err) {
      dispatch(
        errorToast({
          message: err?.data?.message || "Something went wrong while liking the post.",
        })
      );
      console.error("Like error details:", err);
    }
  };
const handleShareClick = (blog) => {
  const baseUrl = window.location.origin;
  const shareLink = `${baseUrl}/dashboard/blog/${blog?._id}?authorId=${blog?.authorId || ""}&previewMode=true`;

  navigator.clipboard.writeText(shareLink)
    .then(() => {
      // Success alert
      alert("Link copied to clipboard!"); 
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
      // Error alert
      alert("Failed to copy link. Please try again.");
    });
};
  const handleClosePopup = () => {
    const newQuery = { ...router.query };
    delete newQuery.activePopupId;
    delete newQuery.id;
    router.push({ pathname: router.pathname, query: newQuery });
  };

  const reversePopupIds = Object.fromEntries(
    Object.entries(popupIds).map(([k, v]) => [v, k]),
  );

  const popupConfig = {
    commentSidebar: {
      component: CommentSidebar,
      getProps: ({ data }) => ({
        data: data,
        handleClosePopup: handleClosePopup,
      }),
    },
  };

  const configKey = reversePopupIds[activePopupId];
  const config = popupConfig[configKey];

  const handleSortChange = (e) => {
    router.push({ pathname: router.pathname, query: { ...router.query, sort: e.target.value } });
  };

  const triggerSearchSubmit = () => {
    router.push({ 
      pathname: router.pathname, 
      query: { ...router.query, search: searchInput.trim() } 
    });
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      triggerSearchSubmit();
    }
  };

  return (
    <div className={styles.container}>
      {/* Header controls section */}
      <div className={styles.header}>
        <h2 className={styles.pageTitle}>Recent Blog Posts</h2>
        <div className={styles.controls}>
          <div className={styles.toggleGroup}>
            <button
              className={`${styles.toggleBtn} ${viewMode === "grid" ? styles.toggleBtnActive : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              className={`${styles.toggleBtn} ${viewMode === "list" ? styles.toggleBtnActive : ""}`}
              onClick={() => setViewMode("list")}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>

          <select
            className={styles.dropdown}
            value={sort || "newest"}
            onChange={handleSortChange}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">A-Z Order</option>
          </select>

          <input
            type="text"
            placeholder="Search blogs... (Press Enter)"
            className={styles.searchBar}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            onBlur={triggerSearchSubmit}
          />

          <div
            className={styles.authIconWrapper}
            style={{
              position: "relative",
              cursor: "pointer",
              marginLeft: "10px",
            }}
            onClick={() => !isAuthenticated && router.push("/auth")}
          >
            {isAuthenticated && userData ? (
              <div className={styles.avatarGroup}>
                <div
                  className={styles.avatar}
                  style={{
                    backgroundColor: "#3b82f6",
                    color: "#fff",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    fontWeight: "600",
                  }}
                >
                  {(userData?.firstName || userData?.email || "U")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <div className={styles.avatarTooltip}>
                  <p className={styles.tooltipName}>
                    {userData?.firstName || "User"}
                  </p>
                  <p className={styles.tooltipEmail}>{userData?.email || ""}</p>
                </div>
              </div>
            ) : (
              <div className={styles.avatarGroup}>
                <User size={24} className={styles.fallbackUserIcon} />
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading && blogsList.length === 0 && (
        <div className={styles.loading}>Loading blogs...</div>
      )}
      {isError && (
        <div className={styles.error}>Failed to load blog updates.</div>
      )}

      {(!isLoading || blogsList.length > 0) && !isError && (
        <>
          {viewMode === "grid" ? (
            <div className={styles.grid}>
              {blogsList.map((blog) => {
                {
                  console.log("userData :>> ", userData);
                }
                // Determine if the current user has liked this blog post
                const isLikedByMe = !!(
                  userData &&
                  Array.isArray(blog?.likes) &&
                  blog.likes.includes(userData?._id || userData?.id)
                );
                {
                  console.log("isLikedByMe :>> ", isLikedByMe);
                }
                return (
                  <div key={blog?._id} className={styles.card}>
                    <div
                      className={styles.imageWrapper}
                      onClick={() => handlePreviewClick(blog)}
                    >
                      <img
                        src={blog?.thumbnail || blog?.banner}
                        alt={blog?.title}
                        className={styles.bannerImage}
                      />
                      <div className={styles.previewOverlay}>
                        <Eye className={styles.previewIcon} />
                      </div>
                    </div>

                    <div className={styles.authorRow}>
                      <div className={styles.authorMeta}>
                        <div
                          className={styles.avatar}
                          style={{ backgroundColor: "#cbd5e1" }}
                        >
                          {blog?.title?.slice(0, 2).toUpperCase()}
                        </div>
                        <span className={styles.authorName}>Admin</span>
                      </div>
                      <span className={styles.dateText}>
                        {blog?.createdAt
                          ? new Date(blog.createdAt).toLocaleDateString()
                          : ""}
                      </span>
                    </div>

                    <div className={styles.cardBody}>
                      <h3 className={styles.blogTitle}>{blog?.title}</h3>
                      <p className={styles.blogDescription}>
                        {blog?.description}
                      </p>
                    </div>

                    <div className={styles.cardFooter}>
                      <button
                        className={`${styles.footerAction} ${isLikedByMe ? styles.likedActionBtn : ""}`}
                        title="Like"
                        onClick={() => handleLikeClick(blog?._id)}
                      >
                        <ThumbsUp
                          className={styles.actionIcon}
                          fill={isLikedByMe ? "currentColor" : "none"}
                          style={isLikedByMe ? { color: "#3b82f6" } : {}}
                        />
                        <span
                          style={
                            isLikedByMe
                              ? { color: "#3b82f6", fontWeight: "600" }
                              : {}
                          }
                        >
                          {blog?.likes?.length || 0}
                        </span>
                      </button>
                      <button
                        className={styles.footerAction}
                        title="Share"
                        onClick={() => handleShareClick(blog)}
                      >
                        <Share2 className={styles.actionIcon} />
                        <span>0</span>
                      </button>
                      <button
                        className={styles.footerAction}
                        title="Comment"
                        onClick={() => handleComment(blog)}
                      >
                        <MessageCircle className={styles.actionIcon} />
                        <span>{blog?.comments?.length || 0}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.listView}>
              {blogsList.map((blog) => {
                console.log("blog :>> ", blog);
                // Determine if the current user has liked this blog post
                // Avoid the crash if likes is a number, not an array
                const isLikedByMe = Array.isArray(blog?.likes)
                  ? blog.likes.some(
                      (likeId) =>
                        likeId === userData?._id || likeId === userData?.id,
                    )
                  : false; // Fallback if data is just a number

                return (
                  <div key={blog?._id} className={styles.listRow}>
                    <div
                      className={styles.imageWrapper}
                      onClick={() => handlePreviewClick(blog)}
                    >
                      <img
                        src={blog?.thumbnail || blog?.banner}
                        alt={blog?.title}
                        className={styles.bannerImage}
                      />
                      <div className={styles.previewOverlay}>
                        <Eye className={styles.previewIcon} />
                      </div>
                    </div>

                    <div className={styles.listContentArea}>
                      <div className={styles.listMainText}>
                        <h3
                          className={styles.blogTitle}
                          style={{ margin: "0 0 4px 0" }}
                        >
                          {blog?.title}
                        </h3>
                        <p className={styles.blogDescription}>
                          {blog?.description}
                        </p>
                      </div>

                      <div className={styles.listMetaRight}>
                        <span className={styles.dateText}>
                          {blog?.createdAt
                            ? new Date(blog.createdAt).toLocaleDateString()
                            : ""}
                        </span>

                        <div className={styles.listActions}>
                          <button
                            className={`${styles.footerAction} ${isLikedByMe ? styles.likedActionBtn : ""}`}
                            title="Like"
                            onClick={() => handleLikeClick(blog?._id)}
                          >
                            <ThumbsUp
                              className={styles.actionIcon}
                              fill={isLikedByMe ? "currentColor" : "none"}
                              style={isLikedByMe ? { color: "#3b82f6" } : {}}
                            />
                            <span
                              style={
                                isLikedByMe
                                  ? { color: "#3b82f6", fontWeight: "600" }
                                  : {}
                              }
                            >
                              {blog?.likes?.length || 0}
                            </span>
                          </button>
                          <button
                            className={styles.footerAction}
                            title="Share"
                            onClick={() => handleShareClick(blog)}
                          >
                            <Share2 className={styles.actionIcon} />
                            <span>0</span>
                          </button>
                          <button
                            className={styles.footerAction}
                            title="Comment"
                            onClick={() => handleComment(blog)}
                          >
                            <MessageCircle className={styles.actionIcon} />
                            <span>{blog?.comments?.length || 0}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {hasMore && (
            <div className={styles.loadMoreContainer}>
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className={styles.loadMoreBtn}
              >
                {isLoading ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </>
      )}

      {config && (
        <config.component
          {...config.getProps({
            data: mainData,
            handleClosePopup: handleClosePopup,
          })}
        />
      )}
    </div>
  );
}