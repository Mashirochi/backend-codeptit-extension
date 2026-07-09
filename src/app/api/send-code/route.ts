import { NextResponse } from 'next/server';

const compilerMap: Record<string, string> = {
  c: "gcc-15",
  cpp: "g++-15",
  java: "openjdk-25",
  python: "python-3.14",
};

const allowOrigin = "*";

export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: Request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': allowOrigin,
  };

  try {
    const body = await request.json();
    const { language, code, stdin = "", recaptchaToken } = body;
    const apiKey = body?.apiKey ?? process.env.API_KEY;

    if (process.env.NODE_ENV !== 'development') {
      if (!recaptchaToken) {
        return NextResponse.json(
          { error: "Missing recaptchaToken" },
          { status: 400, headers: corsHeaders }
        );
      }

      const recaptchaSecret = process.env.RECAPTCHA_SECRET;
      if (!recaptchaSecret) {
        return NextResponse.json(
          { error: "Internal server error" },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "Thiếu apiKey" },
        { status: 400, headers: corsHeaders }
      );
    }
    if (!language || !compilerMap[language]) {
      return NextResponse.json(
        { error: "Ngôn ngữ không hợp lệ hoặc không được hỗ trợ" },
        { status: 400, headers: corsHeaders }
      );
    }
    if (!code) {
      return NextResponse.json(
        { error: "Thiếu mã nguồn (code)" },
        { status: 400, headers: corsHeaders }
      );
    }

    const compiler = compilerMap[language];

    const payload = {
      compiler: compiler,
      code: code,
      input: stdin,
    };

    console.log("check payload", payload)

    const response = await fetch("https://api.onlinecompiler.io/api/run-code-sync/", {
      method: "POST",
      headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      return NextResponse.json(
        { rawOutput: responseText },
        { status: response.status, headers: corsHeaders }
      );
    }

    console.log(responseData)
    return NextResponse.json(responseData, {
      status: response.status,
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error("Lỗi khi xử lý code:", error);
    return NextResponse.json(
      { error: "Lỗi nội bộ server", details: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
