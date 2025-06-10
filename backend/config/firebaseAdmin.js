const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const fs = require('fs');
const path = require('path');

// Check if we should use Firebase Emulator
const useEmulator = process.env.USE_FIREBASE_EMULATOR === 'true';

// Initialize Firebase Admin
try {
    let firebaseConfig = {};
    
    if (useEmulator) {
        console.log('Using Firebase Emulator');
        // Use emulator with default config
        firebaseConfig = {
            projectId: 'digital-complaint-system-emulator'
        };
        
        // Initialize Firebase Admin SDK
        if (!admin.apps.length) {
            admin.initializeApp(firebaseConfig);
        }
        
        // Set emulator host
        process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    } else {
        console.log('Using Firebase Production');
        // Use production with service account
        const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
        
        // Check if the service account file exists
        if (!fs.existsSync(serviceAccountPath)) {
            throw new Error(
                'Firebase service account file (serviceAccountKey.json) not found.\n' +
                'Please follow these steps:\n' +
                '1. Go to Firebase Console > Project Settings > Service Accounts\n' +
                '2. Generate a new private key\n' +
                '3. Save the JSON file as "serviceAccountKey.json" in the backend/config directory\n' +
                '4. Never commit this file to version control\n' +
                '5. Use serviceAccountKey.json.template as a reference\n' +
                'Alternatively, set USE_FIREBASE_EMULATOR=true to use the Firebase Emulator'
            );
        }

        // Try to load and parse the service account file
        const serviceAccount = require('./serviceAccountKey.json');

        // Validate required fields
        const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email'];
        const missingFields = requiredFields.filter(field => !serviceAccount[field]);
        
        if (missingFields.length > 0) {
            throw new Error(
                `Missing required fields in serviceAccountKey.json: ${missingFields.join(', ')}\n` +
                'Please ensure all required fields are properly filled in the service account JSON file.'
            );
        }

        // Format private key if needed
        if (serviceAccount.private_key) {
            // Ensure proper line breaks in private key
            serviceAccount.private_key = serviceAccount.private_key
                .replace(/\\n/g, '\n')
                .replace(/"\n"/g, '\n');
                
            // Ensure the key starts and ends with the correct markers
            if (!serviceAccount.private_key.startsWith('-----BEGIN PRIVATE KEY-----')) {
                serviceAccount.private_key = `-----BEGIN PRIVATE KEY-----\n${serviceAccount.private_key}`;
            }
            if (!serviceAccount.private_key.endsWith('-----END PRIVATE KEY-----')) {
                serviceAccount.private_key = `${serviceAccount.private_key}\n-----END PRIVATE KEY-----`;
            }
        }

        // Initialize Firebase Admin SDK
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET
            });
        }
    }
} catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Firebase Configuration Error:');
    console.error('\x1b[31m%s\x1b[0m', error.message);
    process.exit(1);
}

// Initialize Firestore
const db = getFirestore();
db.settings({ timestampsInSnapshots: true });

// Initialize Firebase Auth
const auth = getAuth();

// Initialize Firebase Storage
const storage = getStorage();

module.exports = {
    admin,
    db,
    auth,
    storage
};