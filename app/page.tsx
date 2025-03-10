'use client';

import React from 'react';
import WorkflowRunner from './components/WorkflowRunner';

export default function Home() {
  // Difyワークフローの実際のIDを固定値として設定
  const workflowId = '小泉_Realvalue_議事録';
  
  // ワークフローの入力フィールド定義（Difyワークフローに合わせて調整）
  const workflowInputFields = [
    { 
      name: 'script_file', 
      label: '議事録を入れてください', 
      type: 'textarea' as const, 
      placeholder: '議事録のテキストを入力するか、ファイルをアップロードしてください...',
      isFileInput: true
    },
    { 
      name: 'execution_option',
      label: '用途',
      type: 'select' as const,
      options: [
        { value: '要約する', label: '要約する' },
        { value: '時系列順にまとめる', label: '時系列順にまとめる' },
        { value: '全体を逐語訳する', label: '全体を逐語訳する' },
        { value: 'ステークホルダー別のネクストアクションを整理', label: 'ステークホルダー別のネクストアクションを整理' }
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
        <h1 className="text-xl font-bold">議事録作成支援ツール</h1>
      </div>

      <WorkflowRunner 
        workflowId={workflowId}
        inputFields={workflowInputFields}
      />
    </div>
  );
}
