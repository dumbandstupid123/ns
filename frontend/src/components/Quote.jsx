import React, { useState, useEffect } from 'react';
import './Quote.css';

const quotes = [
  {
    text: "The best way to find yourself is to lose yourself in the service of others.",
    author: "Mahatma Gandhi"
  },
  {
    text: "It is not how much we do, but how much love we put in the doing. It is not how much we give, but how much love we put in the giving.",
    author: "Mother Teresa"
  },
  {
    text: "The purpose of life is not to be happy. It is to be useful, to be honorable, to be compassionate, to have it make some difference that you have lived and lived well.",
    author: "Ralph Waldo Emerson"
  },
  {
    text: "You may be the only person left who believes in you, but it's enough. It takes just one star to pierce a universe of darkness. Never give up.",
    author: "Richelle E. Goodrich"
  },
  {
    text: "One person can make a difference, and everyone should try.",
    author: "John F. Kennedy"
  },
    {
    text: "Every day, we have the opportunity to create a better world.",
    author: "Unknown"
  }
];

const Quote = () => {
  const [quote, setQuote] = useState({ text: '', author: '' });

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    setQuote(quotes[randomIndex]);
  }, []);

  if (!quote.text) return null;

  return (
    <div className="quote-widget">
      <div className="quote-content">
        <i className="fas fa-quote-left"></i>
        <p className="quote-text">{quote.text}</p>
        <p className="quote-author">- {quote.author}</p>
      </div>
    </div>
  );
};

export default Quote;
