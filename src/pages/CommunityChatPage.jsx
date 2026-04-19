import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './CommunityChatPage.css';

const SUPABASE_PROJECT_REF = "fdyqxkzozgkufqsmrfye";
const SUPABASE_MEDIA_BASE_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co/storage/v1/object/public/community-media/`;

const CommunityChatPage = () => {
  const [posts, setPosts] = useState([]);
  const [userProfiles, setUserProfiles] = useState({});
  const [likes, setLikes] = useState([]);
  const [newPost, setNewPost] = useState({ content: '' });
  const [newComment, setNewComment] = useState({});
  const [comments, setComments] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase.from('profiles').select('id, username, avatar_url, email');
      if (!error && data) {
        const map = {};
        data.forEach(profile => { map[profile.id] = profile; });
        setUserProfiles(map);
      }
    };
    fetchProfiles();
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        navigate('/login');
        return;
      }
      setCurrentUser(session.user);
      setIsLoading(false);
    };
    checkSession();
  }, [navigate]);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setPosts(data);
    };
    fetchPosts();
    const postSubscription = supabase
      .channel('realtime:public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, fetchPosts)
      .subscribe();
    return () => {
      supabase.removeChannel(postSubscription);
    };
  }, []);

  useEffect(() => {
    const fetchLikes = async () => {
      const { data, error } = await supabase.from('likes').select('*');
      if (!error) setLikes(data);
    };
    fetchLikes();
    const likeSubscription = supabase
      .channel('realtime:public:likes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'likes' }, fetchLikes)
      .subscribe();
    return () => {
      supabase.removeChannel(likeSubscription);
    };
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase.from('comments').select('*').order('created_at', { ascending: true });
      if (!error && data) {
        const grouped = {};
        data.forEach(comment => {
          if (!grouped[comment.post_id]) grouped[comment.post_id] = [];
          grouped[comment.post_id].push(comment);
        });
        setComments(grouped);
      }
    };
    fetchComments();
    const commentSubscription = supabase
      .channel('realtime:public:comments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, fetchComments)
      .subscribe();
    return () => {
      supabase.removeChannel(commentSubscription);
    };
  }, []);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.content.trim()) return;

    // Optimistically add the post to UI
    const tempId = 'temp-' + Date.now();
    const newTempPost = {
      id: tempId,
      user_id: currentUser.id,
      content: newPost.content.trim(),
      created_at: new Date().toISOString(),
    };
    setPosts(prev => [newTempPost, ...prev]);
    setNewPost({ content: '' });
    try {
      await supabase.from('posts').insert({
        user_id: currentUser.id,
        content: newTempPost.content
      });
      // The realtime listener will replace the temp post with the real one
    } catch (error) {
      // Rollback UI if error
      setPosts(prev => prev.filter(p => p.id !== tempId));
      console.error('Error posting:', error);
    }
  };


  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    if (!newComment[postId]?.trim()) return;

    // Optimistically update UI
    const tempId = 'temp-' + Date.now();
    const tempComment = {
      id: tempId,
      post_id: postId,
      user_id: currentUser.id,
      content: newComment[postId].trim(),
      created_at: new Date().toISOString()
    };
    setComments(prev => {
      const arr = prev[postId] ? [...prev[postId], tempComment] : [tempComment];
      return { ...prev, [postId]: arr };
    });
    setNewComment(prev => ({ ...prev, [postId]: '' }));
    try {
      await supabase.from('comments').insert({
        post_id: postId,
        user_id: currentUser.id,
        content: tempComment.content
      });
      // Realtime will replace temp comment
    } catch (error) {
      setComments(prev => {
        const arr = (prev[postId] || []).filter(c => c.id !== tempId);
        return { ...prev, [postId]: arr };
      });
      console.error('Error commenting:', error);
    }
  };


  const handleLike = async (postId) => {
    // Optimistically update UI
    setLikes(prev => {
      const alreadyLiked = prev.some(like => like.post_id === postId && like.user_id === currentUser.id);
      if (alreadyLiked) {
        return prev.filter(like => !(like.post_id === postId && like.user_id === currentUser.id));
      } else {
        return [...prev, { id: 'temp-' + Date.now(), post_id: postId, user_id: currentUser.id }];
      }
    });
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', currentUser.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        await supabase.from('likes').delete().eq('id', data.id);
      } else {
        await supabase.from('likes').insert({ post_id: postId, user_id: currentUser.id });
      }
      // Realtime will correct as needed
    } catch (error) {
      // Rollback
      setLikes(prev => prev.filter(like => !(like.post_id === postId && like.user_id === currentUser.id && like.id && String(like.id).startsWith('temp-'))));
      console.error('Error liking:', error);
    }
  };


  const [deletingPostId, setDeletingPostId] = useState(null);

  // Delete a post (and all its comments/likes via ON DELETE CASCADE in the DB)
  const handleDeletePost = async (post) => {
    console.log('Deleting post:', post); // Debug log
    if (!currentUser || post.user_id !== currentUser.id) {
      alert('You can only delete your own posts.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    // If it's a temp (optimistic) post, just remove it from UI
    if (String(post.id).startsWith('temp-')) {
      setPosts(prevPosts => prevPosts.filter(p => p.id !== post.id));
      return;
    }
    setDeletingPostId(post.id);
    setError('');
    try {
      // Only delete the post; ON DELETE CASCADE handles comments/likes in DB
      const { error: postError } = await supabase
        .from('posts')
        .delete()
        .eq('id', post.id)
        .eq('user_id', currentUser.id);
      if (postError) throw postError;
      // Remove from UI
      setPosts(prevPosts => prevPosts.filter(p => p.id !== post.id));
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post. ' + (error.message || 'Please try again.'));
    } finally {
      setDeletingPostId(null);
    }
  };



  if (isLoading) {
    return <div className="community-chat-container"><p>Loading...</p></div>;
  }

  if (!currentUser) {
    return <div className="community-chat-container"><p>Please log in to view the chat.</p></div>;
  }

  return (
    <div className="community-chat-container">
      <Navbar />
      <form className="create-post-section" onSubmit={handlePostSubmit}>
        <textarea
          className="create-post-input"
          placeholder="Write a message..."
          value={newPost.content}
          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
        />
        <button className="post-button" type="submit">Post</button>
      </form>

      <div className="post-list">
        {posts.map((post) => {
          const profile = userProfiles[post.user_id] || {};
          const avatar = profile.avatar_url;
          const username = profile.username || 'Unknown';
          const initials = username[0]?.toUpperCase() || 'U';
          const postLikes = likes.filter(like => like.post_id === post.id);
          const userLiked = postLikes.some(like => like.user_id === currentUser.id);

          return (
            <div key={post.id} className="post-item">
              <div className="post-header">
                {avatar ? <img src={avatar} alt={username} className="post-avatar" />
                  : <div className="post-avatar initials-avatar">{initials}</div>}
                <strong>{username}</strong> · <small>{new Date(post.created_at).toLocaleString()}</small>
                {post.user_id === currentUser.id && (
                  <button
                    className="delete-post-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePost(post);
                    }}
                    disabled={deletingPostId === post.id}
                    aria-label="Delete Post"
                  >
                    {deletingPostId === post.id ? 'Deleting...' : '🗑️ Delete'}
                  </button>
                )}
              </div>
              <div className="post-content">{post.content}</div>
              <div className="post-actions">
                <button
                  className={`like-button${userLiked ? ' liked' : ''}`}
                  onClick={() => handleLike(post.id)}
                  aria-label={userLiked ? 'Unlike' : 'Like'}
                >
                  <span style={{fontSize: '1.3rem', marginRight: 6}}>{userLiked ? '❤️' : '🤍'}</span>
                  <span style={{fontWeight: 'bold', color: '#f0c14b'}}>{postLikes.length}</span>
                  <span style={{marginLeft: 6}}>{userLiked ? 'Liked' : 'Like'}</span>
                </button>
              </div>
              <div className="comments-section">
                <h4 className="comments-title" style={{color:'#f0c14b', marginBottom: 10, fontWeight:'bold', letterSpacing:1}}>Comments</h4>
                <ul className="comment-list">
                  {(comments[post.id] || []).map((comment) => {
                    const commenter = userProfiles[comment.user_id] || {};
                    const cName = commenter.username || 'Unknown';
                    const cAvatar = commenter.avatar_url;
                    return (
                      <li key={comment.id} className="comment-item">
                        <div className="comment-avatar-container">
                          {cAvatar ? (
                            <img src={cAvatar} alt={cName} className="comment-avatar" />
                          ) : (
                            <div className="comment-avatar initials-avatar">{cName[0]}</div>
                          )}
                        </div>
                        <div className="comment-body">
                          <span className="comment-username">{cName}</span>
                          <span className="comment-content">{comment.content}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <form className="comment-form pro-comment-form" onSubmit={(e) => handleCommentSubmit(e, post.id)} autoComplete="off">
                  <style jsx>{`
                    .pro-comment-form {
                      background: rgba(40,40,40,0.92);
                      border: 2px solid #f0c14b;
                      border-radius: 12px;
                      box-shadow: 0 2px 18px #f0c14b33, 0 1px 8px #000a;
                      display: flex;
                      align-items: center;
                      gap: 1rem;
                      padding: 0.6rem 1.2rem;
                      margin-top: 0.7rem;
                      margin-bottom: 0.2rem;
                      position: relative;
                      z-index: 2;
                    }
                    .pro-comment-form .comment-form-avatar {
                      display: flex;
                      align-items: center;
                      justify-content: center;
                    }
                    .pro-comment-form .comment-input {
                      padding: 0.8rem 1.2rem;
                      border: none;
                      border-radius: 10px;
                      background-color: #2a2a2a;
                      color: #fff;
                      font-size: 1rem;
                      width: 100%;
                    }
                    .pro-comment-form .comment-input:focus {
                      outline: none;
                      border: 2px solid #f0c14b;
                    }
                    .pro-comment-form .comment-button {
                      background-color: #f0c14b;
                      border: none;
                      padding: 0.6rem 1.2rem;
                      border-radius: 10px;
                      cursor: pointer;
                      transition: background-color 0.2s ease-in-out;
                    }
                    .pro-comment-form .comment-button:hover {
                      background-color: #ffd700;
                    }
                  `}</style>
                  <div className="comment-form-avatar">
                    {(currentUser && userProfiles[currentUser.id]?.avatar_url) ? (
                      <img src={userProfiles[currentUser.id].avatar_url} alt="Me" className="comment-avatar" />
                    ) : (
                      <div className="comment-avatar initials-avatar">{(currentUser?.username || 'U')[0]}</div>
                    )}
                  </div>
                  <input
                    className="comment-input pro-comment-input"
                    value={newComment[post.id] || ''}
                    onChange={(e) => setNewComment((prev) => ({ ...prev, [post.id]: e.target.value }))}
                    placeholder="Add a comment..."
                    maxLength={250}
                  />
                  <button className="comment-button pro-comment-send" type="submit" aria-label="Send Comment">
                    <span role="img" aria-label="Send">💬</span>
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommunityChatPage;
