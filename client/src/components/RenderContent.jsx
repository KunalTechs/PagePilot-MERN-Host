import React, { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { useNavigate } from 'react-router-dom';

/**
 * RenderContent Component
 * 
 * Sanitizes PagePilot HTML with DOMPurify (FORCE_BODY: true so leading <style> tags survive,
 * stripping script/iframe/object/embed tags and event handlers).
 * Renders the sanitized HTML inside a Shadow DOM container (attaching shadow root once and reusing).
 * Injects a base reset stylesheet and intercepts internal <a> clicks for React Router SPA navigation.
 */
const RenderContent = ({ page }) => {
  const containerRef = useRef(null);
  const shadowRootRef = useRef(null);
  const navigate = useNavigate();

  const rawHtml = page?.html || (page?.sections || []).map(s => s.content || '').join('\n');

  useEffect(() => {
    if (!containerRef.current) return;

    // Attach Shadow DOM root once and reuse
    if (!shadowRootRef.current) {
      shadowRootRef.current = containerRef.current.attachShadow({ mode: 'open' });
    }

    const shadow = shadowRootRef.current;

    // 1. Sanitize HTML with DOMPurify (FORCE_BODY: true preserves leading <style> blocks)
    const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
      FORCE_BODY: true,
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
      ADD_TAGS: ['style', 'link', 'picture'],
      ADD_ATTR: ['target', 'rel', 'data-action', 'data-block', 'data-layout', 'data-ahd-tpl-root', 'role', 'aria-label', 'aria-hidden', 'aria-controls'],
    });

    // 2. Base stylesheet injected inside Shadow DOM before content
    const baseStyle = `<style>
      * { box-sizing: border-box; }
      img { max-width: 100%; height: auto; }
      body, html { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
    </style>`;

    // 3. Mount into Shadow DOM
    shadow.innerHTML = `${baseStyle}${sanitizedHtml}`;

    // 4. Intercept clicks on <a> tags inside shadow root pointing to internal slugs
    const handleAnchorClick = (event) => {
      const anchor = event.target.closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (href && href.startsWith('/') && !href.startsWith('//')) {
        event.preventDefault();
        navigate(href);
      }
    };

    shadow.addEventListener('click', handleAnchorClick);

    return () => {
      shadow.removeEventListener('click', handleAnchorClick);
    };
  }, [rawHtml, navigate]);

  return (
    <div 
      ref={containerRef} 
      className="shadow-dom-host" 
      style={{ width: '100%', minHeight: '400px', background: '#ffffff', color: '#262626' }}
    />
  );
};

export default RenderContent;
