
import React, { useEffect, useRef, useState } from 'react';
import { Icons } from '../components/Icons';
import * as d3 from 'd3';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, YAxis } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { PageRoute, QALog } from '../types';
import { dbService } from '../services/dbService';
import { HelpCircle, RefreshCw, ExternalLink, AlertTriangle } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const d3Container = useRef<SVGSVGElement>(null);
  const [period, setPeriod] = useState<'일간' | '주간' | '월간' | '연간'>('주간');
  
  // Data States
  const [totalChats, setTotalChats] = useState(0);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [failures, setFailures] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [keywordData, setKeywordData] = useState<any[]>([]);
  
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [isChecking, setIsChecking] = useState(false);

  // Modal State
  const [selectedLog, setSelectedLog] = useState<QALog | null>(null);

  // Helpers
  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return '방금 전';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  const formatSize = (bytes: number) => {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const fetchData = async () => {
      setIsChecking(true);
      const status = await dbService.initDB();
      setConnectionStatus(status);
      
      if (status === 'connected') {
          const stats = await dbService.getDashboardStats();
          if (stats) {
              setTotalChats(stats.totalChats);
              
              // Map recent chats (QALog)
              if (stats.recentChats) {
                  setRecentChats(stats.recentChats.map(c => ({
                      ...c, // keep full object for modal
                      displayTitle: c.question || "질문 내용 없음",
                      time: getTimeAgo(c.createdAt)
                  })));
              }

              // Map documents
              if (stats.documents) {
                  setDocuments(stats.documents.map(d => ({
                      name: d.title,
                      time: getTimeAgo(d.createdAt),
                      size: formatSize(d.sizeBytes)
                  })));
              }

              // Map failures
              if (stats.failures) {
                  setFailures(stats.failures.map(f => ({
                      query: f.questionKey,
                      count: f.failCount,
                      rate: 100 
                  })));
              }

              // Map chart data
              if (stats.dailyStats) {
                  setChartData(stats.dailyStats.map(d => ({
                      name: d.day.substring(5), // MM-DD
                      value: d.messageCount
                  })));
              }

              // Map keywords to d3 format
              if (stats.topKeywords) {
                  const colors = ["#fbbf24", "#f87171", "#4ade80", "#fb923c", "#facc15", "#a3e635", "#2dd4bf", "#f472b6", "#c084fc", "#ef4444", "#60a5fa"];
                  const mappedKeywords = stats.topKeywords.map((k, i) => ({
                      text: k.keyword,
                      size: Math.max(14, Math.min(60, 20 + k.count * 10)), // Scale size
                      color: colors[i % colors.length]
                  }));
                  setKeywordData(mappedKeywords);
                  renderWordCloud(mappedKeywords);
              }
          }
      } else {
          // Fallback to local mockup if needed
          setChartData([]);
      }
      setIsChecking(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderWordCloud = (data: any[]) => {
    if (!d3Container.current || data.length === 0) return;
    const width = d3Container.current.clientWidth;
    const height = d3Container.current.clientHeight;
    
    const d3Any = d3 as any;
    const svg = d3Any.select(d3Container.current);
    svg.selectAll("*").remove(); 
    
    const nodes = data.map(d => ({ ...d, x: width/2, y: height/2 }));

    const simulation = d3Any.forceSimulation(nodes)
        .force("charge", d3Any.forceManyBody().strength(-100))
        .force("center", d3Any.forceCenter(width / 2, height / 2))
        .force("collide", d3Any.forceCollide().radius((d: any) => d.size * 0.8).strength(0.8));

    for (let i = 0; i < 300; ++i) simulation.tick();

    svg.append("g")
       .selectAll("text")
       .data(nodes)
       .enter()
       .append("text")
       .text((d: any) => d.text)
       .attr("x", (d: any) => d.x)
       .attr("y", (d: any) => d.y)
       .attr("text-anchor", "middle")
       .attr("dominant-baseline", "central")
       .style("font-size", (d: any) => `${d.size}px`)
       .style("font-family", "Inter, sans-serif")
       .style("font-weight", "900")
       .style("fill", (d: any) => d.color)
       .style("text-shadow", "0px 2px 4px rgba(0,0,0,0.3)");
  };

  const renderStatusBadge = () => {
      if (connectionStatus === 'connected') {
          return (
             <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-green-500/20 border-green-400 text-green-300">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Azure DB 연결됨
            </div>
          );
      } else if (connectionStatus === 'config_error') {
          return (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-red-500/20 border-red-400 text-red-300">
                <AlertTriangle size={12} /> DB 설정 오류
            </div>
          );
      } else {
          return (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-gray-600/50 border-gray-500 text-gray-300">
                <div className="w-2 h-2 rounded-full bg-gray-400" /> 로컬 모드
            </div>
          );
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans relative">
      {/* Detail Modal */}
      {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelectedLog(null)}>
              <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                      <h3 className="text-lg font-bold text-gray-900">
                          {selectedLog.isFailed ? '⚠️ 응답 실패 상세' : '💬 대화 상세 내용'}
                      </h3>
                      <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-gray-600">
                          <Icons.Close size={24} />
                      </button>
                  </div>
                  <div className="p-6 space-y-6">
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">질문 (Question)</label>
                          <div className="bg-gray-50 p-4 rounded-xl text-gray-900 leading-relaxed border border-gray-200">
                              {selectedLog.question || "(질문 내용 없음)"}
                          </div>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                              {selectedLog.isFailed ? '실패 원인 / 상태' : '답변 (Answer)'}
                          </label>
                          {selectedLog.isFailed ? (
                              <div className="bg-red-50 p-4 rounded-xl text-red-700 border border-red-100 flex items-center gap-3">
                                  <AlertTriangle size={20} />
                                  <span>응답 생성에 실패했습니다. (네트워크 오류 또는 모델 응답 불가)</span>
                              </div>
                          ) : (
                              <div className="bg-purple-50 p-4 rounded-xl text-gray-900 leading-relaxed border border-purple-100 whitespace-pre-wrap">
                                  {selectedLog.answer}
                              </div>
                          )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 pt-4 border-t border-gray-100">
                          <div>
                              <span className="font-semibold">세션 ID:</span> {selectedLog.sessionId}
                          </div>
                          <div className="text-right">
                              <span className="font-semibold">일시:</span> {new Date(selectedLog.createdAt).toLocaleString()}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Bar */}
        <div className="bg-[#5b21b6] rounded-xl px-6 py-4 flex flex-col md:flex-row justify-between items-center text-white shadow-lg gap-4">
           <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
               <div className="flex items-center gap-3">
                   <Icons.Chat size={24} className="text-white opacity-80" />
                   <span className="text-lg font-bold">총 대화수 <span className="ml-2 text-2xl">{totalChats.toLocaleString()}</span></span>
               </div>
               
               <div className="flex items-center gap-2 sm:ml-4 bg-[#4c1d95] rounded-full p-1 pr-3">
                   {renderStatusBadge()}
                   <button 
                        onClick={fetchData}
                        disabled={isChecking}
                        className={`p-1.5 rounded-full hover:bg-white/10 transition-colors ${isChecking ? 'animate-spin' : ''}`}
                   >
                       <RefreshCw size={14} className="text-white/80" />
                   </button>
               </div>
           </div>
           
           <div className="flex bg-[#4c1d95] rounded-lg p-1">
               {(['일간', '주간', '월간', '연간'] as const).map((p) => (
                   <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${period === p ? 'bg-[#d946ef] text-white shadow-md' : 'text-purple-300 hover:text-white hover:bg-white/10'}`}>
                       {p}
                   </button>
               ))}
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Word Cloud */}
            <div className="lg:col-span-2 bg-[#4c1d95] rounded-xl p-6 shadow-xl relative overflow-hidden min-h-[400px]">
                 <div className="flex items-center gap-2 mb-2 relative z-10">
                     <Icons.Zap className="text-yellow-400" size={20} fill="currentColor" />
                     <h3 className="text-white font-medium text-lg">사용자들은 무엇을 물어볼까요?</h3>
                 </div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-purple-600/30 blur-[80px] rounded-full pointer-events-none"></div>
                 {keywordData.length === 0 && (
                     <div className="absolute inset-0 flex items-center justify-center text-purple-300/50">데이터가 충분하지 않습니다</div>
                 )}
                 <svg ref={d3Container} className="w-full h-full absolute inset-0 z-0"></svg>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
                
                {/* Recent Activity */}
                <div className="bg-[#5b21b6] rounded-xl p-0 shadow-xl overflow-hidden flex flex-col h-[200px]">
                    <div className="px-5 py-3 border-b border-purple-800/50 flex justify-between items-center bg-[#4c1d95]">
                        <h3 className="text-white text-sm font-bold flex items-center gap-2">
                           <HelpCircle size={14} className="text-white" /> 최근 질문 목록
                        </h3>
                    </div>
                    <div className="p-2 space-y-1 overflow-y-auto">
                        {recentChats.length > 0 ? recentChats.map((item, i) => (
                            <div 
                                key={i} 
                                onClick={() => setSelectedLog(item)}
                                className="px-3 py-2 border-b border-purple-800/30 last:border-0 rounded-lg flex justify-between items-center hover:bg-white/10 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-2 overflow-hidden flex-1">
                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.isFailed ? 'bg-red-500' : 'bg-pink-500'}`} />
                                    <span className="text-sm text-gray-200 truncate pr-2">{item.displayTitle}</span>
                                </div>
                                <span className="text-[10px] text-purple-300 whitespace-nowrap shrink-0">{item.time}</span>
                            </div>
                        )) : (
                            <div className="h-full flex flex-col items-center justify-center text-purple-300/50">
                                <span className="text-xs">데이터가 없습니다</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Upload Changes */}
                <div className="bg-[#5b21b6] rounded-xl p-0 shadow-xl overflow-hidden flex flex-col h-[200px]">
                    <div className="px-5 py-3 border-b border-purple-800/50 flex justify-between items-center bg-[#4c1d95]">
                        <h3 className="text-white text-sm font-bold flex items-center gap-2">
                           <Icons.Upload size={14} /> 학습된 지식 데이터
                        </h3>
                    </div>
                    <div className="p-2 space-y-1 overflow-y-auto">
                         {documents.length > 0 ? documents.map((item, i) => (
                            <div key={i} className="px-3 py-2 hover:bg-white/10 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <Icons.File size={16} className="text-purple-300 shrink-0" />
                                    <span className="text-sm text-gray-200 truncate">{item.name}</span>
                                </div>
                                <div className="text-right shrink-0 ml-2">
                                    <div className="text-[10px] text-purple-300">{item.time}</div>
                                    <div className="text-[10px] text-gray-400">{item.size}</div>
                                </div>
                            </div>
                        )) : (
                            <div className="h-full flex flex-col items-center justify-center text-purple-300/50">
                                <span className="text-xs">데이터가 없습니다</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Row - Chart */}
            <div className="lg:col-span-2 bg-[#4c1d95] rounded-xl p-6 shadow-xl h-[280px]">
                 <div className="flex items-center gap-2 mb-4">
                     <Icons.TrendingUp className="text-white" size={20} />
                     <h3 className="text-white font-medium text-lg">대화량 추이</h3>
                 </div>
                 <div className="h-[200px] w-full" style={{ minHeight: '200px' }}>
                     {chartData.length > 0 ? (
                         <div style={{ width: '100%', height: '100%' }}>
                             <ResponsiveContainer width="100%" height="100%">
                                 <AreaChart data={chartData}>
                                     <defs>
                                         <linearGradient id="colorChart" x1="0" y1="0" x2="0" y2="1">
                                             <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                                             <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                                         </linearGradient>
                                     </defs>
                                     <XAxis dataKey="name" stroke="#a78bfa" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                     <YAxis hide />
                                     <Tooltip contentStyle={{ backgroundColor: '#2e1065', borderRadius: '8px', border: 'none', color: '#fff' }} />
                                     <Area type="monotone" dataKey="value" stroke="#c084fc" strokeWidth={3} fill="url(#colorChart)" />
                                 </AreaChart>
                             </ResponsiveContainer>
                         </div>
                     ) : (
                         <div className="h-full flex items-center justify-center text-purple-300/50">
                             차트 데이터가 없습니다
                         </div>
                     )}
                 </div>
            </div>

            {/* Bottom Row - Failures */}
            <div className="bg-[#5b21b6] rounded-xl p-0 shadow-xl overflow-hidden h-[280px] flex flex-col">
                 <div className="px-5 py-4 border-b border-purple-800/50 flex justify-between items-center bg-[#4c1d95]">
                    <h3 className="text-white text-sm font-bold flex items-center gap-2 text-yellow-400">
                        <Icons.Alert size={14} fill="currentColor" className="text-yellow-400" /> 응답 실패 목록
                    </h3>
                 </div>
                 <div className="p-4 space-y-4 overflow-y-auto">
                     {failures.length > 0 ? failures.map((item, i) => (
                         <div 
                            key={i} 
                            onClick={() => setSelectedLog({ 
                                id: 'fail', 
                                question: item.query, 
                                answer: '', 
                                isFailed: true, 
                                createdAt: new Date().toISOString(), 
                                entityType: 'qa_log', 
                                userId: 'demo', 
                                botId: 'bot' 
                            } as QALog)}
                            className="space-y-1 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors"
                         >
                             <div className="flex justify-between items-center text-xs">
                                 <span className="text-gray-200 truncate pr-2 max-w-[70%]" title={item.query}>{item.query}</span>
                                 <span className="text-purple-300 font-bold">{item.count}회</span>
                             </div>
                             <div className="h-1.5 w-full bg-purple-900/50 rounded-full overflow-hidden">
                                 <div className="h-full bg-pink-500 rounded-full" style={{ width: `70%` }} />
                             </div>
                         </div>
                     )) : (
                        <div className="h-full flex flex-col items-center justify-center text-purple-300/50">
                             <span className="text-xs">기록이 없습니다</span>
                        </div>
                     )}
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
