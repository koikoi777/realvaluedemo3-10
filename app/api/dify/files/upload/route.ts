import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { Readable } from 'stream';

// Dify APIのエンドポイント
const DIFY_API_URL = process.env.DIFY_API_URL || 'https://api.dify.ai/v1';
const DIFY_API_KEY = process.env.DIFY_API_KEY;

/**
 * Dify APIのファイルアップロードエンドポイントにリクエストを送信する
 */
export async function POST(request: NextRequest) {
  try {
    if (!DIFY_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'DIFY_API_KEYが設定されていません' },
        { status: 500 }
      );
    }

    // FormDataからファイルを取得
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const user = formData.get('user') as string || 'user-' + Date.now();
    const type = formData.get('type') as string || 'document';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'ファイルが指定されていません' },
        { status: 400 }
      );
    }

    // ファイルデータをArrayBufferとして取得
    const fileBuffer = await file.arrayBuffer();

    // Dify APIにファイルをアップロード
    const difyFormData = new FormData();
    difyFormData.append('file', new Blob([fileBuffer]), file.name);
    difyFormData.append('user', user);
    difyFormData.append('type', type);

    const response = await axios.post(
      `${DIFY_API_URL}/files/upload`,
      difyFormData,
      {
        headers: {
          'Authorization': `Bearer ${DIFY_API_KEY}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    // レスポンスの整形
    return NextResponse.json({
      success: true,
      id: response.data.id,
      name: response.data.name,
      size: response.data.size,
      extension: response.data.extension,
      mime_type: response.data.mime_type
    });

  } catch (error: any) {
    console.error('Dify File Upload API Error:', error.response?.data || error.message);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.response?.data?.message || error.message || 'ファイルアップロード中にエラーが発生しました' 
      },
      { status: error.response?.status || 500 }
    );
  }
}
