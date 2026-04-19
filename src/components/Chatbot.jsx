import React, { useEffect, useState } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Inject the Chatfuel script once
    if (!document.getElementById('chatfuel-widget-script')) {
      const script = document.createElement('script');
      script.id = 'chatfuel-widget-script';
      script.src = 'https://panel.chatfuel.com/widgets/chat-widget/chat-widget.js';
      script.async = true;
      script.defer = true;
      script.dataset.bot = '683f996e4b5b5477bed711f9';
      script.dataset.chatfuel = true;
      document.body.appendChild(script);
    }

    // Create the container manually (will be used by Chatfuel)
    let container = document.getElementById('chatfuel-widget-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'chatfuel-widget-container';
      document.body.appendChild(container);
    }

    return () => {
      // Optional: cleanup on unmount
      const widget = document.querySelector('[id^="chat-widget"]');
      if (widget) widget.remove();
    };
  }, []);

  const toggleChat = () => {
    const widget = document.querySelector('[id^="chat-widget"]');
    if (widget) {
      widget.style.display = isVisible ? 'none' : 'block';
    }
    setIsVisible(!isVisible);
  };

  return (
    <div className="chatbot-wrapper">
      <button
        className="chatbot-toggle-button"
        onClick={toggleChat}
        aria-label={isVisible ? 'Fermer le chat' : 'Ouvrir le chat'}
      >
        {isVisible ? '✕' : '💬'}
      </button>
    </div>
  );
};

export default Chatbot;
