import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { codeUrl, templateId } = await request.json();
    
    if (!codeUrl) {
      return NextResponse.json(
        { success: false, message: 'Code URL is required' },
        { status: 400 }
      );
    }

    console.log('Fetching code from S3:', codeUrl);

    // Fetch the code content from S3
    const response = await fetch(codeUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/plain, text/*, application/octet-stream, */*',
        'User-Agent': 'CodeMan-App/1.0',
        'Cache-Control': 'no-cache'
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
      console.error('S3 fetch failed:', response.status, response.statusText);
      
      // Get response text to see what error we're getting
      let errorText = '';
      try {
        errorText = await response.text();
        console.error('S3 error response:', errorText.substring(0, 500));
      } catch (e) {
        console.error('Could not read error response');
      }

      return NextResponse.json(
        { 
          success: false, 
          message: `Failed to fetch code from storage: ${response.status} ${response.statusText}` 
        },
        { status: response.status }
      );
    }

    // Get the content as text
    const code = await response.text();

    if (!code || code.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Code file is empty or unreadable' },
        { status: 404 }
      );
    }

    // Check if we got HTML error page instead of code
    if (code.trim().startsWith('<!DOCTYPE') || code.trim().startsWith('<html') || code.includes('<title>Error</title>')) {
      console.error('Received HTML instead of code:', code.substring(0, 200));
      return NextResponse.json(
        { 
          success: false, 
          message: 'Unable to access the code file. The file may not exist or there may be permission issues.' 
        },
        { status: 404 }
      );
    }

    console.log('Successfully fetched code, length:', code.length);

    return NextResponse.json({
      success: true,
      code: code,
      message: 'Code fetched successfully'
    });

  } catch (error) {
    console.error('Error in code proxy:', error);
    
    // Handle timeout errors specifically
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { success: false, message: 'Request timeout - the file took too long to load' },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to fetch code content' 
      },
      { status: 500 }
    );
  }
}