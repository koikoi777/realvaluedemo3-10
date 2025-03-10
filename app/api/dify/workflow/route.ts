import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Dify APIのエンドポイント
const DIFY_API_URL = process.env.DIFY_API_URL || 'https://api.dify.ai/v1';
const DIFY_API_KEY = process.env.DIFY_API_KEY;

/**
 * Dify APIのワークフローエンドポイントにリクエストを送信する
 */
export async function POST(request: NextRequest) {
  try {
    if (!DIFY_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'DIFY_API_KEYが設定されていません' },
        { status: 500 }
      );
    }

    // リクエストボディからパラメータを取得
    const { workflowId, inputs, response_mode = 'blocking' } = await request.json();

    if (!workflowId) {
      return NextResponse.json(
        { success: false, error: 'workflowIdが指定されていません' },
        { status: 400 }
      );
    }

    // Dify APIにリクエストを送信
    const response = await axios.post(
      `${DIFY_API_URL}/workflows/${workflowId}/run`,
      {
        inputs,
        response_mode
      },
      {
        headers: {
          'Authorization': `Bearer ${DIFY_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // レスポンスの整形
    return NextResponse.json({
      success: true,
      data: response.data
    });

  } catch (error: any) {
    console.error('Dify Workflow API Error:', error.response?.data || error.message);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.response?.data?.message || error.message || 'ワークフロー実行中にエラーが発生しました' 
      },
      { status: error.response?.status || 500 }
    );
  }
}
