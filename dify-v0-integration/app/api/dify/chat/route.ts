import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Dify APIのエンドポイント
const DIFY_API_URL = process.env.DIFY_API_URL || 'https://api.dify.ai/v1';
const DIFY_API_KEY = process.env.DIFY_API_KEY;

/**
 * Dify APIのチャットエンドポイントにリクエストを送信する
 * 注意: このAPIはワークフローアプリケーションではなく、
 * チャットアプリケーション用のAPIです。
 */
export async function POST(request: NextRequest) {
  try {
    // リクエストボディを取得
    const { message, conversation_id, inputs = {} } = await request.json();

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'メッセージが指定されていません' },
        { status: 400 }
      );
    }

    // Dify API URLとAPIキーを環境変数から取得
    const difyApiUrl = DIFY_API_URL;
    const difyApiKey = DIFY_API_KEY;

    if (!difyApiKey) {
      return NextResponse.json(
        { success: false, error: 'DIFY_API_KEYが設定されていません' },
        { status: 500 }
      );
    }

    // 入力データの準備
    const requestData: any = {
      inputs: {
        ...inputs,
        query: message
      },
      response_mode: 'blocking',
      user: 'user-' + Date.now() // 一意のユーザーID
    };

    // 会話IDが指定されている場合は追加
    if (conversation_id) {
      requestData.conversation_id = conversation_id;
    }

    // Dify APIリクエスト
    const response = await axios.post(
      `${difyApiUrl}/chat-messages`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${difyApiKey}`
        }
      }
    );

    // レスポンスの整形
    return NextResponse.json({
      success: true,
      answer: response.data.answer,
      conversation_id: response.data.conversation_id
    });

  } catch (error: any) {
    console.error('Dify Chat API Error:', error.response?.data || error.message);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.response?.data?.message || error.message || 'チャット処理中にエラーが発生しました' 
      },
      { status: error.response?.status || 500 }
    );
  }
}
