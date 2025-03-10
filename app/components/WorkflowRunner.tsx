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
  isFileInput?: boolean;
}

interface WorkflowRunnerProps {
  workflowId: string;
  inputFields: InputField[];
}

// アップロードされたファイル情報
interface UploadedFile {
  id: string;
  name: string;
  size: number;
  extension: string;
  mime_type: string;
  field: string; // どの入力フィールドに関連するか
}

export default function WorkflowRunner({ workflowId, inputFields }: WorkflowRunnerProps) {
  // 入力値の状態を管理
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentFileField, setCurrentFileField] = useState<string>('');

  // 入力値の変更を処理
  const handleInputChange = (name: string, value: string) => {
    setInputs(prev => ({ ...prev, [name]: value }));
  };

  // ファイルアップロード処理
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0 && currentFileField) {
      const file = files[0];
      setLoading(true);
      
      try {
        // FormDataを作成
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user', 'user-' + Date.now());
        
        // ファイルタイプを決定
        let fileType = 'document';
        const extension = file.name.split('.').pop()?.toLowerCase();
        if (extension && ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
          fileType = 'image';
        } else if (extension && ['mp3', 'm4a', 'wav', 'webm', 'amr'].includes(extension)) {
          fileType = 'audio';
        } else if (extension && ['mp4', 'mov', 'mpeg', 'mpga'].includes(extension)) {
          fileType = 'video';
        }
        
        formData.append('type', fileType);
        
        // APIにファイルをアップロード
        const response = await axios.post('/api/dify/files/upload', formData);
        
        if (response.data.success) {
          // アップロードされたファイル情報を保存
          const uploadedFile: UploadedFile = {
            ...response.data,
            field: currentFileField
          };
          
          setUploadedFiles(prev => [...prev, uploadedFile]);
          
          // ファイル名を表示するためにテキストエリアに情報を追加
          setInputs(prev => ({ 
            ...prev, 
            [currentFileField]: prev[currentFileField] ? 
              `${prev[currentFileField]}\n\n[ファイル: ${file.name} (アップロード済み)]` : 
              `[ファイル: ${file.name} (アップロード済み)]` 
          }));
        } else {
          setError(response.data.error || 'ファイルアップロードに失敗しました');
        }
      } catch (err: any) {
        console.error('File Upload Error:', err);
        setError(err.response?.data?.error || 'ファイルアップロード中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    }
  };

  // ファイルアップロードボタンのクリックハンドラ
  const handleUploadButtonClick = (fieldName: string) => {
    setCurrentFileField(fieldName);
    fileInputRef.current?.click();
  };

  // URLからファイルを取得
  const handleUrlUpload = (fieldName: string) => {
    const url = prompt('ファイルのURLを入力してください:');
    if (url) {
      // URLの情報をテキストエリアに追加
      setInputs(prev => ({ 
        ...prev, 
        [fieldName]: prev[fieldName] ? 
          `${prev[fieldName]}\n\n[ファイルURL: ${url}]` : 
          `[ファイルURL: ${url}]` 
      }));
    }
  };

  // ワークフロー実行
  const runWorkflow = async () => {
    if (!workflowId) {
      setError('ワークフローIDが設定されていません');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // 入力データを準備
      const formattedInputs: Record<string, any> = {};
      
      // 各入力フィールドを処理
      Object.entries(inputs).forEach(([key, value]) => {
        // 入力値が空でない場合のみ追加
        if (value && value.trim() !== '') {
          formattedInputs[key] = value;
        }
      });
      
      // アップロードされたファイルを入力に追加
      uploadedFiles.forEach(file => {
        formattedInputs[file.field] = {
          transfer_method: 'local_file',
          upload_file_id: file.id,
          type: file.mime_type.startsWith('image/') ? 'image' : 'document'
        };
      });
      
      // JSONデータとしてAPIにリクエスト
      const response = await axios.post('/api/dify/workflow', {
        workflowId,
        inputs: formattedInputs
      });
      
      if (response.data.success) {
        // レスポンスデータを整形
        if (response.data.data && response.data.data.outputs) {
          // outputsオブジェクトがある場合はそれを表示
          const outputs = response.data.data.outputs;
          if (typeof outputs === 'object') {
            setResult(JSON.stringify(outputs, null, 2));
          } else if (typeof outputs === 'string') {
            setResult(outputs);
          } else {
            setResult(JSON.stringify(response.data.data, null, 2));
          }
        } else {
          // 完全なレスポンスデータを表示
          setResult(JSON.stringify(response.data, null, 2));
        }
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
        accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.pdf,.txt,.docx,.doc,.xlsx,.xls,.csv,.mp3,.m4a,.wav,.webm,.mp4,.mov"
      />
      
      <div className="space-y-4">
        {/* アップロードされたファイル一覧 */}
        {uploadedFiles.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">アップロード済みファイル</h3>
            <ul className="bg-gray-50 p-2 rounded-md text-sm">
              {uploadedFiles.map((file, index) => (
                <li key={index} className="flex items-center justify-between py-1">
                  <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                  <button
                    onClick={() => {
                      setUploadedFiles(prev => prev.filter((_, i) => i !== index));
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    削除
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {inputFields.map(field => (
          <div key={field.name} className="mb-4">
            <label htmlFor={field.name} className="block mb-1 text-sm">
              {field.label}
            </label>
            {field.isFileInput && (
              <div className="relative">
                {renderInputField(field)}
                <div className="absolute bottom-3 right-3 flex space-x-2">
                  <button 
                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-md flex items-center justify-center"
                    title="ローカルアップロード"
                    onClick={() => handleUploadButtonClick(field.name)}
                    type="button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </button>
                  <button 
                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-md flex items-center justify-center"
                    title="ファイルリンクの貼り付け"
                    onClick={() => handleUrlUpload(field.name)}
                    type="button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            {!field.isFileInput && renderInputField(field)}
          </div>
        ))}
        
        <div className="flex items-center justify-between mt-4">
          <button
            onClick={() => {
              setInputs({});
              setResult('');
              setUploadedFiles([]);
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
