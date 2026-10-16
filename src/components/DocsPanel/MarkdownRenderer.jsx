import { useState } from 'react';
import { Copy, Check, Info, AlertTriangle, Lightbulb, CheckSquare, Square } from 'lucide-react';

function renderInline(text) {
  if (!text) return null;

  // Split tokens for bold, italic, code, strikethrough, and links
  const regex = /(\*\*.*?\*\*|\*.*?\*|~~.*?~~|`.*?`|\[.*?\]\(.*?\))/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (!part) return null;

    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-zinc-900">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="italic text-zinc-800">
          {part.slice(1, -1)}
        </em>
      );
    }

    if (part.startsWith('~~') && part.endsWith('~~')) {
      return (
        <del key={i} className="line-through text-zinc-400">
          {part.slice(2, -2)}
        </del>
      );
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 rounded-md font-mono text-[11px] bg-zinc-100 text-indigo-700 border border-zinc-200/80"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const match = part.match(/\[(.*?)\]\((.*?)\)/);
      if (match) {
        return (
          <a
            key={i}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 underline underline-offset-2 transition-colors"
          >
            {match[1]}
          </a>
        );
      }
    }

    return part;
  });
}

function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 text-zinc-200 font-mono text-[11px] shadow-sm">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[10px] text-zinc-400">
        <span className="uppercase tracking-wider font-semibold text-zinc-300">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
          title="Copy code"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto leading-relaxed text-zinc-300 scrollbar-thin">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function MarkdownRenderer({ content, onToggleTask }) {
  if (!content) {
    return (
      <div className="text-zinc-400 italic text-xs py-8 text-center">
        No notes yet. Click Edit to write documentation.
      </div>
    );
  }

  const lines = content.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced Code Block
    if (line.trim().startsWith('```')) {
      const language = line.trim().slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <CodeBlock
          key={`code-${elements.length}`}
          code={codeLines.join('\n')}
          language={language}
        />
      );
      continue;
    }

    // Callout / Alerts (> [!NOTE], > [!TIP], > [!WARNING])
    if (line.startsWith('> [!')) {
      const alertTypeMatch = line.match(/^>\s*\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]/i);
      const alertType = alertTypeMatch ? alertTypeMatch[1].toUpperCase() : 'NOTE';
      const quoteLines = [];
      i++;
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }

      let alertStyles = {
        bg: 'bg-indigo-50/70 border-indigo-200 text-indigo-900',
        badge: 'text-indigo-600',
        Icon: Info,
      };

      if (alertType === 'TIP') {
        alertStyles = {
          bg: 'bg-emerald-50/70 border-emerald-200 text-emerald-900',
          badge: 'text-emerald-600',
          Icon: Lightbulb,
        };
      } else if (alertType === 'WARNING' || alertType === 'CAUTION') {
        alertStyles = {
          bg: 'bg-amber-50/70 border-amber-200 text-amber-900',
          badge: 'text-amber-600',
          Icon: AlertTriangle,
        };
      }

      const { Icon } = alertStyles;

      elements.push(
        <div
          key={`alert-${elements.length}`}
          className={`my-3 p-3.5 rounded-xl border text-xs leading-relaxed ${alertStyles.bg}`}
        >
          <div className="flex items-center gap-1.5 font-semibold text-[11px] mb-1">
            <Icon size={14} className={alertStyles.badge} />
            <span>{alertType}</span>
          </div>
          <div className="pl-5 text-zinc-700">
            {quoteLines.map((ql, qIdx) => (
              <p key={qIdx}>{renderInline(ql)}</p>
            ))}
          </div>
        </div>
      );
      continue;
    }

    // Standard Blockquote
    if (line.startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      elements.push(
        <blockquote
          key={`quote-${elements.length}`}
          className="my-3 pl-3.5 border-l-2 border-indigo-500 text-zinc-600 italic text-xs leading-relaxed"
        >
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx}>{renderInline(ql)}</p>
          ))}
        </blockquote>
      );
      continue;
    }

    // Horizontal Rule
    if (/^(\*\*\*|---|___)$/.test(line.trim())) {
      elements.push(
        <hr key={`hr-${elements.length}`} className="my-4 border-zinc-200" />
      );
      i++;
      continue;
    }

    // Table
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const parseRow = (row) =>
          row
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim());

        const headers = parseRow(tableLines[0]);
        // line 1 is separator row |--|--|
        const bodyRows = tableLines.slice(2).map(parseRow);

        elements.push(
          <div
            key={`table-${elements.length}`}
            className="my-3 overflow-x-auto rounded-xl border border-zinc-200/90 shadow-xs"
          >
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  {headers.map((h, hIdx) => (
                    <th key={hIdx} className="px-3 py-2 font-semibold text-zinc-700">
                      {renderInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-zinc-50/60 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3 py-2 text-zinc-600">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // Task List Checkbox (- [ ] or - [x])
    const taskMatch = line.match(/^(\s*)-\s\[([ xX])\]\s(.*)$/);
    if (taskMatch) {
      const lineIdx = i;
      const checked = taskMatch[2].toLowerCase() === 'x';
      const text = taskMatch[3];

      elements.push(
        <div
          key={`task-${lineIdx}`}
          onClick={() => onToggleTask && onToggleTask(lineIdx)}
          className="flex items-start gap-2.5 my-1.5 py-0.5 cursor-pointer group select-none text-xs"
        >
          <button
            type="button"
            className="mt-0.5 flex-shrink-0 text-zinc-400 group-hover:text-indigo-600 transition-colors cursor-pointer"
          >
            {checked ? (
              <CheckSquare size={15} className="text-indigo-600 fill-indigo-50" />
            ) : (
              <Square size={15} />
            )}
          </button>
          <span
            className={`transition-colors ${
              checked ? 'line-through text-zinc-400' : 'text-zinc-700'
            }`}
          >
            {renderInline(text)}
          </span>
        </div>
      );
      i++;
      continue;
    }

    // Unordered List (- or *)
    if (/^(\s*)[-*]\s(.*)$/.test(line)) {
      const listItems = [];
      while (i < lines.length && /^(\s*)[-*]\s(.*)$/.test(lines[i])) {
        const itemText = lines[i].replace(/^(\s*)[-*]\s/, '');
        listItems.push(itemText);
        i++;
      }

      elements.push(
        <ul key={`ul-${elements.length}`} className="my-2 space-y-1 list-none pl-1">
          {listItems.map((item, itemIdx) => (
            <li key={itemIdx} className="flex items-start gap-2 text-xs text-zinc-700">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered List (1. 2.)
    if (/^\d+\.\s(.*)$/.test(line)) {
      const listItems = [];
      while (i < lines.length && /^\d+\.\s(.*)$/.test(lines[i])) {
        const itemText = lines[i].replace(/^\d+\.\s/, '');
        listItems.push(itemText);
        i++;
      }

      elements.push(
        <ol
          key={`ol-${elements.length}`}
          className="my-2 space-y-1 list-decimal pl-5 text-xs text-zinc-700"
        >
          {listItems.map((item, itemIdx) => (
            <li key={itemIdx} className="pl-1">
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(
        <h1
          key={`h1-${elements.length}`}
          className="text-base font-bold text-zinc-900 mt-4 mb-2 pb-1.5 border-b border-zinc-200"
        >
          {renderInline(line.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    if (line.startsWith('## ')) {
      elements.push(
        <h2
          key={`h2-${elements.length}`}
          className="text-sm font-bold text-zinc-900 mt-3.5 mb-1.5"
        >
          {renderInline(line.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    if (line.startsWith('### ')) {
      elements.push(
        <h3
          key={`h3-${elements.length}`}
          className="text-xs font-semibold uppercase tracking-wider text-indigo-700 mt-3 mb-1"
        >
          {renderInline(line.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    // Paragraph or Empty Line
    if (line.trim() === '') {
      elements.push(<div key={`empty-${elements.length}`} className="h-2" />);
    } else {
      elements.push(
        <p key={`p-${elements.length}`} className="text-xs leading-relaxed text-zinc-700 my-1">
          {renderInline(line)}
        </p>
      );
    }

    i++;
  }

  return <div className="space-y-0.5 select-text">{elements}</div>;
}
