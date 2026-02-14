"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Database, 
  Code2, 
  Terminal, 
  Server, 
  BookOpen, 
  ArrowRight,
  Cpu,
  Sparkles,
  Layers
} from "lucide-react";

// Update Type agar sesuai dengan struktur Tree dari Backend baru
type FileNode = {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
};

export default function LandingPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    
    fetch(`${API_URL}/api/docs`) // Gunakan template literal ``
      .then((res) => res.json())
      .then((data: FileNode[]) => {
        const categoryNames = data.map((node) => node.name);
        setCategories(categoryNames);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
        setIsLoading(false);
      });
  }, []);

  const getCategoryStyle = (name: string) => {
    const lower = name.toLowerCase();
    
    if (lower.includes("sql") || lower.includes("data")) {
      return {
        icon: <Database className="w-6 h-6" />,
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "group-hover:border-blue-500/50",
        shadow: "group-hover:shadow-blue-500/10"
      };
    }
    if (lower.includes("python") || lower.includes("js") || lower.includes("ts") || lower.includes("english")) {
      return {
        icon: <Code2 className="w-6 h-6" />,
        color: "text-yellow-600",
        bg: "bg-yellow-50",
        border: "group-hover:border-yellow-500/50",
        shadow: "group-hover:shadow-yellow-500/10"
      };
    }
    if (lower.includes("cmd") || lower.includes("bash") || lower.includes("terminal")) {
      return {
        icon: <Terminal className="w-6 h-6" />,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "group-hover:border-emerald-500/50",
        shadow: "group-hover:shadow-emerald-500/10"
      };
    }
    if (lower.includes("server") || lower.includes("net") || lower.includes("docker")) {
      return {
        icon: <Server className="w-6 h-6" />,
        color: "text-purple-600",
        bg: "bg-purple-50",
        border: "group-hover:border-purple-500/50",
        shadow: "group-hover:shadow-purple-500/10"
      };
    }
    return {
      icon: <Layers className="w-6 h-6" />,
      color: "text-slate-600",
      bg: "bg-slate-100",
      border: "group-hover:border-slate-400/50",
      shadow: "group-hover:shadow-slate-500/10"
    };
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100">
      
      <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-white to-[#F8FAFC] -z-10" />

      <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col items-center">
        
        <div className="text-center mb-16 max-w-3xl relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-6 border border-blue-100 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Sparkles className="w-3 h-3" />
                <span>AI-Supported Knowledge Hub</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
                Master your stack with <br/>
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">ASKH</span>
            </h1>
            
            <p className="text-lg text-slate-500 leading-relaxed mb-8">
                Your central hub for coding documentation, technical snippets, and guides. 
                Integrated with <strong>powerful AI</strong> to answer your questions instantly.
            </p>

            <div className="flex justify-center gap-4">
                <Link href="/docs" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Browse All Docs
                </Link>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            
            {isLoading && Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-56 bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse p-6 flex flex-col justify-between">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl mb-4"/>
                    <div className="space-y-2">
                        <div className="h-4 bg-slate-100 rounded w-1/2"/>
                        <div className="h-3 bg-slate-100 rounded w-3/4"/>
                    </div>
                </div>
            ))}

            {!isLoading && categories.map((cat) => {
                const style = getCategoryStyle(cat);
                return (
                    <Link 
                        href="/docs" 
                        key={cat}
                        className={`group relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${style.border} ${style.shadow} flex flex-col h-60`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl ${style.bg} ${style.color} transition-colors`}>
                                {style.icon}
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity -mr-2 -mt-2">
                                <ArrowRight className={`w-5 h-5 ${style.color}`} />
                            </div>
                        </div>

                        <div className="mt-auto">
                            <h2 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-slate-900">
                                {cat}
                            </h2>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Comprehensive documentation, code snippets, and best practices for {cat}.
                            </p>
                        </div>
                        
                        <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity ${style.bg}`} />
                    </Link>
                );
            })}

            {!isLoading && categories.length === 0 && (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                        <Cpu className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="font-medium">No categories found.</p>
                    <p className="text-sm mt-1">Try adding folders to your <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-600 text-xs">backend/data</code> directory.</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}