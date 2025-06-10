const net = require('net');

describe('Port Finding Mechanism', () => {
    let occupiedPort;
    let dummyServer;

    beforeAll((done) => {
        // Create a dummy server to occupy a port
        dummyServer = net.createServer();
        dummyServer.listen(5000, () => {
            occupiedPort = 5000;
            done();
        });
    });

    afterAll((done) => {
        // Clean up the dummy server
        if (dummyServer) {
            dummyServer.close(() => {
                done();
            });
        } else {
            done();
        }
    });

    it('should find next available port when default port is in use', async () => {
        const { findAvailablePort } = require('../server');
        const port = await findAvailablePort(5000);
        expect(port).toBe(5001);
    });

    it('should use the desired port if it is available', async () => {
        const { findAvailablePort } = require('../server');
        const port = await findAvailablePort(6000);
        expect(port).toBe(6000);
    });
});