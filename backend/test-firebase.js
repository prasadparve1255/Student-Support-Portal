// Test script to verify Firebase Firestore connection
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
try {
    const serviceAccountPath = path.join(__dirname, 'config', 'serviceAccountKey.json');
    console.log('Loading service account from:', serviceAccountPath);
    
    if (!fs.existsSync(serviceAccountPath)) {
        throw new Error('Service account file not found');
    }
    
    const serviceAccount = require('./config/serviceAccountKey.json');
    console.log('Service account loaded successfully');
    
    // Initialize Firebase Admin SDK
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('Firebase Admin SDK initialized successfully');
    
    // Initialize Firestore
    const db = getFirestore();
    console.log('Firestore initialized');
    
    // Test writing to Firestore
    async function testFirestore() {
        try {
            const testData = {
                message: 'Test data',
                timestamp: new Date().toISOString()
            };
            
            console.log('Attempting to write test data to Firestore...');
            const docRef = await db.collection('test').add(testData);
            console.log('Test document written with ID:', docRef.id);
            
            console.log('Attempting to read the test document...');
            const docSnapshot = await db.collection('test').doc(docRef.id).get();
            
            if (docSnapshot.exists) {
                console.log('Document data:', docSnapshot.data());
            } else {
                console.log('No such document!');
            }
            
            console.log('Firebase connection test completed successfully');
        } catch (error) {
            console.error('Error testing Firestore:', error);
        }
    }
    
    // Run the test
    testFirestore();
    
} catch (error) {
    console.error('Firebase initialization error:', error);
}