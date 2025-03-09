'use client';

import React, { useState } from 'react';
import WorkflowRunner from './components/WorkflowRunner';

export default function Home() {
  // Difyワークフローの実際のIDを設定
  const [workflowId, setWorkflowId] = useState('小泉_Realvalue_議事録');
  
  // ワークフローの入力フィールド定義（Difyワークフローに合わせて調整）
  const workflowInputFields = [
    { 
      name: 'text', 
      label: '議事録を入れてください', 
      type: 'textarea' as const, 
      placeholder: '議事録のテキストを入力してください...' 
    },
    { 
      name: 'use_case',
      label: '用途',
      type: 'select' as const,
      options: [
        { value: 'summary', label: '要約' },
        { value: 'action_items', label: 'アクションアイテム抽出' },
        { value: 'decision_points', label: '決定事項抽出' }
      ],
      placeholder: '用途を選択'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center mb-6">
        <div className="bg-blue-100 p-2 rounded-lg mr-3">
          <span className="text-2xl">📝</span>
        </div>
        <h1 className="text-xl font-bold">議事録複数パターン処理デモ</h1>
        <div className="ml-auto flex items-center">
          <span className="text-blue-600 mr-2">AI Completion</span>
        </div>
      </div>

      <WorkflowRunner 
        workflowId={workflowId}
        inputFields={workflowInputFields}
      />
    </div>
  );
}
