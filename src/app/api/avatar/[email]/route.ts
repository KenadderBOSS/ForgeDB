import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const email = params.email;
    
    // Create a consistent hash from the email
    const hash = crypto
      .createHash('md5')
      .update(email.toLowerCase())
      .digest('hex');

    // Redirect to DiceBear API with the hash as seed
    return NextResponse.redirect(
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${hash}`
    );
  } catch (error) {
    console.error('Avatar generation error:', error);
    return NextResponse.error();
  }
}
