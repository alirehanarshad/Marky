import React from 'react';
import { Copy, Quote, Check } from 'lucide-react';

/**
 * Universal Visual Markdown Renderer
 * Parses headings, bullet points, numbers, tables, blockquotes, bold/italic, and code blocks
 * into rich, styled, interactive UI components instead of raw markdown text.
 */
export default function MarkdownDocumentView({ content, onCopySnippet }) {
  if (!content) return null;

  // Clean double escapes if any (e.g. \" or \n)
  const cleaned = typeof content === 'string' 
    ? content.replace(/\\n/g, '\n').replace(/\\"/g, '"')
    : String(content);

  const lines = cleaned.split('\n');
  const renderedElements = [];
  let currentKey = 0;
  let inList = false;
  let listItems = [];
  let inTable = false;
  let tableRows = [];

  const flushList = () => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={`list-${currentKey++}`} className="space-y-2 my-2.5 pl-1">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      const headerRow = tableRows[0];
      const dataRows = tableRows.slice(1);
      renderedElements.push(
        <div key={`table-${currentKey++}`} className="my-3 overflow-x-auto rounded-xl border border-[#ECE8E3] shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F7F6FA] border-b border-[#ECE8E3]">
                {headerRow.map((cell, cIdx) => (
                  <th key={cIdx} className="px-3.5 py-2.5 font-bold text-[#141226]">
                    {renderInlineText(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE8E3] bg-white">
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-[#FCFBFA] transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3.5 py-2 text-[#3E3A52]">
                      {renderInlineText(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Table rows
    if (line.startsWith('|') && line.endsWith('|')) {
      flushList();
      if (/^\|[\s\-:|]+\|$/.test(line)) {
        continue; // Separator row
      }
      const cells = line.split('|').slice(1, -1).map((c) => c.trim());
      inTable = true;
      tableRows.push(cells);
      continue;
    } else {
      flushTable();
    }

    // Horizontal Rule
    if (line === '---' || line === '***' || line === '___') {
      flushList();
      renderedElements.push(
        <div key={`hr-${currentKey++}`} className="my-3 border-t border-[#ECE8E3] relative flex items-center justify-center">
          <span className="bg-white px-2.5 text-[9px] uppercase tracking-widest text-[#9894AD] font-bold">✦</span>
        </div>
      );
      continue;
    }

    // Heading 1 (# Title)
    if (line.startsWith('# ')) {
      flushList();
      const text = line.replace('# ', '').replace(/\*\*/g, '').trim();
      renderedElements.push(
        <div key={`h1-${currentKey++}`} className="mt-3 mb-2 flex items-center gap-2 border-b border-[#ECE8E3] pb-2">
          <span className="w-2 h-5 rounded-full bg-gradient-to-b from-[#4239C4] to-[#7A5DBB]" />
          <h1 className="text-base md:text-lg font-black text-[#141226] tracking-tight">
            {text}
          </h1>
        </div>
      );
      continue;
    }

    // Heading 2 (## Subtitle)
    if (line.startsWith('## ')) {
      flushList();
      const text = line.replace('## ', '').replace(/\*\*/g, '').trim();
      renderedElements.push(
        <div key={`h2-${currentKey++}`} className="mt-3 mb-1.5 flex items-center gap-2">
          <span className="w-1.5 h-3.5 rounded-full bg-[#7A5DBB]" />
          <h2 className="text-xs md:text-sm font-extrabold text-[#141226] uppercase tracking-wider">
            {text}
          </h2>
        </div>
      );
      continue;
    }

    // Heading 3 (### Section)
    if (line.startsWith('### ')) {
      flushList();
      const text = line.replace('### ', '').replace(/\*\*/g, '').trim();
      renderedElements.push(
        <h3 key={`h3-${currentKey++}`} className="text-xs font-bold text-[#4239C4] mt-2.5 mb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4239C4]" />
          <span>{text}</span>
        </h3>
      );
      continue;
    }

    // Blockquote or Ad Copy Quotation (> "...")
    if (line.startsWith('>')) {
      flushList();
      const quoteText = line.replace(/^>\s*/, '').replace(/^"|"$/g, '').trim();
      renderedElements.push(
        <div
          key={`quote-${currentKey++}`}
          className="my-2 p-3 rounded-xl bg-gradient-to-br from-[#4239C4]/5 via-[#7A5DBB]/5 to-transparent border border-[#7A5DBB]/30 relative overflow-hidden group hover:border-[#4239C4]/50 transition-all"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <div className="w-5 h-5 rounded-md bg-[#4239C4]/10 text-[#4239C4] flex items-center justify-center shrink-0 mt-0.5">
                <Quote className="w-3 h-3" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-extrabold text-[#4239C4] uppercase tracking-wider block">
                  Copy Creative Snippet
                </span>
                <p className="text-xs font-semibold text-[#141226] italic leading-relaxed">
                  "{quoteText}"
                </p>
              </div>
            </div>

            {onCopySnippet && (
              <button
                type="button"
                onClick={() => onCopySnippet(quoteText)}
                className="opacity-80 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-white border border-[#ECE8E3] hover:bg-slate-50 text-[#4239C4] text-[10px] font-bold flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
                title="Copy snippet"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            )}
          </div>
        </div>
      );
      continue;
    }

    // Bullet List Item (*, -, •)
    if (line.startsWith('* ') || line.startsWith('- ') || line.startsWith('• ')) {
      inList = true;
      const contentText = line.replace(/^[\*\-•]\s+/, '');
      listItems.push(
        <li key={`li-${currentKey++}`} className="flex items-start gap-2 text-xs text-[#3E3A52] leading-relaxed">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7A5DBB] shrink-0 mt-1.5" />
          <div className="flex-1">{renderInlineText(contentText)}</div>
        </li>
      );
      continue;
    }

    // Numbered Item (1., 2.)
    if (/^\d+[\.\)]\s+/.test(line)) {
      flushList();
      const numMatch = line.match(/^(\d+)[\.\)]\s+/);
      const number = numMatch ? numMatch[1] : '1';
      const contentText = line.replace(/^\d+[\.\)]\s+/, '');
      renderedElements.push(
        <div key={`num-${currentKey++}`} className="flex items-start gap-2.5 my-1.5 p-2 rounded-lg bg-[#F7F6FA] border border-[#ECE8E3]">
          <span className="w-5 h-5 rounded-md bg-white text-[#4239C4] font-black text-[10px] flex items-center justify-center border border-[#ECE8E3] shrink-0">
            {number}
          </span>
          <div className="text-xs text-[#141226] leading-relaxed pt-0.5 flex-1">
            {renderInlineText(contentText)}
          </div>
        </div>
      );
      continue;
    }

    // Empty line
    if (!line) {
      flushList();
      continue;
    }

    // Regular Paragraph or Key-Value Line
    flushList();
    renderedElements.push(
      <p key={`p-${currentKey++}`} className="text-xs text-[#3E3A52] leading-relaxed my-1.5">
        {renderInlineText(line)}
      </p>
    );
  }

  flushList();
  flushTable();
  return <div className="space-y-1">{renderedElements}</div>;
}

// Helper to format inline bold, italic, and code blocks
function renderInlineText(text) {
  if (!text) return '';
  // Split on **bold**, `code`, or "quoted phrases"
  const parts = text.split(/(\*\*.*?\*\*|\`.*?\`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      // Check if it's a section tag like **PRIMARY TEXT** or **VARIATION 1**
      const isHeaderTag = /^[A-Z0-9\s\-_:]{3,}$/.test(inner);
      return (
        <strong
          key={idx}
          className={
            isHeaderTag
              ? 'font-black text-[#4239C4] uppercase tracking-wider text-[11px] inline-block mr-1'
              : 'font-extrabold text-[#141226]'
          }
        >
          {inner}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 text-[#4239C4] font-mono text-[11px]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
