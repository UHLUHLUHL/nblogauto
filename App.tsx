
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { BotState, LogEntry, Post, LogType } from './types';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import StatusLog from './components/StatusLog';
import { HeartIcon } from './components/Icons';
import { runBotSimulator } from './services/botSimulator';

const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <div className={`bg-gray-800 border ${post.isProcessing ? 'border-pink-500 ring-2 ring-pink-500' : 'border-gray-700'} rounded-lg p-4 transition-all duration-300 flex items-start space-x-4`}>
      <img src={post.avatarUrl} alt={post.author} className="w-12 h-12 rounded-full object-cover" />
      <div className="flex-1">
        <p className="font-semibold text-white">{post.title}</p>
        <p className="text-sm text-gray-400 mb-3">{post.author}</p>
        <div className="flex items-center space-x-2 text-gray-400">
          <HeartIcon liked={post.liked} />
          <span className="text-sm">{post.liked ? 'Liked' : 'Like'}</span>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [botState, setBotState] = useState<BotState>(BotState.IDLE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const stopSignal = useRef(false);
  const postsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (postsContainerRef.current) {
        postsContainerRef.current.scrollTop = postsContainerRef.current.scrollHeight;
    }
  }, [posts]);


  const addLog = useCallback((entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    setLogs(prevLogs => {
      const newLog = {
        ...entry,
        id: prevLogs.length,
        timestamp: new Date().toLocaleTimeString(),
      };
      return [...prevLogs, newLog];
    });
  }, []);

  const handleStart = useCallback(async (naverId: string, naverPw: string) => {
    if (!naverId || !naverPw) {
      addLog({ type: LogType.ERROR, message: 'Please enter Naver ID and Password to start the simulation.' });
      return;
    }
    setLogs([]);
    setPosts([]);
    addLog({ type: LogType.INFO, message: 'Starting bot simulation...' });
    setBotState(BotState.RUNNING);
    stopSignal.current = false;

    await runBotSimulator({
      addLog,
      setPosts,
      stopSignal,
    });
    
    if (stopSignal.current) {
        setBotState(BotState.STOPPED);
        addLog({ type: LogType.WARN, message: 'Bot stopped by user.' });
    } else {
        setBotState(BotState.FINISHED);
        addLog({ type: LogType.SUCCESS, message: 'Bot simulation finished.' });
    }
  }, [addLog]);

  const handleStop = useCallback(() => {
    stopSignal.current = true;
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <ControlPanel botState={botState} onStart={handleStart} onStop={handleStop} />
            <StatusLog logs={logs} />
          </div>
          <div className="lg:col-span-2 bg-gray-800/50 rounded-lg border border-gray-700 p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-white">Neighbor Posts Feed</h2>
            <div ref={postsContainerRef} className="h-[calc(100vh-200px)] overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <p>Posts will appear here once the bot starts.</p>
                </div>
              ) : (
                posts.map(post => <PostCard key={post.id} post={post} />)
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
