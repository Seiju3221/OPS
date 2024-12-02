import React, { useState, useMemo, useEffect } from 'react';
import { formatDate } from '../../../utils/formatDate';
import { useGetCommentsQuery } from '../../../redux/features/comments/commentApi';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';


const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white p-3 rounded-md shadow-lg border border-gray-100">
      <p className="text-xs font-medium text-gray-600 mb-1">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center space-x-1.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <p className="text-xs">
            <span className="font-medium">{entry.name}: </span>
            <span className="text-gray-700">{entry.value}</span>
          </p>
        </div>
      ))}
    </div>
  );
};

const MetricButton = ({ selected, label, value, change, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full p-3 rounded-lg border transition-all duration-200 ${
      selected 
        ? 'border-blue-200 bg-blue-50/50 shadow-sm' 
        : 'border-gray-200 bg-white hover:bg-gray-50'
    }`}
  >
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600 font-medium">{label}</span>
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        change >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}>
        {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
      </span>
    </div>
    <div className="mt-1 text-lg font-semibold text-gray-900">
      {Math.round(value).toLocaleString()}
    </div>
  </button>
);

const PostsChart = ({ articles, timeFilter = 'all' }) => {
  const [activeMetric, setActiveMetric] = useState('pageViews');
  const { data: commentsData } = useGetCommentsQuery();

  const data = useMemo(() => {
    if (!articles?.length) return [];
  
    const filteredArticles = articles
      .filter(article => article.status === 'published')
      .map(article => ({
        ...article,
        pageViews: parseInt(article.pageViews || 0),
        commentCount: 0, // Initialize comment count
        title: article.title || '',
        content: article.content || '',
        createdAt: article.createdAt || new Date().toISOString()
      }));

    // Count comments per article
    if (commentsData?.comments) {
      commentsData.comments.forEach(comment => {
        const article = filteredArticles.find(a => a._id === comment.postId);
        if (article) {
          article.commentCount = (article.commentCount || 0) + 1;
        }
      });
    }

    const now = new Date();
    let timeFilteredArticles = [...filteredArticles];
    
    if (timeFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      timeFilteredArticles = timeFilteredArticles.filter(article => 
        new Date(article.createdAt) >= weekAgo
      );
    } else if (timeFilter === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      timeFilteredArticles = timeFilteredArticles.filter(article => 
        new Date(article.createdAt) >= monthAgo
      );
    }
  
    return timeFilteredArticles
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map(article => ({
        date: formatDate(article.createdAt),
        pageViews: article.pageViews,
        commentCount: article.commentCount,
        engagement: (article.pageViews + article.commentCount) / 2
      }));
  }, [articles, commentsData, timeFilter]);

    const metrics = {
      pageViews: {
        label: 'Page Views',
        color: '#3B82F6',
        gradient: ['#3B82F6', '#93C5FD']
      },
      commentCount: {
        label: 'Comments',
        color: '#8B5CF6',
        gradient: ['#8B5CF6', '#C4B5FD']
      },
      engagement: {
        label: 'Engagement',
        color: '#10B981',
        gradient: ['#10B981', '#6EE7B7']
      }
    };

    const summaryStats = useMemo(() => {
      if (!data.length) return {};
      
      const currentPeriod = data.slice(-7);
      const previousPeriod = data.slice(-14, -7);
      
      const calculateAverage = (arr, key) => {
        if (!arr.length) return 0;
        return arr.reduce((sum, item) => sum + (item[key] || 0), 0) / arr.length;
      };

      const calculateChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous * 100).toFixed(1);
      };

      return {
        pageViews: {
          current: calculateAverage(currentPeriod, 'pageViews'),
          change: calculateChange(
            calculateAverage(currentPeriod, 'pageViews'),
            calculateAverage(previousPeriod, 'pageViews')
          )
        },
        commentCount: {
          current: calculateAverage(currentPeriod, 'commentCount'),
          change: calculateChange(
            calculateAverage(currentPeriod, 'commentCount'),
            calculateAverage(previousPeriod, 'commentCount')
          )
        },
        engagement: {
          current: calculateAverage(currentPeriod, 'engagement'),
          change: calculateChange(
            calculateAverage(currentPeriod, 'engagement'),
            calculateAverage(previousPeriod, 'engagement')
          )
        }
      };
    }, [data]);

    if (!data.length) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500 text-sm">
          No published articles available for the selected time period.
        </div>
      );
    }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(metrics).map(([key, metric]) => (
          <MetricButton
            key={key}
            selected={activeMetric === key}
            label={metric.label}
            value={summaryStats[key]?.current || 0}
            change={Number(summaryStats[key]?.change)}
            onClick={() => setActiveMetric(key)}
          />
        ))}
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                {Object.entries(metrics).map(([key, metric]) => (
                  <linearGradient
                    key={key}
                    id={`gradient-${key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={metric.gradient[0]} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={metric.gradient[1]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#E5E7EB" 
                vertical={false} 
              />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6B7280', fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: '#E5E7EB' }}
                dy={5}
              />
              <YAxis
                tick={{ fill: '#6B7280', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={value => value.toLocaleString()}
                dx={-5}
              />
              <Tooltip content={<CustomTooltip />} />
              {Object.entries(metrics).map(([key, metric]) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={metric.label}
                  stroke={metric.color}
                  fill={`url(#gradient-${key})`}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 1 }}
                  opacity={activeMetric === key ? 1 : 0.15}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PostsChart;