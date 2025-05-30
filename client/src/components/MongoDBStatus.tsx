import React, { useState, useEffect } from 'react';

interface MongoDBStatusProps {
  className?: string;
}

const MongoDBStatus: React.FC<MongoDBStatusProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<{ connected: boolean; readyState: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/status/mongodb');
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        } else {
          setStatus({ connected: false, readyState: 0 });
        }
      } catch (error) {
        console.error('Error checking MongoDB status:', error);
        setStatus({ connected: false, readyState: 0 });
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className={`text-gray-500 text-xs ${className}`}>Checking database...</div>;
  }

  if (!status) {
    return <div className={`text-red-500 text-xs ${className}`}>Unable to check database status</div>;
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div 
        className={`w-2 h-2 rounded-full mr-2 ${status.connected ? 'bg-green-500' : 'bg-red-500'}`} 
      />
      <span className="text-xs">
        {status.connected ? 'MongoDB Connected' : 'Using Local Storage'}
      </span>
    </div>
  );
};

export default MongoDBStatus;