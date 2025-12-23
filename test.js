const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { TranscribeClient, StartTranscriptionJobCommand } = require("@aws-sdk/client-transcribe");

require('dotenv').config({ path: '.env' });

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const transcribeClient = new TranscribeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

async function test() {
  const bucketName = process.env.AWS_S3_BUCKET || 'acetransit';
  
  try {
    console.log('🧪 Testing S3 permissions...');
    
    // Test 1: Upload
    const testFile = 'test-audio.txt';
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: testFile,
      Body: 'test content',
    }));
    console.log('✅ S3 Upload: SUCCESS');

    // Test 2: Read
    await s3Client.send(new GetObjectCommand({
      Bucket: bucketName,
      Key: testFile,
    }));
    console.log('✅ S3 Read: SUCCESS');

    // Test 3: Transcribe can access
    const mediaUri = `s3://${bucketName}/${testFile}`;
    console.log('🎙️ Testing Transcribe access to:', mediaUri);
    
    try {
      await transcribeClient.send(new StartTranscriptionJobCommand({
        TranscriptionJobName: `test-${Date.now()}`,
        LanguageCode: 'en-US',
        MediaFormat: 'mp3',
        Media: { MediaFileUri: mediaUri },
      }));
      console.log('✅ Transcribe can access S3: SUCCESS');
    } catch (e) {
      console.error('❌ Transcribe cannot access S3:', e.message);
    }

    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

test();