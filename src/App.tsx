import React, { useState, useEffect, useRef } from "react";
import { 
  Home as HomeIcon, 
  BookOpen, 
  Newspaper, 
  Database, 
  Terminal, 
  Info, 
  Clock, 
  Search, 
  ChevronRight, 
  X, 
  Send, 
  Loader2, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  ExternalLink,
  SlidersHorizontal,
  Bookmark,
  FileText,
  RefreshCw,
  Award
} from "lucide-react";
import { 
  SEED_COURSES, 
  SEED_NEWS, 
  SEED_REPORTS, 
  PROMPT_TEMPLATES, 
  Course, 
  NewsArticle, 
  Report, 
  ChatMessage 
} from "./types";

// Enhanced courses with custom cost values
interface EnhancedCourse extends Course {
  costType: "무료" | "유료";
}

const ENHANCED_COURSES: EnhancedCourse[] = SEED_COURSES.map(course => {
  // Public/K-MOOC and AI Innovator are free, private/productivity masterclasses are paid
  const isFree = course.provider.includes("K-MOOC") || course.provider.includes("CSES") || course.id % 2 === 1;
  return {
    ...course,
    costType: isFree ? "무료" : "유료"
  };
});

export default function App() {
  // --------------------------------------------------
  // 1. App Navigation & Theme State
  // --------------------------------------------------
  const [activeTab, setActiveTab] = useState<"Home" | "DailyNews" | "AIClassroom" | "DeepInsight">("Home");
  const [time, setTime] = useState<Date>(new Date());
  
  // Real-time Clock synchronization
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --------------------------------------------------
  // 2. Naver News Search API States & Fetcher
  // --------------------------------------------------
  const [naverNews, setNaverNews] = useState<any[]>([]);
  const [naverSearchQuery, setNaverSearchQuery] = useState<string>("사회적가치 인공지능");
  const [isNaverNewsLoading, setIsNaverNewsLoading] = useState<boolean>(false);

  const fetchNaverNews = async (queryText: string) => {
    setIsNaverNewsLoading(true);
    try {
      const response = await fetch(`/api/naver-news?query=${encodeURIComponent(queryText)}&display=30`);
      if (response.ok) {
        const data = await response.json();
        setNaverNews(data.items || []);
      } else {
        console.warn("Failed to load Naver news, fallback to local SEED_NEWS.");
        // Re-use SEED_NEWS formatted consistently
        setLocalFallbackNews();
      }
    } catch (err) {
      console.error("Error calling Naver News API:", err);
      setLocalFallbackNews();
    } finally {
      setIsNaverNewsLoading(false);
    }
  };

  const setLocalFallbackNews = () => {
    // Map existing SEED_NEWS articles to match Naver API format
    const formatted = SEED_NEWS.map(n => ({
      title: n.title,
      description: n.description,
      pubDate: n.publishedAt,
      source: n.source,
      origin: n.category === "지역혁신" || n.category === "AI/SV" ? "국내" : "해외",
      link: "https://www.cses.re.kr"
    }));
    setNaverNews(formatted);
  };

  useEffect(() => {
    fetchNaverNews(naverSearchQuery);
  }, [naverSearchQuery]);

  // Helper: Group news by publication date (YYYY-MM-DD or YYYY년 MM월 DD일)
  const groupNewsByDate = (newsList: any[]) => {
    if (!Array.isArray(newsList)) return {};
    const sorted = [...newsList].sort((a, b) => {
      const dateA = typeof a?.pubDate === "string" ? a.pubDate : "";
      const dateB = typeof b?.pubDate === "string" ? b.pubDate : "";
      return dateB.localeCompare(dateA);
    });
    const groups: { [key: string]: any[] } = {};
    
    sorted.forEach(item => {
      if (!item) return;
      let dateLabel = "2026년 06월 23일";
      if (typeof item.pubDate === "string") {
        const parts = item.pubDate.split("-");
        if (parts.length === 3) {
          dateLabel = `${parts[0]}년 ${parseInt(parts[1])}월 ${parseInt(parts[2])}일`;
        } else {
          // handles alternative date formats gracefully
          dateLabel = item.pubDate;
        }
      }
      if (!groups[dateLabel]) {
        groups[dateLabel] = [];
      }
      groups[dateLabel].push(item);
    });
    return groups;
  };

  const groupedNews = groupNewsByDate(naverNews);

  // --------------------------------------------------
  // 3. Platform Guide Modal State
  // --------------------------------------------------
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // --------------------------------------------------
  // 4. Custom AI Classroom Explorer & Chatbot State
  // --------------------------------------------------
  const [searchCourseQuery, setSearchCourseQuery] = useState<string>("");
  const [filterLevel, setFilterLevel] = useState<string>("전체");
  const [filterProvider, setFilterProvider] = useState<string>("전체");
  
  // Survey/Diagnostics state variables
  const [isSurveyOpen, setIsSurveyOpen] = useState<boolean>(false);
  const [surveyStep, setSurveyStep] = useState<number>(1);
  const [surveyAnswers, setSurveyAnswers] = useState({
    level: "",
    topic: "",
    skill: ""
  });
  const [diagnosedCourseIds, setDiagnosedCourseIds] = useState<number[]>([]);

  const handleStartSurvey = () => {
    setSurveyAnswers({ level: "", topic: "", skill: "" });
    setSurveyStep(1);
    setIsSurveyOpen(true);
  };

  const handleSurveyOption = (field: "level" | "topic" | "skill", value: string) => {
    const updated = { ...surveyAnswers, [field]: value };
    setSurveyAnswers(updated);
    
    if (surveyStep < 3) {
      setSurveyStep(prev => prev + 1);
    } else {
      // Calculate matching course recommendations
      calculateDiagnostics(updated);
      setSurveyStep(4);
    }
  };

  const calculateDiagnostics = (answers: typeof surveyAnswers) => {
    const matches = ENHANCED_COURSES.filter(course => {
      const matchLevel = course.level === answers.level;
      const matchTopic = course.category.includes(answers.topic) || 
                         (answers.topic === "사회공헌" && course.category === "사회공헌") ||
                         (answers.topic === "ESG 공시" && course.category === "ESG 공시") ||
                         (answers.topic === "지역혁신" && course.category === "지역혁신");
      const matchTags = course.tags.some(t => t.includes(answers.skill));
      return matchLevel || matchTopic || matchTags;
    });

    const ids = matches.length > 0 ? matches.map(c => c.id) : [101, 103];
    setDiagnosedCourseIds(ids);
  };

  const clearDiagnosticsFilter = () => {
    setDiagnosedCourseIds([]);
    setIsSurveyOpen(false);
  };

  // AI Dialog Chatbot States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "cur-wel-msg",
      role: "model",
      content: `반갑습니다. **사회적가치연구원(CSES) AI 큐레이션 수석 코치**입니다.\n\n연구원님의 실질적인 업무 전문성(예: SROI 화폐계측, GRI 표준 준수 등)을 고도화할 수 있도록 지원합니다. 궁금한 교육 내용이나 필요한 자원 분류를 질문해 주세요!`,
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState<string>("");
  const [activeCourseChat, setActiveCourseChat] = useState<EnhancedCourse | null>(null);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);
    const textToSend = chatInput;
    setChatInput("");

    try {
      const history = chatMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/education/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          chatHistory: history,
          selectedCourseContext: activeCourseChat
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: "model",
            content: data.reply,
            timestamp: new Date()
          }
        ]);
        if (data.recommendedCourseIds) {
          setDiagnosedCourseIds(data.recommendedCourseIds);
        }
      } else {
        throw new Error();
      }
    } catch {
      // Fallback
      setChatMessages(prev => [
        ...prev,
        {
          id: `ai-fail-${Date.now()}`,
          role: "model",
          content: `[임시 로컬 데이터 복구 서비스 가동]\n\n연구원님께서 문의하신 **"${textToSend}"** 주제는 우리 연구원의 주요 연구 분야와 밀접합니다. 하단 교육 대시보드 리스트에서 수준별 ESG 및 공익 가치 과정을 찾아보세요.`,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // --------------------------------------------------
  // 5. Deep Insight Modal & API state (News summary, prompts, report DB)
  // --------------------------------------------------
  const [selectedNews, setSelectedNews] = useState<any | null>(null);
  const [isSummarizingNews, setIsSummarizingNews] = useState<boolean>(false);
  const [newsSummaryResult, setNewsSummaryResult] = useState<{
    oneLine: string;
    description: string;
  } | null>(null);

  const handleOpenNewsDetail = async (newsItem: any) => {
    setSelectedNews(newsItem);
    setNewsSummaryResult(null);
    setIsSummarizingNews(true);

    try {
      const res = await fetch("/api/news/one-line-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newsItem.title,
          description: newsItem.description,
          content: newsItem.description // Fallback to description for content since Naver is concise
        })
      });

      if (res.ok) {
        const data = await res.json();
        setNewsSummaryResult({
          oneLine: data.oneLineSummary,
          description: data.contextHighlight
        });
      } else {
        throw new Error();
      }
    } catch {
      setNewsSummaryResult({
        oneLine: `"${newsItem.title}" 핵심 트렌드 브리핑`,
        description: `[서버 대체 구동] Naver 검색 및 사회공헌/ESG 동향 뉴스입니다. 본 정보는 최신 AI 기술 도입과 지속 가능한 SROI 공시 표준에 발맞추어 학술적으로 매우 비중 있는 의제로 관측해야 합니다.`
      });
    } finally {
      setIsSummarizingNews(false);
    }
  };

  // Prompt Executor States
  const [activePromptTemplate, setActivePromptTemplate] = useState<string>("translator");
  const [promptInputText, setPromptInputText] = useState<string>("");
  const [promptExecutionResult, setPromptExecutionResult] = useState<string>("");
  const [isPromptLoading, setIsPromptLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleExecutePrompt = async () => {
    if (!promptInputText.trim() || isPromptLoading) return;
    setIsPromptLoading(true);
    setPromptExecutionResult("");

    try {
      const res = await fetch("/api/prompt/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: activePromptTemplate,
          userContent: promptInputText
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPromptExecutionResult(data.result || "");
      } else {
        throw new Error();
      }
    } catch {
      setPromptExecutionResult(`[임시 결과 대체 안내]\n\n입력 내용:\n"${promptInputText}"\n\n현재 대행 점검 상태입니다. 번역 및 기획서 고도화를 완수하려면 Gemini API 키를 로드해 주십시오. 임시 보완 가이드는 우클릭 복사 후 실무에 대입해 보시는 것을 권장합니다.`);
    } finally {
      setIsPromptLoading(false);
    }
  };

  const currentTemplateObj = PROMPT_TEMPLATES.find(t => t.id === activePromptTemplate) || PROMPT_TEMPLATES[0];

  const handleCopyToClipboard = (text: string) => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(text)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 1500);
        })
        .catch((err) => {
          console.error("Failed to copy using navigator.clipboard:", err);
          fallbackCopyText(text);
        });
    } else {
      fallbackCopyText(text);
    }
  };

  const fallbackCopyText = (text: string) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (successful) {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 1500);
      } else {
        console.warn("execCommand copy fallback failed");
      }
    } catch (err) {
      console.error("Fallback copy failed:", err);
    }
  };

  // Report SROI Archive States
  const [reportSearchQuery, setReportSearchQuery] = useState<string>("");
  const [reportFilterCategory, setReportFilterCategory] = useState<string>("전체");
  const [reportSortKey, setReportSortKey] = useState<"downloads" | "publishedYear">("downloads");

  const filteredReports = SEED_REPORTS.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(reportSearchQuery.toLowerCase()) || 
                        r.abstract.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
                        r.institution.toLowerCase().includes(reportSearchQuery.toLowerCase()) ||
                        r.tags.some(t => t.toLowerCase().includes(reportSearchQuery.toLowerCase()));
    const matchCat = reportFilterCategory === "전체" || 
                     (reportFilterCategory === "국내" && r.category === "국내") ||
                     (reportFilterCategory === "국외" && r.category === "국외");
    return matchSearch && matchCat;
  }).sort((a, b) => b[reportSortKey] - a[reportSortKey]);

  // Download DB Table as clean Excel CSV spreadsheet
  const handleDownloadCSV = () => {
    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "ID,문서 제목,발행 기관,구분,발행년도,다운로드수,파일 크기,핵심 내용\n";
    
    filteredReports.forEach(r => {
      const row = [
        r.id,
        `"${r.title.replace(/"/g, '""')}"`,
        `"${r.institution.replace(/"/g, '""')}"`,
        r.category,
        r.publishedYear,
        r.downloads,
        r.fileSize,
        `"${r.abstract.replace(/"/g, '""')}"`
      ].join(",");
      csvContent += row + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CSES_AI_DB_Export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --------------------------------------------------
  // 6. UI Navigation Rendering Logic
  // --------------------------------------------------
  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans selection:bg-brand-100 selection:text-brand-900" id="cses-app-container">
      
      {/* --------------------------------------------------
          LEFT SIDEBAR NAVIGATION (Strict constraint)
          -------------------------------------------------- */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200/80 shrink-0 min-h-screen relative z-10 shadow-sm" id="cses-sidebar-desktop">
        
        {/* Brand Header */}
        <div className="p-6 pb-5 border-b border-slate-100 flex flex-col gap-3">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab("Home")}>
            <div className="w-9 h-9 rounded-xl bg-[#D20A50] text-white flex items-center justify-center font-black text-sm shadow-md shadow-pink-200">
              AI
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-[#D20A50]">
                CSES AI Hub
              </span>
              <span className="text-[9px] text-slate-400 font-mono font-bold tracking-widest leading-none mt-1 uppercase">
                RESEARCH SUPPORT SYSTEM
              </span>
            </div>
          </div>
        </div>

        {/* Brand Slogan Block */}
        <div className="mx-6 my-4 p-4 rounded-2xl bg-pink-50/40 border border-brand-100/30 text-start">
          <span className="text-[10px] font-extrabold text-[#D20A50] uppercase tracking-wider block mb-1">SLOGAN</span>
          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            AI로 그리는 사회적 가치의 미래,<br />
            연구원을 위한 스마트 리서치 파트너
          </p>
        </div>

        {/* Nav tabs list */}
        <div className="flex-grow px-4 py-2 space-y-1.5 overflow-y-auto">
          {[
            { id: "Home" as const, label: "홈", icon: HomeIcon, desc: "Bento 대시보드" },
            { id: "DailyNews" as const, label: "일자별 뉴스 아카이브", icon: Newspaper, desc: "네이버 연합 실시간 검색" },
            { id: "AIClassroom" as const, label: "맞춤형 AI 강의실", icon: BookOpen, desc: "수준별 강좌 및 AI 코치" },
            { id: "DeepInsight" as const, label: "심층 인사이트 메뉴", icon: Terminal, desc: "프롬프트 실무 & DB 조회" }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl transition duration-200 group cursor-pointer text-start ${
                  isActive 
                    ? "bg-[#D20A50] text-white shadow-md shadow-pink-900/10 font-bold" 
                    : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`} />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold leading-normal">{tab.label}</span>
                    <span className={`text-[9px] ${isActive ? "text-pink-100/80" : "text-slate-400"}`}>{tab.desc}</span>
                  </div>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? "text-white" : "text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5"}`} />
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer with system diagnostics */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 space-y-2 font-mono">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-400 font-bold uppercase tracking-wider">SYSTEM STATUS</span>
            <span className="flex items-center gap-1 font-bold text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              ONLINE
            </span>
          </div>
          <div className="space-y-1 text-[10.5px]">
            <div className="flex justify-between">
              <span>LOCAL TIME:</span>
              <span className="text-slate-800 font-bold text-right leading-none">
                {time.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>UTC OFFSET:</span>
              <span className="text-slate-800">KST (UTC+09)</span>
            </div>
          </div>
          <p className="text-[9px] text-slate-400 border-t border-slate-200/50 pt-2 text-center text-sans font-medium">
            © 2026 CSES AI HUB
          </p>
        </div>
      </aside>

      {/* --------------------------------------------------
          MAIN WORKSPACE LAYOUT Panel Container
          -------------------------------------------------- */}
      <div className="flex-grow flex flex-col min-w-0 max-w-full overflow-hidden" id="cses-main-panel">
        
        {/* TOP COMPONENT: GNB Header bar for search, timing, and mobile layout */}
        <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20 px-4 md:px-8 h-18 flex items-center justify-between shadow-sm">
          
          {/* Logo element for mobile / tablet layout */}
          <div className="flex items-center gap-3 lg:hidden">
            <button 
              onClick={() => setActiveTab("Home")}
              className="w-8 h-8 rounded-lg bg-[#D20A50] text-white flex items-center justify-center font-bold text-xs"
            >
              AI
            </button>
            <span className="font-extrabold text-[#D20A50] text-sm tracking-tight sm:inline hidden">
              CSES AI Hub
            </span>
          </div>

          <div className="hidden lg:block">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              {activeTab === "Home" && "연구 종합 대시보드"}
              {activeTab === "DailyNews" && "일자별 뉴스 아카이브"}
              {activeTab === "AIClassroom" && "맞춤형 AI 강의실"}
              {activeTab === "DeepInsight" && "심층 인사이트 메뉴"}
            </h2>
          </div>

          {/* Quick Search & Platform guide button */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="relative w-44 sm:w-56 md:w-64">
              <input 
                type="text" 
                placeholder="Naver 뉴스 검색어..." 
                value={naverSearchQuery}
                onChange={(e) => setNaverSearchQuery(e.target.value)}
                className="w-full bg-slate-100 text-xs px-4 py-2.5 pr-10 rounded-xl border border-transparent outline-none focus:bg-white focus:border-[#D20A50] transition-all text-slate-700 font-sans font-medium"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <button 
              onClick={() => setIsGuideOpen(true)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200/80 hover:text-[#D20A50] transition cursor-pointer"
            >
              <Info className="w-4 h-4 text-[#D20A50]" />
              <span className="hidden sm:inline">이용 가이드</span>
            </button>
          </div>
        </header>

        {/* Mobile quick tabs sidebar backup */}
        <nav className="lg:hidden flex items-center justify-around bg-white border-b border-slate-100 px-2 py-2.5">
          {[
            { id: "Home" as const, icon: HomeIcon, text: "홈" },
            { id: "DailyNews" as const, icon: Newspaper, text: "뉴스" },
            { id: "AIClassroom" as const, icon: BookOpen, text: "강의실" },
            { id: "DeepInsight" as const, icon: Terminal, text: "인사이트" }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl cursor-pointer ${
                  isActive ? "text-[#D20A50] font-bold" : "text-slate-400"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-bold">{tab.text}</span>
              </button>
            );
          })}
        </nav>

        {/* --------------------------------------------------
            PAGE VIEW CONTROLLER: Full Content rendering
            -------------------------------------------------- */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 max-w-7xl w-full mx-auto" id="cses-scroll-viewport">
          
          {/* TAB 1: Home Dashboard inside Bento Grid Layout */}
          {activeTab === "Home" && (
            <div className="space-y-6" id="view-dashboard-home">
              
              {/* Custom Welcome card with brand points */}
              <div 
                className="relative overflow-hidden bg-gradient-to-br from-[#D20A50] via-[#b80543] to-[#800028] text-white rounded-[32px] p-6 md:p-8 shadow-lg shadow-pink-900/10"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-4 max-w-2xl text-start">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-white/15 text-pink-100 border border-white/25">
                    <Sparkles className="w-3.5 h-3.5 text-pink-200 animate-pulse" />
                    SPECIAL SUITE
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug">
                    AI로 그리는 사회적 가치의 미래,<br />
                    연구원을 위한 스마트 리서치 파트너
                  </h1>
                  <p className="text-pink-100/90 text-xs leading-relaxed max-w-xl">
                    사회적가치연구원(CSES)의 전문 축적 지식 데이터베이싱과 실시간 네이버 뉴스 API 융합 및 Gemini LLM 요약 기술을 결합하여 고품격 학술 리포트 작성을 지원합니다.
                  </p>
                </div>
              </div>

              {/* BENTO GRID (Academic layout - high hierarchical precision) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* CARD 1: Today's AI Insight (Bento lg:col-span-12 or 7) */}
                <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 text-start">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-[#D20A50] uppercase tracking-wider block bg-pink-100/60 px-2.5 py-1 rounded-lg">
                        Today's AI Insight
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono tracking-tight">Today: {time.toLocaleDateString("ko-KR")}</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug">
                      인공지능(AI)과 SROI 화폐계측 알고리즘의 심층 결합 동향
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      최근 글로벌 ESG 공시 표준(GRI, ISSB)의 고도화 흐름 속에서, 기업의 환경 사회 공헌 비용 및 온실가스 저감 활동을 <b>사회적 투자수익률(SROI) 화폐액</b>으로 기계 자동 변환하는 RAG 기반 LLM 알고리즘이 크게 도약하고 있습니다. 
                      연구원의 고질적인 수작업 시트 수치 검증 절차가 지능화되어 데이터 일관성 정밀 제고가 실현되고 있습니다.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-[#D20A50]" />
                      <span>추천 인사이트 매칭</span>
                    </div>
                    <button 
                      onClick={() => setActiveTab("DeepInsight")}
                      className="text-xs text-[#D20A50] font-bold hover:underline inline-flex items-center gap-0.5"
                    >
                      심층 분석도구 사용 <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* CARD 3: CTA Diagnostic survey button (Bento lg:col-span-5) */}
                <div 
                  className="lg:col-span-5 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden text-start group border border-slate-800"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
                  <div className="space-y-2 relative z-10">
                    <span className="inline-block bg-white/15 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      큐레이션 자가진단
                    </span>
                    <h3 className="text-lg font-black tracking-tight leading-snug">
                      내 실무에 즉시 통하는<br />
                      AI 교육 커리큘럼 추천
                    </h3>
                    <p className="text-[11.5px] text-slate-300 leading-relaxed font-sans">
                      학술 설계, SROI 정량 계측, RAG 임팩트 프롬프팅 중 연구원님의 레벨과 현재 목적에 알맞는 온·오프라인 강좌를 스마트하게 진출해 드립니다.
                    </p>
                  </div>
                  
                  <div className="pt-4 relative z-10">
                    <button 
                      onClick={handleStartSurvey}
                      className="w-full bg-[#D20A50] hover:bg-pink-600 text-white text-xs font-black py-3.5 p-4 rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer transform group-hover:scale-[1.02]"
                    >
                      나의 레벨과 목적에 맞는 강의 추천받기 🎯
                    </button>
                  </div>
                </div>

                {/* CARD 2: Daily News list scroll box (Bento lg:col-span-6) */}
                <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between text-start">
                  <div className="space-y-3 flex-grow flex flex-col min-h-0">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 flex items-center justify-center rounded-lg bg-pink-50 text-[#D20A50]">
                          <Newspaper className="w-3.5 h-3.5" />
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">일자별 뉴스 실시간 피드</h4>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Query: "{naverSearchQuery}"</span>
                    </div>

                    {/* Scrollable list grouped by dates */}
                    <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1 flex-grow scrollbar-thin">
                      {isNaverNewsLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
                          <Loader2 className="w-8 h-8 animate-spin text-[#D20A50]" />
                          <span>네이버 뉴스 취합 중...</span>
                        </div>
                      ) : Object.keys(groupedNews).length > 0 ? (
                        Object.entries(groupedNews).map(([date, articles]) => (
                          <div key={date} className="space-y-2 border-b border-slate-100/50 pb-3 last:border-0 last:pb-0">
                            {/* Date Group Division line as specified */}
                            <div className="sticky top-0 bg-white/95 backdrop-blur-xs py-1 z-5 flex items-center gap-2">
                              <span className="text-[11px] font-extrabold text-slate-900 font-sans tracking-tight bg-slate-100 px-2 py-0.5 rounded">
                                📅 {date}
                              </span>
                              <div className="flex-grow h-[1px] bg-slate-200/60" />
                            </div>

                            {/* News articles for this date group */}
                            <div className="space-y-2 pl-2">
                              {articles.slice(0, 3).map((news, idx) => {
                                const isOverseas = news.origin === "해외";
                                return (
                                  <div 
                                    key={idx}
                                    onClick={() => handleOpenNewsDetail(news)}
                                    className="group cursor-pointer p-2 rounded-xl hover:bg-pink-50/20 transition-all text-start"
                                  >
                                    <h5 className="text-xs font-bold text-slate-800 leading-snug group-hover:text-[#D20A50] transition-colors flex items-start gap-1">
                                      <span className={`text-[10px] shrink-0 font-extrabold px-1.5 py-0.2 rounded mt-0.5 ${
                                        isOverseas ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                                      }`}>
                                        {isOverseas ? "[해외]" : "[국내]"}
                                      </span>
                                      <span className="line-clamp-2">{(news.title || "").replace(/<b>/g, "").replace(/<\/b>/g, "")}</span>
                                    </h5>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-1 pl-1">
                                      <span>출처: {news.source}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-20 text-center text-xs text-slate-400">
                          실시간 검색 뉴스가 존재하지 않습니다.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                    <button 
                      onClick={() => setActiveTab("DailyNews")}
                      className="text-xs text-[#D20A50] font-bold hover:underline cursor-pointer"
                    >
                      전체 아카이브 및 실시간 요약 엔진 →
                    </button>
                  </div>
                </div>

                {/* CARD 4: Recommended course list (Bento lg:col-span-6) */}
                <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between text-start">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 flex items-center justify-center rounded-lg bg-pink-50 text-[#D20A50]">
                          <BookOpen className="w-3.5 h-3.5" />
                        </span>
                        <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">추천 학술 교육 과정</h4>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">인기순</span>
                    </div>

                    {/* Course list representation with clear badges as specified */}
                    <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-1">
                      {ENHANCED_COURSES.slice(0, 4).map((c) => {
                        const isPrimaryHighlight = diagnosedCourseIds.length > 0 && diagnosedCourseIds.includes(c.id);
                        return (
                          <div 
                            key={c.id}
                            className={`p-3.5 rounded-2xl border transition relative overflow-hidden cursor-pointer ${
                              isPrimaryHighlight 
                                ? "bg-pink-50/50 border-brand-200 font-medium" 
                                : "bg-slate-50/60 border-slate-200/60 hover:border-slate-300"
                            }`}
                            onClick={() => {
                              setActiveCourseChat(c);
                              setActiveTab("AIClassroom");
                            }}
                          >
                            <div className="flex justify-between items-start gap-2 mb-1.5">
                              <h5 className="text-xs font-black text-slate-900 leading-tight">
                                {c.title}
                              </h5>
                              <span className={`text-[10px] font-bold shrink-0 px-2 py-0.5 rounded-md ${
                                c.costType === "무료" ? "bg-emerald-100 text-emerald-800" : "bg-purple-100 text-purple-800"
                              }`}>
                                {c.costType}
                              </span>
                            </div>
                            
                            <p className="text-[11px] text-slate-500 line-clamp-1 leading-normal mb-2">
                              {c.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-mono">
                              <span className="bg-slate-200/60 text-slate-700 px-1.5 py-0.5 rounded">
                                주최: {c.provider}
                              </span>
                              <span>•</span>
                              <span>기간: {c.duration}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                    <button 
                      onClick={() => setActiveTab("AIClassroom")}
                      className="text-xs text-[#D20A50] font-bold hover:underline cursor-pointer"
                    >
                      강의 찾기 & AI 코치 전용 챗방 →
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: Daily News Archive (Naver News connect + query box + list) */}
          {activeTab === "DailyNews" && (
            <div className="space-y-6" id="view-daily-news-archive">
              
              {/* Header section with Naver search key pointers */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-[#D20A50] uppercase tracking-wider block">Real-time Portal Linking</span>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">일자별 뉴스 아카이브</h2>
                  <p className="text-slate-500 text-xs md:text-sm">
                    네이버 실시간 뉴스 검색 API를 관통하여 최신 정보망을 확인하고, 소구점을 한층 밝아지게 요집하는 Gemini 융합 기능이 탑재되어 있습니다.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  {["사회적가치 인공지능", "ESG AI", "소셜벤처 AI", "인구소멸 AI"].map((keyword) => (
                    <button
                      key={keyword}
                      onClick={() => setNaverSearchQuery(keyword)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        naverSearchQuery === keyword 
                          ? "bg-[#D20A50] text-white" 
                          : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                      }`}
                    >
                      #{keyword}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main List Column */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6 text-start">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                    <SlidersHorizontal className="w-4 h-4 text-[#D20A50]" />
                    조회 결과 타임라인 (뉴스 검색어 : "{naverSearchQuery}")
                  </h3>
                  <button 
                    onClick={() => fetchNaverNews(naverSearchQuery)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition"
                    title="새로고침"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Vertical timeline matching news exactly */}
                <div className="space-y-6 max-h-[700px] overflow-y-auto pr-1">
                  {isNaverNewsLoading ? (
                    <div className="py-24 flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
                      <Loader2 className="w-10 h-10 animate-spin text-[#D20A50]" />
                      <span>네이버 실시간 뉴스 취합 중...</span>
                    </div>
                  ) : Object.keys(groupedNews).length > 0 ? (
                    Object.entries(groupedNews).map(([date, articles]) => (
                      <div key={date} className="relative pl-6 border-l-2 border-slate-100 space-y-3">
                        <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#D20A50] border-4 border-white shadow-sm" />
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-950 font-sans tracking-tight">
                            📅 {date}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-500 font-mono px-2 py-0.5 rounded-full font-bold">
                            {articles.length}건 기사 소환
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {articles.map((item, index) => {
                            const isOverseas = item.origin === "해외";
                            return (
                              <div
                                key={index}
                                onClick={() => handleOpenNewsDetail(item)}
                                className="group bg-slate-50/50 p-4 rounded-2xl border border-slate-200/50 hover:bg-white hover:border-brand-200 hover:shadow-lg transition-all duration-305 cursor-pointer flex flex-col justify-between"
                              >
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center gap-2">
                                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                                      isOverseas ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                                    }`}>
                                      {isOverseas ? "해외 아젠다" : "국내 신작"}
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-mono">{item.source}</span>
                                  </div>
                                  <h4 className="text-xs md:text-sm font-black text-slate-900 group-hover:text-[#D20A50] transition-colors leading-snug">
                                    {(item.title || "").replace(/<b>/g, "").replace(/<\/b>/g, "")}
                                  </h4>
                                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                    {(item.description || "").replace(/<b>/g, "").replace(/<\/b>/g, "") || "세부 내용 요강 생략..."}
                                  </p>
                                </div>
                                <div className="pt-2 border-t border-slate-100 mt-3 flex justify-between items-center text-[10px] text-slate-400">
                                  <span>Gemini 한줄분석 대행 준비 완료</span>
                                  <span className="text-[#D20A50] font-bold inline-flex items-center gap-0.5">
                                    AI 핵심요약 카드 개방 <ChevronRight className="w-3.5 h-3.5" />
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-16 text-center text-xs text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
                      검색 조건에 맞는 실시간 아카이브 뉴스가 존재하지 않습니다.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: Custom AI Classroom (Courses explorer + filter + Chatbot Coach) */}
          {activeTab === "AIClassroom" && (
            <div className="space-y-6" id="view-custom-classroom">
              
              {/* Top summary section */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-[#D20A50] uppercase tracking-wider block">CSES interactive Training</span>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">맞춤형 AI 강의실</h2>
                  <p className="text-slate-500 text-xs md:text-sm">
                    사회적가치연구원이 주최 또는 제휴하고 있는 수준별 우수 교육 과정을 검색하고, AI 코치 봇과 1:1 대화식 교육 큐레이션을 수혜해 보세요.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleStartSurvey}
                    className="px-5 py-3 bg-[#D20A50] hover:bg-pink-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-pink-900/10 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    🎯 맞춤 큐레이션 진단 설문 세팅
                  </button>
                  {diagnosedCourseIds.length > 0 && (
                    <button 
                      onClick={clearDiagnosticsFilter}
                      className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      필터 초기화 <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Layout grid containing Explorer (Left) and Chatbot Coach (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Left side: Courses Explorer list (lg:col-span-7) */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                  <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4 flex-grow text-start">
                    
                    {/* Filter controls panel */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">수준 기준</label>
                        <select 
                          value={filterLevel}
                          onChange={(e) => setFilterLevel(e.target.value)}
                          className="w-full bg-slate-50 text-[11px] font-bold p-2.5 rounded-xl border border-slate-200 outline-none"
                        >
                          <option value="전체">수준 (전체)</option>
                          <option value="입문">입문</option>
                          <option value="중급">중급</option>
                          <option value="고급">고급</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">주최 기관</label>
                        <select 
                          value={filterProvider}
                          onChange={(e) => setFilterProvider(e.target.value)}
                          className="w-full bg-slate-50 text-[11px] font-bold p-2.5 rounded-xl border border-slate-200 outline-none"
                        >
                          <option value="전체">주최 (전체)</option>
                          <option value="사회적가치연구원">사회적가치연구원</option>
                          <option value="K-MOOC">K-MOOC</option>
                          <option value="CSES">CSES</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#D20A50] block mb-1">키워드 필터</label>
                        <input 
                          type="text" 
                          placeholder="강명 검색..." 
                          value={searchCourseQuery}
                          onChange={(e) => setSearchCourseQuery(e.target.value)}
                          className="w-full bg-slate-50 text-[11px] p-2 rounded-xl border border-slate-200 outline-none focus:bg-white"
                        />
                      </div>
                    </div>

                    {/* Courses result card view */}
                    <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                      {ENHANCED_COURSES.filter(c => {
                        const lvlMatch = filterLevel === "전체" || c.level === filterLevel;
                        const provMatch = filterProvider === "전체" || c.provider.includes(filterProvider);
                        const wordMatch = c.title.toLowerCase().includes(searchCourseQuery.toLowerCase()) || 
                                          c.description.toLowerCase().includes(searchCourseQuery.toLowerCase());
                        const surveyIdMatch = diagnosedCourseIds.length === 0 || diagnosedCourseIds.includes(c.id);
                        return lvlMatch && provMatch && wordMatch && surveyIdMatch;
                      }).map((course) => {
                        const isPrimaryHighlight = diagnosedCourseIds.length > 0 && diagnosedCourseIds.includes(course.id);
                        const isCourseChatActive = activeCourseChat?.id === course.id;
                        return (
                          <div 
                            key={course.id}
                            onClick={() => {
                              setActiveCourseChat(course);
                              setChatInput(`"${course.title}" 과정의 주요 커리큘럼 세부 내용과 사회성과 임팩트에 관한 자문을 요청합니다.`);
                            }}
                            className={`p-4 rounded-3xl border text-start transition relative overflow-hidden cursor-pointer ${
                              isCourseChatActive 
                                ? "bg-pink-50/70 border-[#D20A50] shadow-sm" 
                                : isPrimaryHighlight 
                                ? "bg-amber-50/50 border-amber-300" 
                                : "bg-slate-50/60 border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <div className="space-y-1">
                                <span className="inline-block px-2 py-0.5 bg-slate-200 text-slate-700 text-[9px] font-extrabold rounded">
                                  {course.category}
                                </span>
                                <h4 className="text-xs md:text-sm font-black text-slate-900 leading-tight">
                                  {course.title}
                                </h4>
                              </div>
                              <span className={`text-[10px] font-black px-2 py-1 rounded-md shrink-0 ${
                                course.costType === "무료" ? "bg-emerald-100 text-emerald-800" : "bg-purple-100 text-purple-800"
                              }`}>
                                {course.costType}
                              </span>
                            </div>

                            <p className="text-[11.5px] text-slate-600 leading-relaxed mb-3">
                              {course.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-1.5 text-[10.5px] text-slate-400 font-mono">
                              <span className="bg-white/80 border border-slate-200 px-2 py-0.5 rounded text-slate-600 font-bold shrink-0">
                                주최: {course.provider}
                              </span>
                              <span>•</span>
                              <span>기한/량: {course.duration}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                </div>

                {/* Right side: AI Mentor chatbot interface (lg:col-span-5) */}
                <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between overflow-hidden text-start min-h-[500px]">
                  
                  {/* Chat header area */}
                  <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-brand-500 rounded-full animate-ping" />
                      <div>
                        <h4 className="text-xs font-black leading-tight flex items-center gap-1.5 text-white">
                          <Sparkles className="w-3.5 h-3.5 text-pink-300" />
                          CSES AI 교육 큐레이터 봇
                        </h4>
                        <span className="text-[9px] text-slate-400 block font-mono">Gemini 3.5 Pro model</span>
                      </div>
                    </div>
                    {activeCourseChat && (
                      <span className="text-[9px] px-2 py-1 bg-pink-100/10 text-pink-200 rounded-lg truncate max-w-44 font-bold">
                        선택: {activeCourseChat.title}
                      </span>
                    )}
                  </div>

                  {/* Messaging scroll area */}
                  <div className="flex-grow p-4 overflow-y-auto space-y-4 max-h-[380px] bg-slate-50/40">
                    {chatMessages.map((msg) => {
                      const isModel = msg.role === "model";
                      return (
                        <div 
                          key={msg.id}
                          className={`flex ${isModel ? "justify-start" : "justify-end"} items-start gap-2.5`}
                        >
                          {isModel && (
                            <div className="w-7 h-7 rounded-lg bg-[#D20A50] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow">
                              🤖
                            </div>
                          )}
                          <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                            isModel 
                              ? "bg-white text-slate-800 border border-slate-200/60 shadow-xs" 
                              : "bg-[#D20A50] text-white shadow-sm"
                          }`}>
                            <p className="whitespace-pre-line font-medium leading-relaxed font-sans">{msg.content}</p>
                            <span className={`block text-[8px] mt-1.5 font-mono text-end ${isModel ? "text-slate-400" : "text-pink-100/60"}`}>
                              {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {isChatLoading && (
                      <div className="flex justify-start items-center gap-2 text-xs text-slate-400 font-medium pl-10">
                        <Loader2 className="w-4 h-4 animate-spin text-[#D20A50]" />
                        <span>큐레이션 코치가 응대 내용을 보정하고 있습니다...</span>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Sending input form */}
                  <form onSubmit={handleSendChat} className="p-3 border-t border-slate-150 flex items-center gap-2 bg-white">
                    <input 
                      type="text" 
                      placeholder="AI 코치에게 교육 과정이나 SROI를 질문하십시오..." 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-grow bg-slate-100 text-xs px-3 py-3 rounded-xl border border-transparent outline-none focus:bg-white focus:border-[#D20A50] text-slate-700"
                    />
                    <button 
                      type="submit"
                      className="p-3 bg-[#D20A50] hover:bg-pink-600 text-white rounded-xl transition cursor-pointer shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: Deep Insight Menu (Prompts console & reports spreadsheet DB) */}
          {activeTab === "DeepInsight" && (
            <div className="space-y-6" id="view-deep-insight">
              
              {/* Core selection buttons */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-[#D20A50] uppercase tracking-wider block">Specialist Tools Package</span>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">심층 인사이트 메뉴</h2>
                  <p className="text-slate-500 text-xs md:text-sm">
                    논문 초록 핵심 번역, 홍보 자료 언론 기안 작성 대행 및 세계 공인 가치 데이터 세트를 조회하고 원터치 CSV로 백업받기 가능합니다.
                  </p>
                </div>
              </div>

              {/* Grid block organizing tools */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* TOOL MODULE A: AI Prompt Console (lg:col-span-6) */}
                <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between text-start space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Terminal className="w-5 h-5 text-[#D20A50]" />
                      특화 AI 프롬프트 실습 콘솔
                    </h3>
                    <p className="text-slate-500 text-xs">
                      연구원 및 실무진 맞춤 템플릿입니다. 원하는 카드를 지정하고 하단 본문에 입력 내용을 기안 후 전송하십시오.
                    </p>
                  </div>

                  {/* Selector tabs */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "translator", label: "📄 학술 초록 번역", desc: "English to Korean" },
                      { id: "writer", label: "✍️ 보도자료 기안", desc: "홍보 원고 초고 작성" },
                      { id: "advisor", label: "🧭 기획안 어드바이저", desc: "SDGs 임팩트 고도화" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActivePromptTemplate(tab.id);
                          setPromptInputText("");
                          setPromptExecutionResult("");
                        }}
                        className={`p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                          activePromptTemplate === tab.id 
                            ? "bg-pink-50 border-[#D20A50] text-[#D20A50] font-black" 
                            : "bg-slate-50 border-slate-200/60 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-xs block leading-tight">{tab.label}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{tab.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Form console input */}
                  <div className="space-y-2">
                    <label className="text-[10.5px] font-bold text-slate-400 block uppercase">
                      선택된 템플릿: {currentTemplateObj ? currentTemplateObj.title : "번역기"}
                    </label>
                    <textarea 
                      placeholder={currentTemplateObj ? currentTemplateObj.placeholder : "여기에 영문 초록이나 기획 개요를 작성해 주십시오..."}
                      value={promptInputText}
                      onChange={(e) => setPromptInputText(e.target.value)}
                      rows={5}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs outline-none focus:bg-white focus:border-[#D20A50] transition leading-relaxed"
                    />
                  </div>

                  <button 
                    onClick={handleExecutePrompt}
                    disabled={isPromptLoading || !promptInputText.trim()}
                    className="w-full bg-[#D20A50] hover:bg-pink-650 text-white font-extrabold text-xs py-3.5 rounded-xl shadow transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isPromptLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>수석 AI가 심층 분석 보고서를 성화하는 장치를 작동 중...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-pink-200 animate-spin-slow" />
                        <span>Gemini AI 학술 분석 실행하기</span>
                      </>
                    )}
                  </button>

                  {/* Output block display */}
                  {promptExecutionResult && (
                    <div className="bg-slate-950 text-slate-100 rounded-2xl p-4 space-y-3 font-medium relative border border-slate-800">
                      <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <span className="text-[9px] text-[#D20A50] font-bold tracking-widest uppercase">ANALYSIS RESULT OUTPUT</span>
                        <button 
                          onClick={() => {
                            handleCopyToClipboard(promptExecutionResult);
                          }}
                          className="text-[10px] text-slate-400 hover:text-white inline-flex items-center gap-0.5"
                        >
                          {isCopied ? <span className="text-emerald-400">복사완료</span> : <><Copy className="w-3.5 h-3.5" /> 복사</>}
                        </button>
                      </div>
                      <p className="text-xs whitespace-pre-wrap leading-relaxed font-sans">{promptExecutionResult}</p>
                    </div>
                  )}

                </div>

                {/* TOOL MODULE B: Research Library Spreadsheet DB (lg:col-span-6) */}
                <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between text-start space-y-4">
                  
                  <div className="space-y-2">
                    <h3 className="text-base font-extrabold text-slate-900 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Database className="w-5 h-5 text-[#D20A50]" />
                        SROI 글로벌 리서치 데이터베이스
                      </span>
                      <button 
                        onClick={handleDownloadCSV}
                        className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10.5px] font-extrabold rounded-xl transition inline-flex items-center gap-1 cursor-pointer"
                        title="CSV 테이블 내려받기"
                      >
                        <Download className="w-3.5 h-3.5 text-[#D20A50]" />
                        엑셀 CSV 내보내기
                      </button>
                    </h3>
                    <p className="text-slate-500 text-xs">
                      유네스코, CSES, 세계포럼(WEF)가 제안한 측정 모델 데이터를 한곳에 동기화하였습니다. 다운로드 수 혹은 연도 정렬 지원.
                    </p>
                  </div>

                  {/* Filters bar */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <input 
                        type="text" 
                        placeholder="리서치 검색..." 
                        value={reportSearchQuery}
                        onChange={(e) => setReportSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 text-[11px] p-2 rounded-xl border border-slate-200 outline-none"
                      />
                    </div>
                    <div>
                      <select
                        value={reportFilterCategory}
                        onChange={(e) => setReportFilterCategory(e.target.value)}
                        className="w-full bg-slate-50 text-[11px] p-2.5 rounded-xl border border-slate-200 outline-none font-bold"
                      >
                        <option value="전체">국가 구분 (전체)</option>
                        <option value="국내">국내 기관</option>
                        <option value="국외">국외 글로벌</option>
                      </select>
                    </div>
                    <div>
                      <select
                        value={reportSortKey}
                        onChange={(e) => setReportSortKey(e.target.value as any)}
                        className="w-full bg-slate-50 text-[11px] p-2.5 rounded-xl border border-slate-200 outline-none font-bold"
                      >
                        <option value="downloads">다운로드순 정렬</option>
                        <option value="publishedYear">최신 발행도순</option>
                      </select>
                    </div>
                  </div>

                  {/* DB table listing */}
                  <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                    {filteredReports.map((report) => (
                      <div 
                        key={report.id}
                        className="p-3.5 rounded-2xl border border-slate-150 bg-slate-50/50 hover:bg-white transition flex items-start gap-3 justify-between"
                      >
                        <div className="space-y-1.5 flex-grow min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`text-[9.5px] font-extrabold px-2 py-0.2 rounded ${
                              report.category === "국내" ? "bg-blue-50 text-blue-800" : "bg-purple-50 text-purple-800"
                            }`}>
                              {report.category}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold">{report.institution}</span>
                          </div>
                          
                          <h4 className="text-xs font-black text-slate-900 leading-snug truncate">
                            {report.title}
                          </h4>
                          
                          <p className="text-[10.5px] text-slate-500 leading-relaxed font-normal">
                            {report.abstract}
                          </p>

                          <div className="flex flex-wrap gap-1">
                            {report.tags.map((tag, i) => (
                              <span key={i} className="text-[9.5px] bg-slate-200/50 text-slate-600 px-1.5 py-0.2 rounded font-medium">#{tag}</span>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col items-end justify-between self-stretch shrink-0 text-right text-mono text-[10px] text-slate-400">
                          <span>{report.publishedYear}년</span>
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-bold text-[9.5px] whitespace-nowrap">
                            📥 {report.downloads.toLocaleString()}회
                          </span>
                        </div>
                      </div>
                    ))}
                    {filteredReports.length === 0 && (
                      <p className="text-center text-xs text-slate-400 py-10">일치하는 리서치 데이터베이스가 없습니다.</p>
                    )}
                  </div>

                </div>

              </div>

            </div>
          )}

        </main>
      </div>

      {/* --------------------------------------------------
          POPUP MODAL: CSES Platform Guide Modal (Phase 1 compliant)
          -------------------------------------------------- */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 backdrop-blur-xs p-4 animate-fade-in" id="platform-guide-modal-popup">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh]">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#D20A50]" />
                <h3 className="font-extrabold text-slate-900 text-sm md:text-base">CSES AI Insight Hub 이용 가이드</h3>
              </div>
              <button 
                onClick={() => setIsGuideOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs md:text-sm text-slate-600 leading-relaxed text-start">
              <p className="font-bold text-slate-800">
                사회적가치연구원(CSES) 연구원들과 협력 파트너를 위해 설계된 지능형 리서치 어시스턴트 플랫폼입니다.
              </p>

              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="font-mono text-xs font-black italic text-[#D20A50] block shrink-0 bg-pink-100 px-2 py-0.5 rounded-lg">01</span>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs md:text-sm">Bento Grid 대시보드</h4>
                    <p className="text-[11.5px] mt-0.5 text-slate-500">
                      오늘의 연구 트렌드 요약, 날짜별 필터 프레임워크가 결합된 Naver API 실시간 뉴스, 나의 목적과 능력에 맞춘 학술 강좌 진단 창구를 하나로 통합했습니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="font-mono text-xs font-black italic text-[#D20A50] block shrink-0 bg-pink-100 px-2 py-0.5 rounded-lg">02</span>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs md:text-sm">일자별 아카이브 & Gemini 융합 요약</h4>
                    <p className="text-[11.5px] mt-0.5 text-slate-500">
                      포털 뉴스를 탐지하여 날짜 순 구획선 밑에 리스트업하고, 클릭하면 소스 경로와 제목을 분석해 Gemini 3.5 Pro가 기사에 따른 임팩트 핵심을 1문항 요약 추출해 줍니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="font-mono text-xs font-black italic text-[#D20A50] block shrink-0 bg-pink-100 px-2 py-0.5 rounded-lg">03</span>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs md:text-sm">AI Training 챗봇 & 1:1 상담</h4>
                    <p className="text-[11.5px] mt-0.5 text-slate-500">
                      수준별 강의의 커리큘럼 계획을 기반으로 AI 추천 모듈이 장착된 실시간 코치 챗봇과 자유로운 대화가 가능합니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="font-mono text-xs font-black italic text-[#D20A50] block shrink-0 bg-pink-100 px-2 py-0.5 rounded-lg">04</span>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs md:text-sm">심층 실무 지원 & CSV 내보내기</h4>
                    <p className="text-[11.5px] mt-0.5 text-slate-500">
                      초록 영어 번역, 한글 보도자료 초안 작성 프롬프트 콘솔을 지원하며, 학술 연구 자료실 정보를 엑셀 CSV 포맷으로 원클릭 완벽 백업할 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-end">
              <button 
                onClick={() => setIsGuideOpen(false)}
                className="px-5 py-2.5 bg-[#D20A50] text-white font-extrabold text-xs rounded-xl hover:bg-pink-600 transition cursor-pointer"
              >
                가이드 확인 완료 및 대시보드로 돌아가기
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --------------------------------------------------
          POPUP MODAL: Interactive Survey Diagnostics Panel (Card 3 trigger)
          -------------------------------------------------- */}
      {isSurveyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-fade-in" id="survey-diagnose-modal">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] text-start">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-sm md:text-base">나의 맞춤 강좌 추천 진단</h3>
              </div>
              <button 
                onClick={() => setIsSurveyOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STEP 1: Level 선호 수준 */}
            {surveyStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>진행 흐름: <b>1 / 3 단계</b></span>
                  <span className="font-bold text-[#D20A50]">기본 역량 수준</span>
                </div>
                <h4 className="text-slate-800 font-extrabold text-sm md:text-base leading-snug">
                  연구원님의 현재 사회공헌 및 지속가능 평가 기본 지식 선단 수준은 어떠신가요?
                </h4>
                
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { val: "입문", title: "🌱 입문 과정", desc: "개념 정립 및 사회적 가치의 측정 당위성을 이해해보고 싶습니다." },
                    { val: "중급", title: "📊 중급 실무", desc: "이중 중요성 평가 지표 수립이나 SROI 정량 산출 실무를 다룹니다." },
                    { val: "고급", title: "🧭 고급 응용 / 세미나", desc: "AI RAG 융합 프롬프트 가시성 및 글로벌 Net zero 공조 가치 방향을 연구합니다." }
                  ].map((opt) => (
                    <button 
                      key={opt.val}
                      onClick={() => handleSurveyOption("level", opt.val)}
                      className="text-left p-4 rounded-2xl border border-slate-200 hover:border-brand-200 hover:bg-pink-50/10 transition cursor-pointer"
                    >
                      <h5 className="font-bold text-slate-800 text-xs md:text-sm">{opt.title}</h5>
                      <p className="text-[11px] text-slate-500 mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Topic 주 관심 분야 */}
            {surveyStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>진행 흐름: <b>2 / 3 단계</b></span>
                  <span className="font-bold text-[#D20A50]">주요 연구 분야</span>
                </div>
                <h4 className="text-slate-800 font-extrabold text-sm md:text-base leading-snug">
                  연구 및 기획 프로젝트의 핵심 '사회적가치 아젠다'는 어디에 가깝습니까?
                </h4>
                
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { val: "사회공헌", title: "🤝 사회공헌 & 소셜 비즈니스", desc: "소셜 벤처 생태계 활성화 및 기업 공동 가치 창출(CSV)" },
                    { val: "ESG 공시", title: "📋 ESG 정보공시 및 글로벌 지표 수립", desc: "GRI 2.0 표준, 탄소 Scope 3 회계 평가론" },
                    { val: "지역혁신", title: "🏡 지역 소멸 방지 및 로컬 펀딩 대안", desc: "자생적 로컬 생태계 거점 청정 산업군 설계" }
                  ].map((opt) => (
                    <button 
                      key={opt.val}
                      onClick={() => handleSurveyOption("topic", opt.val)}
                      className="text-left p-4 rounded-2xl border border-slate-200 hover:border-brand-200 hover:bg-pink-50/10 transition cursor-pointer"
                    >
                      <h5 className="font-bold text-slate-800 text-xs md:text-sm">{opt.title}</h5>
                      <p className="text-[11px] text-slate-500 mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Skill 관심 기술 */}
            {surveyStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>진행 흐름: <b>3 / 3 단계</b></span>
                  <span className="font-bold text-[#D20A50]">실무 연계 도구</span>
                </div>
                <h4 className="text-slate-800 font-extrabold text-sm md:text-base leading-snug">
                  이번 기에 특별히 보정하여 습득해보고 싶은 디지털 연구 실전 키뱅크는 무엇입니까?
                </h4>
                
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { val: "SV 측정", title: "📏 정량 성과 화폐화 공식 및 SROI", desc: "사회적 편익을 직접 공식에 의해 화폐액으로 치환" },
                    { val: "AI 프롬프트", title: "💻 AI RAG 프롬프팅 조절 기술", desc: "수작업을 탈피하여 리서치 초록 요약을 자동 지능화" },
                    { val: "SDGs", title: "🌎 글로벌 SDGs 연계 연합", desc: "유네스코 표준 및 해외 포럼 지침 매트릭스 고도화" }
                  ].map((opt) => (
                    <button 
                      key={opt.val}
                      onClick={() => handleSurveyOption("skill", opt.val)}
                      className="text-left p-4 rounded-2xl border border-slate-200 hover:border-brand-200 hover:bg-pink-50/10 transition cursor-pointer"
                    >
                      <h5 className="font-bold text-slate-800 text-xs md:text-sm">{opt.title}</h5>
                      <p className="text-[11px] text-slate-500 mt-1">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: Survey Outcome */}
            {surveyStep === 4 && (
              <div className="space-y-4" id="diagnostic-survey-result-p">
                <div className="text-center space-y-2 py-4">
                  <span className="inline-block p-3 bg-pink-100 text-[#D20A50] rounded-full text-xl">🎉</span>
                  <h4 className="text-slate-800 font-extrabold text-base md:text-lg">맞춤 분석 진단이 정상적으로 완료되었습니다!</h4>
                  <p className="text-slate-500 text-xs">
                    연구원님의 진단 인덱스 매핑에 부합하는 강좌 및 수준을 하단 대시보드와 리스트에 적용하였습니다.
                  </p>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">나의 진단 결과 키포인트</span>
                  <div className="grid grid-cols-3 gap-2 text-center text-slate-700 font-bold">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/50">
                      <span className="text-[9px] text-slate-400 block font-normal">선호수준</span>
                      <span className="text-[#D20A50]">{surveyAnswers.level}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/50">
                      <span className="text-[9px] text-slate-400 block font-normal">연구관심</span>
                      <span className="text-purple-700">{surveyAnswers.topic}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/50">
                      <span className="text-[9px] text-slate-400 block font-normal">연계기술</span>
                      <span className="text-indigo-700">{surveyAnswers.skill}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] tracking-widest font-bold text-[#D20A50] uppercase block">추천된 과목 수혜</span>
                  <div className="space-y-1.5 bg-white p-3 rounded-2xl border border-slate-200 max-h-36 overflow-y-auto">
                    {ENHANCED_COURSES.filter(c => diagnosedCourseIds.includes(c.id)).map(c => (
                      <div key={c.id} className="text-xs text-slate-700 flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                        <span className="font-extrabold text-slate-900 truncate pr-2">✓ {c.title}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded shrink-0">{c.costType}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setIsSurveyOpen(false);
                    setActiveTab("AIClassroom");
                  }}
                  className="w-full bg-[#D20A50] text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg hover:bg-pink-650 transition cursor-pointer text-center"
                >
                  과목 추천 확인하러 AI 강의실로 가기
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* --------------------------------------------------
          POPUP MODAL: 실시간 뉴스 세부 및 AI 융합 분석 요약 모달 (Phase 3)
          -------------------------------------------------- */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-fade-in" id="news-summary-viewer-modal">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] text-start">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-3">
              <div className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-[#D20A50]" />
                <span className="text-slate-800 font-extrabold text-xs md:text-sm">실시간 동향 브리핑</span>
              </div>
              <button 
                onClick={() => setSelectedNews(null)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Container */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-slate-700">
              
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold text-[#D20A50] bg-pink-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  포털 연동 뉴스 / {selectedNews.origin || "국내"}
                </span>
                <h3 className="text-lg md:text-xl font-extrabold text-slate-900 leading-snug">
                  {(selectedNews.title || "").replace(/<b>/g, "").replace(/<\/b>/g, "")}
                </h3>
                <div className="flex items-center gap-3 text-slate-400 text-[11px] font-mono">
                  <span>출처: <b>{selectedNews.source}</b></span>
                  <span>발간일자: {selectedNews.pubDate}</span>
                </div>
              </div>

              {/* Core News Text Content */}
              <div className="text-xs md:text-sm leading-relaxed text-slate-600 bg-slate-50/50 p-4 rounded-2xl border border-slate-200/50">
                <p>{(selectedNews.description || "").replace(/<b>/g, "").replace(/<\/b>/g, "")}</p>
              </div>

              {/* Gemini summary result */}
              <div className="border border-brand-200 bg-pink-50/10 p-5 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-36 h-36 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <h4 className="text-xs font-bold text-[#D20A50] uppercase tracking-widest flex items-center gap-1.5 mb-3">
                  <Sparkles className="w-4 h-4 text-[#D20A50] animate-pulse" />
                  CSES AI 실시간 융합 요약 (Gemini 3.5 Flash)
                </h4>

                {isSummarizingNews ? (
                  <div className="py-8 flex flex-col justify-center items-center gap-2 text-xs text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-[#D20A50]" />
                    <span>실시간 융합 요약 분석을 정교화하고 있습니다...</span>
                  </div>
                ) : newsSummaryResult ? (
                  <div className="space-y-4 animate-fade-in">
                    
                    {/* Item 1: One line summary */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">한 줄 핵심 요약 본</span>
                      <p className="text-base font-extrabold italic text-slate-900 leading-snug tracking-tight font-sans">
                        {newsSummaryResult.oneLine}
                      </p>
                    </div>

                    {/* Item 2: Context Highlights */}
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl space-y-1.5">
                      <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                        🍀 핵심 맥락 하이라이트 분석 (에메랄드 포인트)
                      </span>
                      <p className="text-xs text-emerald-900 leading-relaxed font-sans font-medium">
                        {newsSummaryResult.description}
                      </p>
                    </div>

                  </div>
                ) : (
                  <div className="text-xs text-slate-400">
                    API 가용 대행 점검 상태입니다.
                  </div>
                )}
              </div>

            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-end gap-2 shrink-0">
              <button 
                onClick={() => setSelectedNews(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition cursor-pointer"
              >
                본문 닫기
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
