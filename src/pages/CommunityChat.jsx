import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './CommunityChat.css';
import { FaCamera, FaFileText, FaVideo } from 'react-icons/fa';

const CommunityChat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState({
    content: '',
    media: null,
    mediaType: ''
  });
  const [showMediaOptions, setShowMediaOptions] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data: messagesData, error } = await supabase
        .from('community_chat')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(messagesData);
    };

    fetchMessages();

    const subscription = supabase
      .channel('community_chat')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'community_chat',
      }, () => fetchMessages())
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.content.trim() && !newMessage.media) return;

    try {
      let mediaUrl = null;
      if (newMessage.media) {
        const { data, error } = await supabase.storage
          .from('community-media')
          .upload(
            `community/${Date.now()}-${newMessage.media.name}`,
            newMessage.media
          );

        if (error) throw error;
        mediaUrl = data.path;
      }

      const { error } = await supabase
        .from('community_chat')
        .insert({
          user_id: supabase.auth.getUser().data.user.id,
          content: newMessage.content.trim(),
          media_url: mediaUrl,
          media_type: newMessage.mediaType
        });

      if (error) throw error;

      setNewMessage({ content: '', media: null, mediaType: '' });
      setShowMediaOptions(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleMediaSelect = (type) => {
    setNewMessage(prev => ({ ...prev, mediaType: type }));
    setShowMediaOptions(false);
  };

  return (
    <div className="community-chat-container">
      <div className="chat-navbar">
        <div className="media-options" onClick={() => setShowMediaOptions(!showMediaOptions)}>
          <FaCamera className="media-icon" />
          <FaFileText className="media-icon" />
          <FaVideo className="media-icon" />
        </div>
        {showMediaOptions && (
          <div className="media-options-dropdown">
            <button onClick={() => handleMediaSelect('image')}>
              <FaCamera /> Photo
            </button>
            <button onClick={() => handleMediaSelect('text')}>
              <FaFileText /> Text
            </button>
            <button onClick={() => handleMediaSelect('video')}>
              <FaVideo /> Video
            </button>
          </div>
        )}
      </div>

      <div className="messages-container">
        {messages.map((message) => (
          <div key={message.id} className="message-card">
            <div className="message-header">
              <span>User</span>
              <span className="timestamp">{new Date(message.created_at).toLocaleString()}</span>
            </div>
            {message.content && <p className="message-content">{message.content}</p>}
            {message.media_url && (
              <div className="message-media">
                {message.media_type === 'image' ? (
                  <img src={message.media_url} alt="Message" />
                ) : message.media_type === 'video' ? (
                  <video src={message.media_url} controls />
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="message-input-container">
        <input
          type="text"
          value={newMessage.content}
          onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Write a message..."
          required
        />
        <button type="submit">Send</button>
      </form>

      {newMessage.mediaType === 'image' && (
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setNewMessage(prev => ({ ...prev, media: e.target.files[0] }));
            }
          }}
          ref={(input) => input && input.click()}
        />
      )}

      {newMessage.mediaType === 'video' && (
        <input
          type="file"
          accept="video/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setNewMessage(prev => ({ ...prev, media: e.target.files[0] }));
            }
          }}
          ref={(input) => input && input.click()}
        />
      )}
    </div>
  );
};

export default CommunityChat;
