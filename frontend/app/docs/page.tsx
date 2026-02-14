"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { 
  BookOpen, 
  MessageSquare, 
  Send, 
  Bot, 
  Loader2,
  X,
  FileText,
  ChevronRight,
  ChevronDown,
  Folder,
  Menu 
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; 
import remarkBreaks from "remark-breaks"; 
import rehypeRaw from "rehype-raw";    

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

type FileNode = {
  name: string;
  displayName?: string;
  type: "file" | "folder";
  path?: string;
  children?: FileNode[];
};

type Message = { role: "user" | "ai"; content: string };

type CodeProps = {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
} & React.ComponentPropsWithoutRef<"code">;

const SidebarItem = ({ 
  node, 
  depth = 0, 
  onSelectFile, 
  selectedPath 
}: { 
  node: FileNode; 
  depth?: number; 
  onSelectFile: (path: string) => void;
  selectedPath: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (node.type === "folder") {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          <Folder className="w-4 h-4 text-blue-500 fill-blue-50" />
          <span className="truncate">{node.name}</span>
        </button>
        
        {isOpen && node.children && (
          <div className="mt-1">
            {node.children.map((child, idx) => (
              <SidebarItem 
                key={idx} 
                node={child} 
                depth={depth + 1} 
                onSelectFile={onSelectFile}
                selectedPath={selectedPath}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => node.path && onSelectFile(node.path)}
      className={`flex items-center gap-2 w-full text-left px-2 py-1.5 text-sm rounded-md transition-all ${
        selectedPath === node.path 
          ? "bg-blue-100 text-blue-700 font-medium" 
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      }`}
      style={{ paddingLeft: `${depth * 12 + 20}px` }}
    >
      <FileText className={`w-3.5 h-3.5 ${selectedPath === node.path ? "text-blue-600" : "text-slate-400"}`} />
      <span className="truncate">
        {node.displayName || node.name.replace(".md", "")}
      </span>
    </button>
  );
};

export default function DocsPage() {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<{ path: string; content: string; title: string }>({ path: "", content: "", title: "" });
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hello! I am your AI assistant. Select a topic from the sidebar if you need help." }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    
    fetch(`${API_URL}/api/docs`)
      .then(res => res.json())
      .then(data => setFileTree(data))
      .catch(err => console.error("Failed to load docs:", err));
  }, []);

  const loadDoc = async (path: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const encodedPath = encodeURIComponent(path);
      const res = await fetch(`${API_URL}/api/docs/content?path=${encodedPath}`);
      
      if (!res.ok) throw new Error("File not found");
      const data = await res.json();

      const findNode = (nodes: FileNode[]): string => {
        for (const node of nodes) {
            if (node.path === path) return node.displayName || node.name.replace(".md", "");
            if (node.children) {
                const found = findNode(node.children);
                if (found) return found;
            }
        }
        return path.split('/').pop()?.replace(".md", "") || "Document";
      };

      const docTitle = findNode(fileTree);
      setSelectedDoc({ path, content: data.content, title: docTitle });
      
      setIsSidebarOpen(false);
    } catch (err) {
      console.error("Failed to load content:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setInput("");
    setIsTyping(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", content: data.response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "ai", content: "Sorry, connection to AI failed." }]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex h-screen bg-white text-slate-900 overflow-hidden font-sans relative">
      
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 bg-slate-50 border-r border-slate-200 flex flex-col shadow-xl lg:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="ASKH Logo" width={32} height={32} className="w-8 h-8" />
            <span className="font-bold text-lg tracking-tight text-slate-800">ASKH Docs</span>
          </div>
          
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {fileTree.length === 0 ? (
            <div className="text-xs text-slate-400 text-center mt-10">
              Loading folder structure...
            </div>
          ) : (
            fileTree.map((node, idx) => (
              <SidebarItem 
                key={idx} 
                node={node} 
                onSelectFile={loadDoc}
                selectedPath={selectedDoc.path}
              />
            ))
          )}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col relative min-w-0 w-full">
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 bg-white sticky top-0 z-10">
          
          <div className="flex items-center gap-3 overflow-hidden">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-sm text-slate-500 overflow-hidden">
              <span className="hidden sm:inline hover:text-slate-800 cursor-pointer">Docs</span>
              <ChevronRight className="hidden sm:block w-4 h-4 text-slate-300 shrink-0" />
              <span className="text-slate-900 font-medium truncate">
                {selectedDoc.title || "Select Topic"}
              </span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium transition-all shadow-sm border ${
              isChatOpen 
                ? "bg-blue-50 text-blue-600 border-blue-200" 
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">{isChatOpen ? "Close AI" : "Ask AI"}</span>
            <span className="sm:hidden">AI</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-12 scroll-smooth">
          <div className="max-w-4xl mx-auto">
            {selectedDoc.content ? (
              <article className="pb-20 text-slate-700 leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]} 
                  rehypePlugins={[rehypeRaw]} 
                  components={{
                    h1: ({...props}) => <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-6 border-b pb-2 mt-8" {...props} />,
                    h2: ({...props}) => <h2 className="text-xl lg:text-2xl font-bold text-slate-800 mb-4 mt-10" {...props} />,
                    h3: ({...props}) => <h3 className="text-lg lg:text-xl font-semibold text-slate-800 mb-3 mt-8" {...props} />,
                    p: ({...props}) => <p className="mb-4 leading-7" {...props} />,
                    ul: ({...props}) => <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />,
                    ol: ({...props}) => <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />,
                    li: ({...props}) => <li className="pl-1" {...props} />,
                    blockquote: ({...props}) => <blockquote className="border-l-4 border-blue-500 pl-4 py-1 my-4 bg-slate-50 italic text-slate-600 rounded-r" {...props} />,
                    strong: ({...props}) => <strong className="font-semibold text-slate-900" {...props} />,
                    
                    code({inline, className, children, ...props}: CodeProps) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <div className="rounded-lg overflow-hidden shadow-lg my-6 border border-slate-700 max-w-full">
                          <div className="bg-[#1e1e1e] px-4 py-2 text-xs text-slate-400 flex justify-between border-b border-slate-700">
                            <span>{match[1].toUpperCase()}</span>
                          </div>
                          <div className="overflow-x-auto">
                            <SyntaxHighlighter
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              style={vscDarkPlus as any} 
                              language={match[1]}
                              PreTag="div"
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              customStyle={{ margin: 0, borderRadius: 0, fontSize: '0.85rem' } as any}
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          </div>
                        </div>
                      ) : (
                        <code className="bg-slate-100 text-pink-600 px-1.5 py-0.5 rounded text-sm font-mono border border-slate-200 break-all" {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                  {selectedDoc.content}
                </ReactMarkdown>
              </article>
            ) : (
              <div className="h-[60vh] flex flex-col items-center justify-center text-slate-400 space-y-4 px-4 text-center">
                <div className="bg-slate-50 p-6 rounded-full">
                  <BookOpen className="w-12 h-12 text-slate-300" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-600">Welcome to ASKH Docs</h2>
                  <p className="text-sm mt-2">
                    <span className="lg:hidden">Tap the menu button at top left</span>
                    <span className="hidden lg:inline">Select a topic from the sidebar</span> 
                    {" "}to start reading.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {isChatOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[1px]">
            <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl flex flex-col w-full max-w-lg h-150 max-h-[90vh] overflow-hidden font-sans animate-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 p-1.5 rounded-lg">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">ASKH Assistant</h3>
                    <p className="text-[10px] text-slate-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
                      Online • AI
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/10 p-1 rounded transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.role === 'ai' && (
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mr-2 mt-1">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      m.role === 'user' 
                        ? 'bg-slate-900 text-white rounded-br-none' 
                        : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                    }`}>
                      <ReactMarkdown 
                          remarkPlugins={[remarkGfm, remarkBreaks]}
                          components={{
                              p: ({...props}) => <p className="mb-1 last:mb-0" {...props} />
                          }}
                      >
                          {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 ml-8">
                    <Loader2 className="w-3 h-3 animate-spin text-blue-500"/>
                    Typing...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white">
                <div className="flex gap-2 relative">
                  <input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask something..."
                    className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-10"
                  />
                  <button 
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}