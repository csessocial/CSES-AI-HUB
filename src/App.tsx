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
  Award,
  HelpCircle,
  ArrowRight
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
  const [activeTab, setActiveTab] = useState<"Home" | "DailyNews" | "AIClassroom" | "DeepInsight_DB" | "DeepInsight_Prompt" | "Guide">("Home");
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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-brand-100 selection:text-brand-900" id="cses-app-container">
      
      {/* --------------------------------------------------
          GLOBAL TOP NAVIGATION BAR (GNB)
          -------------------------------------------------- */}
      <header className="w-full bg-white border-b border-slate-100 sticky top-0 z-50 h-20 flex items-center shadow-xs">
        <div className="w-full max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
          
          {/* Left Brand Area */}
          <div className="flex items-center gap-3 cursor-pointer select-none shrink-0" onClick={() => setActiveTab("Home")}>
            <div className="w-10 h-10 rounded-xl bg-[#D20A50] text-white flex items-center justify-center font-black text-base shadow-sm">
              AI
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-black tracking-tight text-[#D20A50] leading-none">
                CSES AI HUB
              </span>
              <span className="text-[8px] text-slate-400 font-bold tracking-widest uppercase mt-1 leading-none">
                INSIGHT SUPPORT SYSTEM
              </span>
            </div>
          </div>

          {/* Center Navigation Tabs (Horizontal & Responsive Scrollable on mobile) */}
          <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            {[
              { id: "Home" as const, label: "홈", icon: (className: string) => <HomeIcon className={className} /> },
              { id: "AIClassroom" as const, label: "AI 교육", icon: (className: string) => <BookOpen className={className} /> },
              { id: "DailyNews" as const, label: "AI 뉴스", icon: (className: string) => <Newspaper className={className} /> },
              { id: "DeepInsight_DB" as const, label: "AI DB", icon: (className: string) => <Database className={className} /> },
              { id: "DeepInsight_Prompt" as const, label: "AI 프롬프트", icon: (className: string) => <Terminal className={className} /> },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-150 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-[#D20A50] text-white shadow-sm"
                      : "text-slate-650 hover:bg-slate-50 hover:text-[#D20A50]"
                  }`}
                >
                  <span className="shrink-0">{tab.icon(isActive ? "w-4 h-4 text-white" : "w-4 h-4 text-slate-400 group-hover:text-[#D20A50]")}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Search Input */}
          <div className="relative w-36 sm:w-56 md:w-64 shrink-0">
            <input
              type="text"
              placeholder="통합 검색..."
              value={naverSearchQuery}
              onChange={(e) => setNaverSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-xs pl-9 pr-4 py-2.5 rounded-full border border-slate-205 outline-none focus:bg-white focus:border-[#D20A50] transition-all text-slate-800 placeholder-slate-400 font-medium"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

        </div>
      </header>

      {/* --------------------------------------------------
          MAIN WORKSPACE LAYOUT Container
          -------------------------------------------------- */}
      <main className="flex-grow overflow-y-auto p-4 md:p-8 space-y-6 max-w-7xl w-full mx-auto" id="cses-scroll-viewport">
          
          {/* TAB 1: Home Dashboard inside Bento Grid Layout */}
          {activeTab === "Home" && (
            <div className="space-y-12" id="view-dashboard-home">
              
              {/* BAND 1: Large Pink Welcome Banner (Screenshot 1) */}
              <div 
                className="relative overflow-hidden bg-gradient-to-br from-[#D20A50] to-[#b80543] text-white rounded-[40px] p-8 md:p-14 lg:p-16 shadow-xl shadow-pink-900/10 text-start"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-6 max-w-4xl">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black tracking-wider bg-white/10 text-pink-100 border border-white/20 uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-pink-200 animate-pulse" />
                    CSES AI INSIGHT HUB
                  </span>
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                    AI로 더 넓게,<br />
                    연구를 더 깊게.
                  </h1>
                  <p className="text-pink-100/90 text-sm md:text-base leading-relaxed max-w-2xl font-medium">
                    사회적가치연구원(CSES)의 전문 지식과 실시간 인공지능 트렌드 분석을 결합하여, 리서치의 질적 도약을 지원합니다.
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <button 
                      onClick={() => setActiveTab("Guide")}
                      className="bg-white text-[#D20A50] hover:bg-slate-50 font-black text-xs md:text-sm px-6 py-4 rounded-[20px] shadow-sm transition duration-150 cursor-pointer flex items-center gap-1.5"
                    >
                      플랫폼 가이드 보기 <ArrowRight className="w-4 h-4 text-[#D20A50]" />
                    </button>
                    <button 
                      onClick={handleStartSurvey}
                      className="bg-white/10 text-white hover:bg-white/15 border border-white/20 font-black text-xs md:text-sm px-6 py-4 rounded-[20px] transition duration-150 cursor-pointer flex items-center gap-1.5"
                    >
                      AI 역량 자가진단 <Sparkles className="w-4 h-4 text-pink-200" />
                    </button>
                  </div>
                </div>
              </div>

              {/* BAND 2: AI News cards */}
              <div className="space-y-6">
                
                {/* Full Width News Block */}
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Newspaper className="w-5 h-5 text-slate-400 shrink-0" />
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">AI 뉴스</h2>
                    </div>
                    <button 
                      onClick={() => setActiveTab("DailyNews")}
                      className="text-xs font-bold text-slate-400 hover:text-[#D20A50] transition cursor-pointer"
                    >
                      전체 뉴스 보기
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* news card 1 */}
                    <div 
                      onClick={() => {
                        const news = {
                          title: "젠슨 황 \"HBM 더 달라\" 요청하더니...삼전닉...",
                          description: "통해 HBM3E·HBM4·HBM4E 공급 방안을 논의했다. 올해 회의에서는 HBM 판매 확대, 주요 거래선 대응이 핵심... SK하이닉스는 지난 18일...",
                          pubDate: "2026-06-23",
                          source: "전자신문",
                          origin: "국내",
                          link: "https://www.etnews.com"
                        };
                        handleOpenNewsDetail(news);
                      }}
                      className="group bg-white rounded-[32px] p-5 border border-slate-100 shadow-xs hover:shadow-md transition duration-300 flex flex-col justify-between cursor-pointer space-y-4 text-start"
                    >
                      <div className="space-y-4">
                        <div className="w-full h-40 rounded-[24px] overflow-hidden bg-slate-100">
                          <img 
                            src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800" 
                            alt="Semiconductor" 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="bg-pink-50 text-[#D20A50] px-2.5 py-1 rounded-lg">기술</span>
                          <span className="text-slate-400">2026-06-23</span>
                        </div>
                        <h3 className="text-sm font-black text-slate-900 tracking-tight leading-snug group-hover:text-[#D20A50] transition-colors line-clamp-1">
                          젠슨 황 "HBM 더 달라" 요청하더니...삼전닉...
                        </h3>
                        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                          통해 HBM3E·HBM4·HBM4E 공급 방안을 논의했다. 올해 회의에서는 HBM 판매 확대, 주요 거래선 대응이 핵심... SK하이닉스는 지난 18일...
                        </p>
                      </div>
                    </div>

                    {/* news card 2 */}
                    <div 
                      onClick={() => {
                        const news = {
                          title: "모태펀드-국민성장펀드 '투자 이어달리기' 가동...",
                          description: "정부가 모태펀드와 국민성장펀드를 연계해 벤처·스타트업이 글로벌 유니콘을 넘어 빅테크 기업으로... 기틀을 확고히 안착시키고, 혁신기업의 성장...",
                          pubDate: "2026-06-23",
                          source: "한국경제",
                          origin: "국내",
                          link: "https://www.hankyung.com"
                        };
                        handleOpenNewsDetail(news);
                      }}
                      className="group bg-white rounded-[32px] p-5 border border-slate-100 shadow-xs hover:shadow-md transition duration-300 flex flex-col justify-between cursor-pointer space-y-4 text-start"
                    >
                      <div className="space-y-4">
                        <div className="w-full h-40 rounded-[24px] overflow-hidden bg-slate-100">
                          <img 
                            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800" 
                            alt="Meeting Speaker" 
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="bg-pink-50 text-[#D20A50] px-2.5 py-1 rounded-lg">규제</span>
                          <span className="text-slate-400">2026-06-23</span>
                        </div>
                        <h3 className="text-sm font-black text-slate-900 tracking-tight leading-snug group-hover:text-[#D20A50] transition-colors line-clamp-1">
                          모태펀드-국민성장펀드 '투자 이어달리기' 가동...
                        </h3>
                        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                          정부가 모태펀드와 국민성장펀드를 연계해 벤처·스타트업이 글로벌 유니콘을 넘어 빅테크 기업으로... 기틀을 확고히 안착시키고, 혁신기업의 성장...
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* BAND 3: CSES AI HUB 플랫폼 가이드 */}
              <div className="space-y-6 pt-4 text-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-slate-400 shrink-0" />
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">CSES AI HUB 플랫폼 가이드</h2>
                  </div>
                  <p className="text-slate-400 text-xs md:text-sm font-medium">
                    연구 효율을 극대화하는 5가지 지능형 핵심 기능을 확인해보세요.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                  {/* Guide Card 1 */}
                  <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-xs flex flex-col justify-between text-start min-h-[280px]">
                    <div className="space-y-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <HomeIcon className="w-5 h-5 text-slate-500" />
                      </div>
                      <h4 className="font-extrabold text-[#D20A50] text-sm">01. 홈 (Home)</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                        AI 뉴스, 교육 역량 진단 등 플랫폼의 모든 주요 서비스를 한눈에 모아보는 편리한 시작 화면입니다.
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveTab("Home")}
                      className="text-[11px] font-bold text-[#D20A50] hover:underline pt-4 text-left cursor-pointer"
                    >
                      홈 바로가기 &gt;
                    </button>
                  </div>

                  {/* Guide Card 2 */}
                  <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-xs flex flex-col justify-between text-start min-h-[280px]">
                    <div className="space-y-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-slate-500" />
                      </div>
                      <h4 className="font-extrabold text-[#D20A50] text-sm">02. AI 교육</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                        나의 AI 활용 능력을 간단한 설문으로 진단하고, 비전공자부터 전문가 수준까지 딱 맞는 맞춤 강좌를 추천받습니다.
                      </p>
                    </div>
                    <button 
                      onClick={handleStartSurvey}
                      className="text-[11px] font-bold text-[#D20A50] hover:underline pt-4 text-left cursor-pointer"
                    >
                      자가진단 시도 &gt;
                    </button>
                  </div>

                  {/* Guide Card 3 */}
                  <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-xs flex flex-col justify-between text-start min-h-[280px]">
                    <div className="space-y-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Newspaper className="w-5 h-5 text-slate-500" />
                      </div>
                      <h4 className="font-extrabold text-[#D20A50] text-sm">03. AI 뉴스</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                        어렵고 복잡한 글로벌 인공지능 소식과 트렌드 정책자료를 국문 3줄 핵심 요약으로 편리하게 파악합니다.
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveTab("DailyNews")}
                      className="text-[11px] font-bold text-[#D20A50] hover:underline pt-4 text-left cursor-pointer"
                    >
                      뉴스 전체 보기 &gt;
                    </button>
                  </div>

                  {/* Guide Card 4 */}
                  <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-xs flex flex-col justify-between text-start min-h-[280px]">
                    <div className="space-y-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Database className="w-5 h-5 text-slate-500" />
                      </div>
                      <h4 className="font-extrabold text-[#D20A50] text-sm">04. AI DB</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                        국내외 다양한 전문 연구 기관들의 AI 관련 사회적 가치(SV) 트렌드 분석 리포트, 측정 연구 자료 등의 핵심 보고서를 수합해 둔 라이브러리입니다.
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveTab("DeepInsight_DB")}
                      className="text-[11px] font-bold text-[#D20A50] hover:underline pt-4 text-left cursor-pointer"
                    >
                      보고서 탐색 &gt;
                    </button>
                  </div>

                  {/* Guide Card 5 */}
                  <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-xs flex flex-col justify-between text-start min-h-[280px]">
                    <div className="space-y-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Terminal className="w-5 h-5 text-slate-500" />
                      </div>
                      <h4 className="font-extrabold text-[#D20A50] text-sm">05. AI 프롬프트</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                        다양한 연구 시나리오에 즉시 투입 가능한 검증된 프롬프트 카드로 원내 실무 속도를 두 배로 증가시킵니다.
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveTab("DeepInsight_Prompt")}
                      className="text-[11px] font-bold text-[#D20A50] hover:underline pt-4 text-left cursor-pointer"
                    >
                      프롬프트 실행 &gt;
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
                            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 mt-1 shadow-sm border border-slate-200">
                              <Sparkles className="w-3.5 h-3.5" />
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

          {/* TAB 4-A: AI 프롬프트 실습 콘솔 */}
          {activeTab === "DeepInsight_Prompt" && (
            <div className="space-y-6 text-start" id="view-deep-insight-prompt">
              
              {/* Banner Section */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-[#D20A50] uppercase tracking-wider block">Specialist LLM Tools</span>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI 프롬프트 실습 콘솔</h2>
                  <p className="text-slate-500 text-xs md:text-sm">
                    논문 초록 핵심 국문 요약 번역, SDGs 공익 기안, 언론 홍보 자료 원고 초안 생성 등 목적 별 최적화 특화 원클릭 지원.
                  </p>
                </div>
              </div>

              {/* Main Prompt Tool Layout */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
                <div className="space-y-2">
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Terminal className="w-5 h-5 text-[#D20A50]" />
                    연구원 특화 AI 프롬프트 선택
                  </h3>
                  <p className="text-slate-400 text-xs">
                    하고 싶으신 연구 혹은 보도 서신 업무를 설정해 주십시오. 특화 템플릿 프레임이 즉각 조각됩니다.
                  </p>
                </div>

                {/* Grid Template Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { id: "translator", label: "학술 초록 번역", desc: "영문 논문 초록을 깔끔한 학술 용어를 구사한 국문으로 오역 없이 초고 정밀 이식합니다.", icon: FileText },
                    { id: "writer", label: "보도자료 기안", desc: "원하시는 보도 취지나 개요를 던져주시면, 육하원칙 문장 구성원칙을 고수한 세련된 홍보 원고를 자동 작필합니다.", icon: BookOpen },
                    { id: "advisor", label: "기획안 어드바이저", desc: "추진하시는 사회 가치 증진 프로젝트 요점을 기획 시안 형식으로 수합하여 SDGs 임팩트 핵심 강화점을 고도 구상합니다.", icon: SlidersHorizontal }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActivePromptTemplate(tab.id);
                        setPromptInputText("");
                        setPromptExecutionResult("");
                      }}
                      className={`p-5 rounded-2xl border text-start transition cursor-pointer flex flex-col gap-2 relative ${
                        activePromptTemplate === tab.id 
                          ? "bg-pink-50/50 border-[#D20A50] text-[#D20A50] font-black" 
                          : "bg-slate-50 border-slate-200/60 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <span className="text-xs font-black flex items-center gap-1.5 leading-tight">
                        <tab.icon className={`w-3.5 h-3.5 ${activePromptTemplate === tab.id ? "text-[#D20A50]" : "text-slate-400"}`} />
                        {tab.label}
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal leading-relaxed">{tab.desc}</span>
                      {activePromptTemplate === tab.id && (
                        <span className="absolute right-3 top-3 w-2 h-2 rounded-full bg-[#D20A50]" />
                      )}
                    </button>
                  ))}
                </div>

                {/* TextArea Console */}
                <div className="space-y-3">
                  <label className="text-[10.5px] font-bold text-slate-400 block uppercase">
                    실행 템플릿 기재내용: {currentTemplateObj ? currentTemplateObj.title : "학술 번역기"}
                  </label>
                  <textarea 
                    placeholder={currentTemplateObj ? currentTemplateObj.placeholder : "여기에 영문 초록이나 기획 개요를 작성해 주십시오..."}
                    value={promptInputText}
                    onChange={(e) => setPromptInputText(e.target.value)}
                    rows={8}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs md:text-sm outline-none focus:bg-white focus:border-[#D20A50] transition leading-relaxed text-slate-800"
                  />
                </div>

                <button 
                  onClick={handleExecutePrompt}
                  disabled={isPromptLoading || !promptInputText.trim()}
                  className="w-full bg-[#D20A50] hover:bg-pink-600 text-white font-extrabold text-xs md:text-sm py-4 p-4 rounded-xl shadow transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isPromptLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>수석 AI가 영문 번역 및 임팩트 작화 분석 보고서를 성화하는 중...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-pink-200 animate-spin-slow" />
                      <span>Gemini AI 학술 실무 지원 실행</span>
                    </>
                  )}
                </button>

                {/* Prompt Result Output */}
                {promptExecutionResult && (
                  <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 space-y-4 font-medium relative border border-slate-800">
                    <div className="flex justify-between items-center pb-3 border-b border-white/10">
                      <span className="text-[10px] text-[#D20A50] font-black tracking-widest uppercase">ANALYSIS RESULT PROMPT OUTPUT</span>
                      <button 
                        onClick={() => {
                          handleCopyToClipboard(promptExecutionResult);
                        }}
                        className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 cursor-pointer"
                      >
                        {isCopied ? <span className="text-emerald-400 font-bold">✓ 클립보드 복사완료</span> : <><Copy className="w-4 h-4" /> 결과 복사하기</>}
                      </button>
                    </div>
                    <p className="text-xs md:text-sm whitespace-pre-wrap leading-relaxed font-sans text-slate-200 font-semibold">{promptExecutionResult}</p>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* TAB 4-B: SROI 글로벌 리서치 데이터베이스 */}
          {activeTab === "DeepInsight_DB" && (
            <div className="space-y-6 text-start" id="view-deep-insight-db">
              
              {/* Banner Section */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-[#D20A50] uppercase tracking-wider block">Global SROI Database</span>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">SROI 글로벌 리서치 데이터베이스</h2>
                  <p className="text-slate-500 text-xs md:text-sm">
                    유네스코, 사회적가치연구원(CSES), 세계경제포럼(WEF) 측량 데이터 세트 조회 및 실시간 클라이언트 테이블 원터치 내려받기.
                  </p>
                </div>
                <button 
                  onClick={handleDownloadCSV}
                  className="py-3 px-5 bg-slate-900 text-white hover:bg-slate-850 text-xs font-extrabold rounded-xl transition inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="CSV 테이블 내려받기"
                >
                  <Download className="w-4 h-4 text-[#D20A50]" />
                  엑셀 CSV 대용량 내보내기
                </button>
              </div>

              {/* Advanced Filter Controller */}
              <div className="bg-white p-5 rounded-3xl border border-slate-205 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 block uppercase">리포트 단어 검색</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="제목, 기관명, 적요 검색..." 
                      value={reportSearchQuery}
                      onChange={(e) => setReportSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 text-xs px-3 py-3 pr-9 rounded-xl border border-slate-200 outline-none focus:bg-white focus:border-[#D20A50] transition"
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 block uppercase">연구 도표 구분</label>
                  <select
                    value={reportFilterCategory}
                    onChange={(e) => setReportFilterCategory(e.target.value)}
                    className="w-full bg-slate-50 text-xs p-3 px-3.5 rounded-xl border border-slate-200 outline-none font-bold"
                  >
                    <option value="전체">국가 구분 (전체)</option>
                    <option value="국내">국내 기관 (CSES, 원외 포함)</option>
                    <option value="국외">국외 글로벌 (WEF, UN, MIT 포함)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 block uppercase">정렬 기준 정밀 조정</label>
                  <select
                    value={reportSortKey}
                    onChange={(e) => setReportSortKey(e.target.value as any)}
                    className="w-full bg-slate-50 text-xs p-3 px-3.5 rounded-xl border border-slate-200 outline-none font-bold"
                  >
                    <option value="downloads">다운로드 인기순 고속정렬</option>
                    <option value="publishedYear">최신 정부/협회 간행물순</option>
                  </select>
                </div>
              </div>

              {/* Research Database list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                {filteredReports.map((report) => (
                  <div 
                    key={report.id}
                    className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-xs hover:border-[#D20A50]/40 transition flex flex-col justify-between gap-4 text-start"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-center gap-2">
                        <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg ${
                          report.category === "국내" ? "bg-blue-50 text-blue-800" : "bg-[#D20A50]/10 text-[#D20A50]"
                        }`}>
                          {report.category === "국내" ? "국내 보고서" : "해외 보고서"}
                        </span>
                        <span className="text-xs text-slate-400 font-mono font-semibold">{report.publishedYear}년 발행</span>
                      </div>

                      <h3 className="text-sm font-black text-slate-900 leading-snug line-clamp-1">
                        {report.title}
                      </h3>

                      <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                        {report.abstract}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {report.tags.map((tag, i) => (
                          <span key={i} className="text-[10px] bg-slate-105 text-slate-600 px-2 py-0.5 rounded-lg font-medium">#{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-bold">{report.institution}</span>
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-mono font-bold text-[10px] flex items-center gap-1">
                        <Download className="w-3 h-3 text-slate-500" />
                        {report.downloads.toLocaleString()}회 소집
                      </span>
                    </div>

                  </div>
                ))}
              </div>

              {filteredReports.length === 0 && (
                <div className="text-center text-xs text-slate-400 py-20 bg-white border border-slate-200/80 rounded-3xl">
                  일치하는 SROI 리서치 데이터베이스 간행물이 매치되지 않습니다. 다른 키워드를 입력해 주십시오.
                </div>
              )}

            </div>
          )}

          {/* TAB 5: Guide View */}
          {activeTab === "Guide" && (
            <div className="space-y-6 text-start animate-fade-in" id="view-platform-guide">
              {/* Main Banner */}
              <div className="bg-gradient-to-br from-[#D20A50] via-[#b80543] to-[#800028] text-white rounded-[32px] p-6 md:p-8 shadow-lg shadow-pink-900/10">
                <div className="max-w-3xl space-y-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/15 text-pink-100 border border-white/20">
                    <Sparkles className="w-3 h-3 text-pink-200" />
                    USER MANUAL
                  </span>
                  <h2 className="text-xl md:text-2xl font-black tracking-tight leading-snug">
                    CSES AI Insight Hub 플랫폼 종합 가이드
                  </h2>
                  <p className="text-pink-100/90 text-xs leading-relaxed font-semibold">
                    빅데이터 기술과 최신 대형언어모델(LLM)을 활용한 사회적 가치(SROI) 트렌드 자동화 및 학술 리서치 고도화를 지원하는 실무 가이드입니다.
                  </p>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* LEFT: STEP GUIDE */}
                <div className="lg:col-span-8 space-y-6">
                  
                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
                    <h3 className="font-extrabold text-slate-900 text-sm md:text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                      <SlidersHorizontal className="w-4.5 h-4.5 text-[#D20A50]" />
                      핵심 기능 기동 및 이용 가이드
                    </h3>

                    <div className="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-8">
                      
                      {/* Step 1 */}
                      <div className="relative">
                        <span className="absolute -left-10 top-0.5 w-7 h-7 rounded-full bg-pink-100 text-[#D20A50] border-2 border-white font-mono text-xs font-black flex items-center justify-center shadow-sm">
                          1
                        </span>
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2 font-extrabold text-slate-800 text-sm">
                            <span>실시간 포털 뉴스 수집 & 실시간 AI 임팩트 브리핑 (Daily News)</span>
                            <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">#트렌드 분석</span>
                          </div>
                          <p className="text-slate-500 text-xs leading-relaxed">
                            네이버 뉴스 실시간 연동 포털에서 <b>특정 키워드(#사회적가치 인공지능, #ESG AI 등)</b>로 발행된 최신 기사를 수집합니다. 
                            뉴스 목록에서 기사를 선택하면 우측 패널에서 Gemini AI 엔진이 기사의 원문을 해독하여 <b>SROI 및 ESG 관점의 1줄 에센셜 통찰 요점</b>을 3초 만에 생성해 제공합니다.
                          </p>
                          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 font-sans space-y-2 max-w-xl">
                            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-100">
                              <span>뉴스 추출 시뮬레이션</span>
                              <span className="text-green-600 font-bold flex items-center gap-1">● ACTIVE</span>
                            </div>
                            <div className="p-2 py-1.5 bg-white rounded-lg border border-slate-100 text-xs font-bold text-slate-800 flex items-center justify-between">
                              <span className="truncate flex items-center gap-1.5">
                                <Newspaper className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                기업 ESG 탄소 배출량 관리, AI 기술과 만나 검증 고도화 실현
                              </span>
                              <button onClick={() => setActiveTab("DailyNews")} className="text-[10px] text-[#D20A50] font-bold hover:underline whitespace-nowrap ml-2">실습하기 →</button>
                            </div>
                            <div className="bg-white/70 rounded-xl p-2.5 border border-slate-100 text-[11px] leading-relaxed text-slate-600 space-y-1">
                              <span className="text-[9px] font-extrabold uppercase text-[#D20A50] tracking-wider block">GEMINI CORE LOGIC</span>
                              <p className="font-semibold text-slate-700">"본 기사는 AI를 활용한 신속한 온실가스 저감 성과 기재 및 SROI 측정 오차 축소 혁신 동향을 규명하고 있습니다."</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="relative">
                        <span className="absolute -left-10 top-0.5 w-7 h-7 rounded-full bg-pink-100 text-[#D20A50] border-2 border-white font-mono text-xs font-black flex items-center justify-center shadow-sm">
                          2
                        </span>
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2 font-extrabold text-slate-800 text-sm">
                            <span>자가진단 기획 & 초정밀 지식 큐레이션 코칭 (AI Classroom)</span>
                            <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold">#교육 로드맵</span>
                          </div>
                          <p className="text-slate-500 text-xs leading-relaxed">
                            나만의 리서치 레벨과 연구 목적을 체크하는 <b>3단계 자가진단(Survey)</b>을 진행합니다. 
                            진단이 종료되면 최적 학술 과정 1위가 특별 마킹되어 상단에 고정됩니다. 해당 과목을 클릭하면 전용 학습 챗방이 활성화되어 <b>AI 튜터와 커리큘럼 계획, 개념 질문 대화</b>를 실시간 1:1로 나눌 수 있습니다.
                          </p>
                          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 font-sans space-y-3 max-w-xl">
                            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-100">
                              <span>학습 매칭 시뮬레이션</span>
                              <span className="text-indigo-600 font-bold">● ROADMAP LOADED</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div className="p-3 bg-white rounded-xl border border-pink-200 shadow-xs relative">
                                <span className="absolute top-1 right-2 text-[8px] bg-pink-100 text-[#D20A50] px-1 rounded font-bold">최적추천</span>
                                <p className="font-extrabold text-slate-800 truncate">SROI 화폐계측 초급 수료 교육</p>
                                <p className="text-slate-400 text-[10px] mt-0.5">난이도: 입문자 코스</p>
                              </div>
                              <div className="p-3 bg-white/45 rounded-xl border border-slate-100">
                                <p className="font-extrabold text-slate-400 truncate">임팩트 평가 전문가 워크숍</p>
                                <p className="text-slate-400 text-[10px] mt-0.5">난이도: 숙련 실무자</p>
                              </div>
                            </div>
                            <button onClick={() => setActiveTab("AIClassroom")} className="w-full text-center py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold transition">
                              강의실로 이동하여 자가진단 수행하기 🎯
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="relative">
                        <span className="absolute -left-10 top-0.5 w-7 h-7 rounded-full bg-pink-100 text-[#D20A50] border-2 border-white font-mono text-xs font-black flex items-center justify-center shadow-sm">
                          3
                        </span>
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2 font-extrabold text-slate-800 text-sm">
                            <span>전문 번역·보도기획 프롬프트 실증 & 가치 DB 소장 (Deep Insight)</span>
                            <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">#리서치 보정</span>
                          </div>
                          <p className="text-slate-500 text-xs leading-relaxed">
                            전문 학술 작업을 위한 <b>기획서 보충용 프롬프트 템플릿(초록 영역 번역, 언론 보도자료 초안)</b> 콘솔을 가동합니다. 
                            필요한 포맷 카드를 지정하고 텍스트만 채워 넣으면 전문가 수준으로 정밀 보정된 기안문을 완성할 수 있으며, 하단의 <b>공인 SROI 계측 데이터셋 정보</b>는 필터링하여 윈도우 원클릭 CSV 엑셀 백업본으로 직접 다운로드할 수 있습니다.
                          </p>
                          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 font-sans space-y-2 max-w-xl">
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span>CSV 엑셀 일괄 추출 시뮬레이션</span>
                              <span className="text-amber-600 font-bold">● DATASHEET ACTIVE</span>
                            </div>
                            <div className="bg-white p-3 rounded-xl border border-slate-200/50 flex items-center justify-between text-xs font-bold text-slate-700">
                              <span className="flex items-center gap-2 truncate">
                                <Database className="w-4 h-4 text-slate-400 shrink-0" />
                                CSES_SROI_Report_Archive_2026.csv
                              </span>
                              <button onClick={() => setActiveTab("DeepInsight_DB")} className="px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition text-[10px] shrink-0 font-bold">
                                즉시 백업 받기
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

                {/* RIGHT: PRO TIPS */}
                <div className="lg:col-span-4 space-y-6">
                  
                  <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-md space-y-4">
                    <h3 className="font-extrabold text-xs tracking-wide uppercase text-pink-400 flex items-center gap-1.5 border-b border-slate-800 pb-3">
                      <Sparkles className="w-4.5 h-4.5 text-pink-400" />
                      CSES 연구원 꿀팁 가이드
                    </h3>

                    <div className="space-y-4">
                      <div className="space-y-1 text-start">
                        <h4 className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                          프롬프트 클립보드 활용
                        </h4>
                        <p className="text-[11.5px] text-slate-300 leading-relaxed">
                          프롬프트 실증도구를 실행하여 도출된 완벽한 국어/영어 결과문은 상단의 <b>[결과 복사하기]</b> 버튼 한 번으로 클립보드에 초정밀 자동 보관됩니다.
                        </p>
                      </div>

                      <div className="space-y-1 text-start pt-2 border-t border-slate-800">
                        <h4 className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                          <Search className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                          실시간 네이버 동향 다차원 분석
                        </h4>
                        <p className="text-[11.5px] text-slate-300 leading-relaxed">
                          포털 동향 메뉴에서 검색어 기재 부분 외에, 등록된 핵심 추천 태그인 <b>#사회적가치 인공지능 / #ESG AI</b>를 클릭만 해도 즉석에서 쿼리가 주입됩니다.
                        </p>
                      </div>

                      <div className="space-y-1 text-start pt-2 border-t border-slate-800">
                        <h4 className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                          <Send className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                          수준별 AI 코칭 가변성
                        </h4>
                        <p className="text-[11.5px] text-slate-300 leading-relaxed">
                          AI Classroom의 챗봇 상담은 SROI 자가 진단을 완수한 이력을 능동적으로 연동하여, 대답의 예시와 개념 난이도를 주체적으로 가변합니다.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-slate-900 text-sm border-b border-slate-100 pb-2">
                       자주 묻는 질문 (FAQ)
                    </h3>
                    
                    <div className="space-y-3 pb-2">
                      <details className="group border-b border-slate-100 pb-2 cursor-pointer">
                        <summary className="list-none flex justify-between items-center text-xs font-bold text-slate-800 group-open:text-[#D20A50]">
                          <span>Q. 뉴스 임팩트 요약 요강 출처는?</span>
                          <span className="text-slate-400 group-open:rotate-180 transition-transform duration-200">▼</span>
                        </summary>
                        <p className="text-[11px] text-slate-500 leading-relaxed mt-2 pl-1">
                          네이버 뉴스 실시간 검색 연동 API에서 발췌된 기사 명세를 직접 추출하여, Gemini가 핵심 연구 통찰 맥락으로 고속 요약 정밀 생성합니다.
                        </p>
                      </details>

                      <details className="group border-b border-slate-100 pb-2 cursor-pointer">
                        <summary className="list-none flex justify-between items-center text-xs font-bold text-slate-800 group-open:text-[#D20A50]">
                          <span>Q. 자가진단을 리셋하는 방법은?</span>
                          <span className="text-slate-400 group-open:rotate-180 transition-transform duration-200">▼</span>
                        </summary>
                        <p className="text-[11px] text-slate-500 leading-relaxed mt-2 pl-1">
                          맞춤형 AI 강의실의 상단 혹은 홈 우측의 큐레이션 자가진단 카드를 재클릭 후 <b>'다시 추천받기'</b> 혹은 큐레이션 초기화 과정을 완수하면 언제나 새로운 결과 배치가 부여됩니다.
                        </p>
                      </details>

                      <details className="group border-b border-slate-100 pb-2 cursor-pointer">
                        <summary className="list-none flex justify-between items-center text-xs font-bold text-slate-800 group-open:text-[#D20A50]">
                          <span>Q. 엑셀 CSV 인코딩 문제 해결하기?</span>
                          <span className="text-slate-400 group-open:rotate-180 transition-transform duration-200">▼</span>
                        </summary>
                        <p className="text-[11px] text-slate-500 leading-relaxed mt-2 pl-1">
                          CSES AI Hub에서 추출하는 CSV 파일은 한글 마이크로소프트 엑셀 유니코드 호환을 위해 BOM 바이트 헤더(UTF-8 BOM)를 내장해 내보내므로, 글자 깨짐 현상 없이 완벽 구동됩니다.
                        </p>
                      </details>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          )}

        </main>

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
                    { val: "입문", title: "입문 과정", desc: "개념 정립 및 사회적 가치의 측정 당위성을 이해해보고 싶습니다.", icon: Award },
                    { val: "중급", title: "중급 실무", desc: "이중 중요성 평가 지표 수립이나 SROI 정량 산출 실무를 다룹니다.", icon: SlidersHorizontal },
                    { val: "고급", title: "고급 응용 / 세미나", desc: "AI RAG 융합 프롬프트 가시성 및 글로벌 Net zero 공조 가치 방향을 연구합니다.", icon: BookOpen }
                  ].map((opt) => (
                    <button 
                      key={opt.val}
                      onClick={() => handleSurveyOption("level", opt.val)}
                      className="text-left p-4 rounded-2xl border border-slate-200 hover:border-[#D20A50] hover:bg-pink-50/10 transition cursor-pointer flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                        <opt.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-xs md:text-sm">{opt.title}</h5>
                        <p className="text-[11px] text-slate-500 mt-1">{opt.desc}</p>
                      </div>
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
                    { val: "사회공헌", title: "사회공헌 & 소셜 비즈니스", desc: "소셜 벤처 생태계 활성화 및 기업 공동 가치 창출(CSV)", icon: HelpCircle },
                    { val: "ESG 공시", title: "ESG 정보공시 및 글로벌 지표 수립", desc: "GRI 2.0 표준, 탄소 Scope 3 회계 평가론", icon: FileText },
                    { val: "지역혁신", title: "지역 소멸 방지 및 로컬 펀딩 대안", desc: "자생적 로컬 생태계 거점 청정 산업군 설계", icon: Info }
                  ].map((opt) => (
                    <button 
                      key={opt.val}
                      onClick={() => handleSurveyOption("topic", opt.val)}
                      className="text-left p-4 rounded-2xl border border-slate-200 hover:border-[#D20A50] hover:bg-pink-50/10 transition cursor-pointer flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                        <opt.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-xs md:text-sm">{opt.title}</h5>
                        <p className="text-[11px] text-slate-500 mt-1">{opt.desc}</p>
                      </div>
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
                    { val: "SV 측정", title: "정량 성과 화폐화 공식 및 SROI", desc: "사회적 편익을 직접 공식에 의해 화폐액으로 치환", icon: Clock },
                    { val: "AI 프롬프트", title: "AI RAG 프롬프팅 조절 기술", desc: "수작업을 탈피하여 리서치 초록 요약을 자동 지능화", icon: Terminal },
                    { val: "SDGs", title: "글로벌 SDGs 연계 연합", desc: "유네스코 표준 및 해외 포럼 지침 매트릭스 고도화", icon: Database }
                  ].map((opt) => (
                    <button 
                      key={opt.val}
                      onClick={() => handleSurveyOption("skill", opt.val)}
                      className="text-left p-4 rounded-2xl border border-slate-200 hover:border-[#D20A50] hover:bg-pink-50/10 transition cursor-pointer flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                        <opt.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-xs md:text-sm">{opt.title}</h5>
                        <p className="text-[11px] text-slate-500 mt-1">{opt.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4: Survey Outcome */}
            {surveyStep === 4 && (
              <div className="space-y-4" id="diagnostic-survey-result-p">
                <div className="text-center space-y-3 py-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-[#D20A50] border border-slate-200 flex items-center justify-center mx-auto">
                    <Award className="w-6 h-6" />
                  </div>
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
