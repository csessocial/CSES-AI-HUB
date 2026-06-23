import React, { useState, useEffect } from "react";
import { ArrowRight, BookOpen, Newspaper, Database, Terminal, ShieldAlert, Sparkles, Clock, Globe } from "lucide-react";
import { SEED_NEWS, NewsArticle } from "../types";
import { motion } from "motion/react";

interface HomeDefaultProps {
  onNavigate: (tab: string) => void;
  onOpenGuide: () => void;
}

export default function HomeDefault({ onNavigate, onOpenGuide }: HomeDefaultProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format UTC Time
  const formatUTC = (date: Date) => {
    return date.toUTCString().replace("GMT", "UTC");
  };

  // Dynamic message based on current Hour
  const getCurrentGreeting = () => {
    const hour = time.getHours();
    if (hour >= 6 && hour < 12) {
      return {
        title: "몰입도 높은 연구 설계 단계",
        desc: "좋은 아침입니다! 이른 오전은 신뢰성 높은 선행 연구 검토와 SV 데이터 기획에 가장 적합한 골든타임입니다."
      };
    } else if (hour >= 12 && hour < 14) {
      return {
        title: "에너지 리차징 및 네트워킹",
        desc: "즐거운 점심시간입니다. 잠시 연구 압박을 내려놓고 최신 동향 뉴스를 가볍게 큐레이션하며 새로운 사회적 공헌 인사이트를 싹틔우세요."
      };
    } else if (hour >= 14 && hour < 18) {
      return {
        title: "심층 분석 및 통계 고도화",
        desc: "오후 리서치에 지혜가 한층 풍부해지는 시간입니다. 'AI 교육 큐레이션 코치' 혹은 'AI DB'를 통하여 SROI 설계 지침을 검증해 보면 어떨까요?"
      };
    } else {
      return {
        title: "오늘의 통찰을 정제하는 석조",
        desc: "지속 가능한 미래를 위해 하루 동안 쏟은 연구원님의 땀방울이 사회적 성과(SV)로 실현되기를 기원합니다. 편안하고 행복한 저녁 되십시오."
      };
    }
  };

  const greeting = getCurrentGreeting();
  const latestNews = SEED_NEWS.slice(0, 2);

  return (
    <div className="space-y-8" id="home-dashboard-container">
      {/* Visual Welcome Banner */}
      <section 
        className="relative overflow-hidden bg-gradient-to-r from-plum-800 via-plum-700 to-slate-900 text-white rounded-3xl p-8 md:p-12 shadow-xl glow-plum"
        id="home-welcome-hero"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-plum-600/30 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-plum-500/20 text-plum-100 border border-plum-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              CSES 지능형 연구 파트너 활성화됨
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight font-display">
              사회적 현안 해결을 위한<br />
              <span className="text-amber-300">지능형 리서치</span> 엔진
            </h1>
            <p className="text-slate-200 text-sm md:text-base max-w-xl leading-relaxed">
              본 플랫폼은 사회적가치연구원(CSES) 연구진들이 글로벌 ESG 변화에 신첩하게 기동하고, 복잡한 사회성과 측정 방법론을 AI 프롬프트와 챗봇 기반으로 자동 고도화할 수 있도록 지원합니다.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button 
                onClick={onOpenGuide}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs md:text-sm rounded-xl transition duration-200 shadow-md inline-flex items-center gap-2 cursor-pointer"
                id="btn-platform-guide-hero"
              >
                플랫폼 전체 가이드 보기
                <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onNavigate("AI 프롬프트")}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-medium text-xs md:text-sm rounded-xl border border-white/20 transition duration-200 inline-flex items-center gap-1.5"
              >
                임팩트 프롬프트 바로 실습
              </button>
            </div>
          </div>

          {/* Sync Clocks widget */}
          <div className="bg-slate-950/40 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-4 shadow-inner" id="live-time-widget">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-plum-350" /> Live Synchronizer
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono font-medium animate-pulse">● ONLINE</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-slate-400 tracking-wider">LOCAL TIME (SEOUL)</p>
                <p className="text-2xl font-bold font-mono text-amber-300 tracking-tight" id="clock-local">
                  {time.toLocaleTimeString("ko-KR", { hour12: false })}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">
                  {time.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" })}
                </p>
              </div>

              <div className="pt-2 border-t border-white/5">
                <p className="text-[10px] text-slate-400 tracking-wider flex items-center gap-1">
                  <Globe className="w-3 h-3 text-slate-400" /> SYSTEM UTC TIME
                </p>
                <p className="text-sm font-semibold font-mono text-slate-200" id="clock-utc">
                  {formatUTC(time).substring(17, 25)} UTC
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  {formatUTC(time).substring(0, 16)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Time Greeting Zone */}
      <section className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-xs font-bold text-plum-600 tracking-widest uppercase">현재 최적 연구원 분석 스케줄</span>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            🧭 {greeting.title}
          </h2>
          <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
            {greeting.desc}
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-end md:self-auto px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-mono text-slate-500">
          <span>Target Access:</span>
          <span className="font-semibold text-slate-700">cses.social@cses.re.kr</span>
        </div>
      </section>

      {/* Main Grid: Launchers & News Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Quick Launchers - Phase 1 Menu */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-plum-600" />
            핵심 인공지능 연구원 서비스 기동
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Coach launcher */}
            <div 
              onClick={() => onNavigate("교육 과정")}
              className="bg-white hover:bg-plum-50/25 p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-plum-100 flex items-center justify-center text-plum-600 group-hover:bg-plum-600 group-hover:text-white transition-colors duration-200">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm md:text-base group-hover:text-plum-700 transition-colors flex items-center gap-1">
                  CSES 큐레이션 코치
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0 transition-all" />
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  나의 지식을 체크하고 맞춤 추천 설문과 AI 챗봇과 실시간 가이드 상담을 나눕니다.
                </p>
              </div>
            </div>

            {/* News launcher */}
            <div 
              onClick={() => onNavigate("동향 뉴스")}
              className="bg-white hover:bg-plum-50/25 p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors duration-200">
                <Newspaper className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm md:text-base group-hover:text-teal-700 transition-colors flex items-center gap-1">
                  실시간 ESG / SV 동향 분석
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0 transition-all" />
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  매이저 뉴스의 핵심 줄기를 Gemini 임팩트 요약 엔진으로 실시간 1줄 추리합니다.
                </p>
              </div>
            </div>

            {/* DB launcher */}
            <div 
              onClick={() => onNavigate("AI DB")}
              className="bg-white hover:bg-plum-50/25 p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm md:text-base group-hover:text-blue-700 transition-colors flex items-center gap-1">
                  사회적 가치 보고서 아카이브
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0 transition-all" />
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  국내외 신인도 높은 SV 평가지표 서류를 백업 정렬 및 즉각 엑셀 CSV 공유합니다.
                </p>
              </div>
            </div>

            {/* Prompt launcher */}
            <div 
              onClick={() => onNavigate("AI 프롬프트")}
              className="bg-white hover:bg-plum-50/25 p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-200">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm md:text-base group-hover:text-amber-700 transition-colors flex items-center gap-1">
                  연구 전용 프롬프트 센터
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transform translate-x-[-4px] group-hover:translate-x-0 transition-all" />
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  번역, 기사, 기획서 강화 등 최고 정밀도의 보정 프롬프트 템플릿 실증 콘솔입니다.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Real-time Trend Sidebar Preview */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
            <Newspaper className="w-4 h-4 text-teal-600" />
            핵심 동향 기사 미리보기
          </h3>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            {latestNews.map((news) => (
              <div 
                key={news.id}
                onClick={() => onNavigate("동향 뉴스")}
                className="group border-b border-slate-100 last:border-0 pb-4 last:pb-0 cursor-pointer space-y-2 hover:opacity-95"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-widest text-plum-600 bg-plum-50 px-2 py-0.5 rounded-md">
                    {news.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{news.publishedAt}</span>
                </div>
                <h4 className="font-bold text-slate-800 text-xs md:text-sm line-clamp-1 group-hover:text-plum-600 transition-colors">
                  {news.title}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {news.description}
                </p>
                <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 pt-1">
                  <span>원문 매체: {news.source}</span>
                  <span>•</span>
                  <span>{news.readTime}</span>
                </div>
              </div>
            ))}

            <button 
              onClick={() => onNavigate("동향 뉴스")}
              className="w-full text-center text-xs text-plum-600 hover:text-plum-700 font-bold py-2 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition duration-200 cursor-pointer block"
            >
              전체 뉴스 브리핑 리스트로 이동
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
