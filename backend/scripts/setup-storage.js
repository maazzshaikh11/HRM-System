"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv = __importStar(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables from backend/.env
dotenv.config({ path: path_1.default.resolve(__dirname, '../.env') });
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey);
const BUCKETS = [
    'profile-images',
    'resumes',
    'employee-documents'
];
async function setupStorage() {
    console.log("Setting up Supabase storage buckets...");
    for (const bucket of BUCKETS) {
        const { data, error } = await supabase.storage.getBucket(bucket);
        if (error && error.message.includes('not found')) {
            // Bucket doesn't exist, create it
            const { data: newBucket, error: createError } = await supabase.storage.createBucket(bucket, {
                public: bucket === 'profile-images', // Make profile images public, others private
                allowedMimeTypes: bucket === 'profile-images' ? ['image/jpeg', 'image/png', 'image/webp'] : undefined
            });
            if (createError) {
                console.error(`Failed to create bucket ${bucket}:`, createError);
            }
            else {
                console.log(`Successfully created bucket: ${bucket}`);
            }
        }
        else if (data) {
            console.log(`Bucket already exists: ${bucket}`);
        }
        else {
            console.error(`Error checking bucket ${bucket}:`, error);
        }
    }
    console.log("Storage setup complete.");
}
setupStorage().catch(console.error);
