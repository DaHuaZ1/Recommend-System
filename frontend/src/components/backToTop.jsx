// src/components/BackToTop.jsx
import React, { useState, useEffect } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // 滚动高度超过 300px 时显示
      setVisible(window.pageYOffset > 300);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const styles = {
    position: 'fixed',
    right: '20px',
    bottom: '50px',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#1890ff',
    color: '#fff',
    textAlign: 'center',
    lineHeight: '40px',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    transition: 'opacity 0.3s',
    opacity: visible ? 1 : 0,
    pointerEvents: visible ? 'auto' : 'none',
  };

  return (
    <div style={styles} onClick={scrollToTop} title="回到顶部">
      ↑
    </div>
  );
}