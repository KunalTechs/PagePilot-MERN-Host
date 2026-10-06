import React from 'react';
import DOMPurify from 'dompurify';
import { HelpCircle, ChevronDown } from 'lucide-react';

/**
 * FAQAccordion Component
 * Renders page FAQs in an accessible, keyboard-navigable HTML5 <details>/<summary> accordion.
 * Degrades gracefully by returning null if faqs array is empty or missing.
 */
const FAQAccordion = ({ faqs }) => {
  if (!faqs || !Array.isArray(faqs) || faqs.length === 0) {
    return null;
  }

  // Normalize FAQs: handles normalized { question, answer } items, nested PagePilot { faqs: { question, content } }, and { items: [...] }
  const items = faqs.flatMap((faqGroup, idx) => {
    if (!faqGroup) return [];

    const inner = faqGroup.faqs || faqGroup;
    const question = inner.question || faqGroup.question || faqGroup.title;

    let answer = '';
    if (typeof inner.answer === 'string' && inner.answer) {
      answer = inner.answer;
    } else if (typeof inner.content === 'string' && inner.content) {
      answer = inner.content;
    } else if (Array.isArray(inner.content) && inner.content.length > 0) {
      answer = inner.content.map(c => (typeof c === 'string' ? c : c.content || '')).filter(Boolean).join('\n');
    } else if (typeof faqGroup.answer === 'string' && faqGroup.answer) {
      answer = faqGroup.answer;
    } else if (Array.isArray(faqGroup.items) && faqGroup.items.length > 0) {
      return faqGroup.items.map(i => ({
        id: i._id || i.id,
        question: i.question || i.title,
        answer: i.answer || i.content || ''
      }));
    }

    if (!question && !answer) return [];

    return [{
      id: faqGroup._id || faqGroup.id || `faq-${idx}`,
      question: question || `Question ${idx + 1}`,
      answer
    }];
  });

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="faq-section glass-panel" style={{ marginTop: '3rem', padding: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <HelpCircle size={24} style={{ color: 'var(--accent-primary, #6366f1)' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Frequently Asked Questions</h2>
      </div>

      <div className="faq-accordion-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {items.map((item, idx) => {
          const q = item.question || `Question ${idx + 1}`;
          const rawAnswer = item.answer || '';
          const cleanAnswer = typeof rawAnswer === 'string' ? DOMPurify.sanitize(rawAnswer) : '';

          return (
            <details
              key={item.id || idx}
              className="faq-item"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-glass, rgba(255,255,255,0.1))',
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'all 0.2s ease'
              }}
            >
              <summary
                style={{
                  padding: '1rem 1.25rem',
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  userSelect: 'none',
                  outline: 'none'
                }}
              >
                <span>{q}</span>
                <ChevronDown size={18} className="faq-icon" style={{ flexShrink: 0, marginLeft: '0.5rem' }} />
              </summary>
              <div
                style={{
                  padding: '0 1.25rem 1.25rem 1.25rem',
                  color: 'var(--text-secondary, #9ca3af)',
                  lineHeight: '1.6',
                  fontSize: '0.95rem'
                }}
              >
                {cleanAnswer ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: cleanAnswer }}
                    style={{ margin: 0 }}
                  />
                ) : (
                  <p style={{ margin: 0, fontStyle: 'italic', opacity: 0.7 }}>No detailed answer provided.</p>
                )}
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
};

export default FAQAccordion;
