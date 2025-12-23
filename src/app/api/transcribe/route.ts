import { NextRequest, NextResponse } from 'next/server';
import { 
  TranscribeClient, 
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand,
  DeleteTranscriptionJobCommand
} from '@aws-sdk/client-transcribe';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const transcribeClient = new TranscribeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: NextRequest) {
  const bucketName = process.env.AWS_S3_BUCKET || 'acetransit-voice-assistant';
  
  try {
    console.log('📤 Transcribe API called');
    
    // Validate credentials
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      throw new Error('AWS credentials not configured in .env.local');
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    console.log('📁 Audio file received:', audioFile.size, 'bytes');

    // Convert to buffer
    const buffer = Buffer.from(await audioFile.arrayBuffer());
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `voice-recordings/audio-${timestamp}.webm`;
    
    console.log('⬆️ Uploading to S3:', fileName);

    // Upload to S3
    try {
      await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: 'audio/webm',
      }));
      console.log('✅ Uploaded to S3 successfully');
    } catch (s3Error: any) {
      console.error('❌ S3 Upload Error:', s3Error);
      throw new Error(`S3 upload failed: ${s3Error.message}`);
    }

    // Start transcription job
    const jobName = `transcription-${timestamp}`;
    const mediaUri = `s3://${bucketName}/${fileName}`;
    
    console.log('🎙️ Starting transcription job:', jobName);
    console.log('📍 Media URI:', mediaUri);

    try {
      // FIXED: Removed problematic Settings
      await transcribeClient.send(new StartTranscriptionJobCommand({
        TranscriptionJobName: jobName,
        LanguageCode: 'en-US',
        MediaFormat: 'webm',
        Media: {
          MediaFileUri: mediaUri,
        },
        // No Settings needed for simple transcription
      }));
      console.log('✅ Transcription job started');
    } catch (transcribeError: any) {
      console.error('❌ Transcribe Start Error:', transcribeError);
      throw new Error(`Transcribe job failed: ${transcribeError.message}`);
    }

    // Poll for completion (max 60 seconds, check every 2 seconds)
    let transcript = '';
    const maxAttempts = 30;
    
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      try {
        const result = await transcribeClient.send(new GetTranscriptionJobCommand({
          TranscriptionJobName: jobName,
        }));

        // TypeScript null checks
        if (!result.TranscriptionJob) {
          console.warn('⚠️ No TranscriptionJob in result');
          continue;
        }

        const status = result.TranscriptionJob.TranscriptionJobStatus;
        console.log(`⏳ Attempt ${i + 1}/${maxAttempts} - Status: ${status}`);

        if (status === 'COMPLETED') {
          const transcriptUri = result.TranscriptionJob.Transcript?.TranscriptFileUri;
          
          if (transcriptUri) {
            console.log('📥 Fetching transcript from:', transcriptUri);
            
            try {
              const response = await fetch(transcriptUri);
              
              if (!response.ok) {
                throw new Error(`Failed to fetch transcript: ${response.statusText}`);
              }
              
              const data = await response.json();
              
              // Check if transcript exists
              if (data.results?.transcripts?.[0]?.transcript) {
                transcript = data.results.transcripts[0].transcript;
                console.log('✅ Transcription completed:', transcript);
                break;
              } else {
                console.warn('⚠️ No transcript in response data');
              }
            } catch (fetchError: any) {
              console.error('❌ Error fetching transcript:', fetchError);
              throw new Error(`Failed to fetch transcript: ${fetchError.message}`);
            }
          } else {
            console.warn('⚠️ No transcript URI in completed job');
          }
        } else if (status === 'FAILED') {
          const failureReason = result.TranscriptionJob.FailureReason || 'Unknown reason';
          console.error('❌ Transcription failed:', failureReason);
          throw new Error(`Transcription failed: ${failureReason}`);
        } else if (status === 'IN_PROGRESS') {
          console.log('⏳ Still processing...');
          // Continue polling
        }
      } catch (pollError: any) {
        console.error('❌ Poll Error:', pollError);
        
        // Don't throw on poll errors, just log and continue
        if (i === maxAttempts - 1) {
          throw new Error(`Polling failed after ${maxAttempts} attempts: ${pollError.message}`);
        }
      }
    }

    // Cleanup: Delete transcription job
    try {
      await transcribeClient.send(new DeleteTranscriptionJobCommand({
        TranscriptionJobName: jobName,
      }));
      console.log('🗑️ Transcription job deleted');
    } catch (deleteError) {
      console.warn('⚠️ Could not delete transcription job:', deleteError);
    }

    if (!transcript || transcript.trim() === '') {
      console.log('⚠️ No transcript generated (timeout or no speech)');
      return NextResponse.json({ 
        transcript: '',
        message: 'No speech detected or processing timeout' 
      });
    }

    return NextResponse.json({ 
      transcript: transcript.trim(),
      success: true 
    });

  } catch (error: any) {
    console.error('❌ Transcribe API Error:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Transcription failed',
        details: error.toString(),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    service: 'AWS Transcribe API',
    bucket: process.env.AWS_S3_BUCKET || 'acetransit-voice-assistant',
    region: process.env.AWS_REGION || 'us-east-1',
    credentials_configured: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
  });
}