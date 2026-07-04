import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const BUCKETS = [
  'profile-images',
  'resumes',
  'employee-documents'
]

async function setupStorage() {
  console.log("Setting up Supabase storage buckets...")

  for (const bucket of BUCKETS) {
    const { data, error } = await supabase.storage.getBucket(bucket)
    
    if (error && error.message.includes('not found')) {
      // Bucket doesn't exist, create it
      const { data: newBucket, error: createError } = await supabase.storage.createBucket(bucket, {
        public: bucket === 'profile-images', // Make profile images public, others private
        allowedMimeTypes: bucket === 'profile-images' ? ['image/jpeg', 'image/png', 'image/webp'] : undefined
      })
      
      if (createError) {
        console.error(`Failed to create bucket ${bucket}:`, createError)
      } else {
        console.log(`Successfully created bucket: ${bucket}`)
      }
    } else if (data) {
      console.log(`Bucket already exists: ${bucket}`)
    } else {
      console.error(`Error checking bucket ${bucket}:`, error)
    }
  }

  console.log("Storage setup complete.")
}

setupStorage().catch(console.error)
