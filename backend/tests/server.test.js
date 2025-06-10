const request = require('supertest');
const app = require('../server');

describe('Server Tests', () => {
    it('should return 200 and success message for health check endpoint', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('success');
        expect(res.body.message).toBe('API is running');
        expect(res.body.timestamp).toBeDefined();
    });

    it('should return 404 for non-existent routes', async () => {
        const res = await request(app).get('/non-existent-route');
        expect(res.statusCode).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.error).toBe('Not Found');
    });

    it('should require authentication for protected routes', async () => {
        const protectedRoutes = [
            '/api/departments',
            '/api/students',
            '/api/complaints',
            '/api/admin'
        ];

        for (const route of protectedRoutes) {
            const res = await request(app).get(route);
            expect(res.statusCode).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toBe('Unauthorized - Invalid token');
        }
    });
});