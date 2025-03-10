'use client';

import React, { useState, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

// 入力フィールドの型定義
type InputFieldType = 'text' | 'textarea' | 'select';

interface InputField {
  name: string;
  label: string;
  type: InputFieldType;
  placeholder: string;
  options?: { value: string; label: string }[];
}

interface WorkflowRunnerProps {
  workflowId: string;
  inputFields: InputField[];
}

export default function WorkflowRunner({ workflowId, inputFields }: WorkflowRunnerProps) {
  // 入力値の状態を管理
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('一度だけ実行');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 入力値の変更を処理
  const handleInputChange = (name: string, value: string) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  // ファイルアップロード処理
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setUploadedFile(file);
      
      // ファイル名を表示するためにテキストエリアに情報を追加
      const textFieldName = inputFields.find(f => f.type === 'textarea')?.name;
      if (textFieldName) {
        setInputs(prev => ({ 
          ...prev, 
          [textFieldName]: prev[textFieldName] ? 
            `${prev[textFieldName]}\n\n[ファイル: ${file.name}]` : 
            `[ファイル: ${file.name}]` 
        }));
      }
    }
  };

  // ファイルアップロードボタンのクリックハンドラ
  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  // URLからファイルを取得
  const handleUrlUpload = () => {
    const url = prompt('ファイルのURLを入力してください:');
    if (url) {
      // URLの情報をテキストエリアに追加
      const textFieldName = inputFields.find(f => f.type === 'textarea')?.name;
      if (textFieldName) {
        setInputs(prev => ({ 
          ...prev, 
          [textFieldName]: prev[textFieldName] ? 
            `${prev[textFieldName]}\n\n[ファイルURL: ${url}]` : 
            `[ファイルURL: ${url}]` 
        }));
      }
    }
  };

  // ワークフロー実行
  const runWorkflow = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // FormDataを作成
      const formData = new FormData();
      formData.append('workflowId', workflowId);
      
      // 入力値をFormDataに追加
      Object.entries(inputs).forEach(([key, value]) => {
        formData.append(`inputs[${key}]`, value);
      });
      
      // ファイルがある場合は追加
      if (uploadedFile) {
        formData.append('file', uploadedFile);
      }
      
      // multipart/form-dataとしてAPIにリクエスト
      const response = await axios.post('/api/dify/workflow', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setResult(response.data.result);
      } else {
        setError(response.data.error || 'ワークフロー実行中にエラーが発生しました');
      }
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.response?.data?.error || 'APIリクエスト中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // 入力フィールドをレンダリング
  const renderInputField = (field: InputField) => {
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.name}
            value={inputs[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={6}
          />
        );
      case 'select':
        return (
          <div className="relative">
            <select
              id={field.name}
              value={inputs[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="">{field.placeholder}</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        );
      default:
        return (
          <input
            type="text"
            id={field.name}
            value={inputs[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
    }
  };

  return (
    <div>
      {/* 非表示のファイル入力 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        accept=".jpg,.jpeg,.png,.gif,.webp,.svg"
      />
      
      {/* タブナビゲーション */}
      <div className="flex border-b mb-4">
        <button
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === '一度だけ実行' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('一度だけ実行')}
        >
          一度だけ実行
        </button>
        <button
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === '一括実行' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('一括実行')}
        >
          一括実行
        </button>
      </div>

      <div className="space-y-4">
        {inputFields.map(field => (
          <div key={field.name} className="mb-4">
            <label htmlFor={field.name} className="block mb-1 text-sm">
              {field.label}
            </label>
            {field.type === 'textarea' && (
              <div className="relative">
                {renderInputField(field)}
                <div className="absolute bottom-3 right-3 flex space-x-2">
                  <button 
                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-md flex items-center justify-center"
                    title="ローカルアップロード"
                    onClick={handleUploadButtonClick}
                    type="button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </button>
                  <button 
                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-md flex items-center justify-center"
                    title="ファイルリンクの貼り付け"
                    onClick={handleUrlUpload}
                    type="button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            {field.type !== 'textarea' && renderInputField(field)}
          </div>
        ))}
        
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => {
              setInputs({});
              setResult('');
              setUploadedFile(null);
            }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            クリア
          </button>
          <button
            onClick={runWorkflow}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                処理中...
              </span>
            ) : (
              <span className="flex items-center">
                <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                実行
              </span>
            )}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mt-6">
          {error}
        </div>
      )}
      
      {result && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mt-6">
          <div className="prose max-w-none">
            <ReactMarkdown>{result}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
