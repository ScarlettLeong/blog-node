const http = require("http");

const PORT = 7000;
const serverHandler = require('../app');

const server = http.createServer(serverHandler);
server.listen(PORT);