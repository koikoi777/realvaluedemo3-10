'use client';

import React, { useState } from 'react';
import WorkflowRunner from './components/WorkflowRunner';

export default function Home() {
  // Difyワークフローの実際のIDを設定
  const [workflowId, setWorkflowId] = useState('');
  
  // ワークフローの入力フィールド定義（Difyワークフローに合わせて調整）
  const workflowInputFields = [
    { 
      name: 'text', 
      label: '入力テキスト', 
      type: 'textarea' as const, 
      placeholder: 'ワークフローに送信するテキストを入力してください...' 
    },
    { 
      name: 'use_case',
      label: '用途',
      type: 'select' as const,
      options: [
        { value: 'summary', label: '要約' },
        { value: 'analysis', label: '分析' },
        { value: 'extraction', label: '情報抽出' }
      ],
      placeholder: '用途を選択'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center mb-6">
        <div className="bg-blue-100 p-2 rounded-lg mr-3">
          <span className="text-2xl">🤖</span>
        </div>
        <h1 className="text-xl font-bold">Dify ワークフロー実行デモ</h1>
        <div className="ml-auto flex items-center">
          <span className="text-blue-600 mr-2">Powered by Dify</span>
        </div>
      </div>

      <div className="mb-6">
        <label htmlFor="workflowId" className="block mb-1 text-sm">
          ワークフローID
        </label>
        <input
          type="text"
          id="workflowId"
          value={workflowId}
          onChange={(e) => setWorkflowId(e.target.value)}
          placeholder="実行するDifyワークフローのIDを入力してください"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Difyダッシュボードで作成したワークフローのIDを入力してください。
        </p>
      </div>

      <WorkflowRunner 
        workflowId={workflowId}
        inputFields={workflowInputFields}
      />
    </div>
  );
}
