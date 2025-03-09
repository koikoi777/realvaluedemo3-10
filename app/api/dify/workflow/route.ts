import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';

// Dify APIのエンドポイント
const DIFY_API_URL = process.env.DIFY_API_URL || 'https://api.dify.ai/v1';
const DIFY_API_KEY = process.env.DIFY_API_KEY;

/**
 * Dify APIのワークフローエンドポイントにリクエストを送信する
 */
export async function POST(request: NextRequest) {
  try {
    // マルチパートフォームデータを処理
    const formData = await request.formData();
    const workflowId = formData.get('workflowId') as string;
    const file = formData.get('file') as File | null;
    
    // 入力値を取得
    const inputs: Record<string, string> = {};
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('inputs[') && key.endsWith(']')) {
        const inputKey = key.slice(7, -1); // 'inputs[key]' から 'key' を取得
        inputs[inputKey] = value as string;
      }
    }

    if (!workflowId) {
      return NextResponse.json(
        { success: false, error: 'ワークフローIDが指定されていません' },
        { status: 400 }
      );
    }

    if (!DIFY_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'DIFY_API_KEYが設定されていません' },
        { status: 500 }
      );
    }

    // ファイルがアップロードされている場合の処理
    let fileUrl = null;
    if (file) {
      try {
        // ファイルをDify APIにアップロード
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileName = file.name;
        const fileType = file.type;
        
        // 一時ファイルとして保存
        const tempFilePath = join(tmpdir(), `${uuidv4()}-${fileName}`);
        await writeFile(tempFilePath, fileBuffer);
        
        // Dify APIにファイルをアップロード
        const fileFormData = new FormData();
        fileFormData.append('file', new Blob([fileBuffer], { type: fileType }), fileName);
        
        const fileUploadResponse = await axios.post(
          `${DIFY_API_URL}/files/upload`,
          fileFormData,
          {
            headers: {
              'Authorization': `Bearer ${DIFY_API_KEY}`
            }
          }
        );
        
        // アップロードされたファイルのIDを取得
        fileUrl = fileUploadResponse.data.id;
        
        // 入力値にファイルIDを追加
        if (fileUrl) {
          inputs.file_id = fileUrl;
        }
      } catch (fileError: any) {
        console.error('File upload error:', fileError);
        return NextResponse.json(
          { success: false, error: `ファイルアップロードエラー: ${fileError.message}` },
          { status: 500 }
        );
      }
    }

    // Dify APIリクエスト
    const response = await axios.post(
      `${DIFY_API_URL}/workflows/${workflowId}/run`,
      {
        inputs,
        user: 'user-' + Date.now() // 一意のユーザーID
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DIFY_API_KEY}`
        }
      }
    );

    // レスポンスの整形
    return NextResponse.json({
      success: true,
      result: response.data.output || response.data.result || JSON.stringify(response.data, null, 2)
    });

  } catch (error: any) {
    console.error('Dify API Error:', error.response?.data || error.message);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.response?.data?.message || error.message || 'ワークフロー実行中にエラーが発生しました' 
      },
      { status: error.response?.status || 500 }
    );
  }
}
