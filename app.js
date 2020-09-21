// const http = require("http");
// const querystring = require("querystring");

// GET请求处理
// const server = http.createServer((req, res) => {
//     console.log("method:", req.method);
//     const url = req.url;
//     console.log("url:", url);
//     req.query = querystring.parse(url.split("?")[1]);
//     console.log("query:", req.query);
//     res.end(JSON.stringify(req.query));
// });

// POST请求
// const server = http.createServer((req, res) => {
//     if (req.method === "POST") {
//         console.log('content-type:', req.headers['content-type']);
//         let postData = "";
//         req.on('data', chunk => {
//             // chunk是二进制格式
//             postData += chunk.toString();
//         });
//         req.on('end', () => {
//             console.log("postData", postData);
//             console.log("end");
//         })
//     }
// });

// 综合处理
// const server = http.createServer((req, res) => {
//     const method = req.method;
//     const url = req.url;
//     const path = url.split("?")[0];
//     const query = querystring.parse(url.split("?")[1]);

//     // 设置返回格式为JSON
//     res.setHeader('Content-type', "application/json");

//     // 返回数据
//     const resData = {
//         method,
//         url,
//         path,
//         query,
//     };

//     // 返回
//     if (method === "GET") {
//         res.end(JSON.stringify(resData));
//     }
//     if (req.method === "POST") {
//         let postData = "";
//         req.on('data', chunk => {
//             // chunk是二进制格式
//             postData += chunk.toString();
//         });
//         req.on('end', () => {
//             res.postData = postData;
//         });
//     }
// });

// server.listen(8000, "127.0.0.1", () => {
//     console.log("node服务启动成功了");
// })

// 1、npm i nodemon -D
// 2、修改package.json的启动命令
// 3、在nodemon.json中配置检测的文件
// 4、debug模式"start": "DEBUG=* nodemon src/app.js",

const querystring = require("querystring");
const handleBlogRouter = require('./src/router/blog');
const handleUserRouter = require('./src/router/user');
const { access } = require('./src/utils/log');

// 获取cookie的过期时间
const getCookieExpires = () => {
    const d = new Date();
    d.setTime(d.getTime() + (24 * 60 * 60 * 1000));
    return d.toGMTString();
}

// session存储
const SESSION_DATA = {};

// 处理post data
const getPostData = (req) => {
    return new Promise((resolve, reject) => {
        if (req.method !== "POST") {
            resolve({});
            return;
        }
        if (req.headers['content-type'] !== 'application/json') {
            resolve({});
            return;
        }
        let postData = "";
        req.on('data', chunk => {
            // chunk是二进制格式
            postData += chunk.toString();
        });
        req.on('end', () => {
            if (!postData) {
                resolve({});
                return;
            }
            resolve(JSON.parse(postData));
        });
    });
}

const serverHandler = (req, res) => {
    // 记录access log
    access(`${req.method} -- ${req.url} -- ${req.headers['user-agent']} -- ${Date.now()}`);

    // 设置返回格式为JSON
    res.setHeader('Content-type', "application/json");

    // 解析path
    const url = req.url;
    req.path = url.split("?")[0];

    // 解析query
    req.query = querystring.parse(url.split("?")[1]);

    // 解析cookie
    req.cookie = {};
    const cookieStr = req.headers.cookie || "";
    cookieStr.split(";").forEach(item => {
        if (!item) {
            return;
        }
        const [key, value] = item.split("=");
        req.cookie[key.trim()] = value;
    });

    // 解析session
    let needSetCookie = false;
    let userId = req.cookie.userId;
    if (userId) {
        if (!SESSION_DATA[userId]) {
            SESSION_DATA[userId] = {};
        }
    } else {
        needSetCookie = true;
        // 保证userId为一个不重复的随机值
        userId = `${Date.now()}_${Math.random()}`;
        SESSION_DATA[userId] = {};
    }
    req.session = SESSION_DATA[userId];

    // 处理postData
    getPostData(req).then(postData => {
        req.body = postData;

        // 处理blog路由
        // const blogData = handleBlogRouter(req, res);
        const blogResult = handleBlogRouter(req, res);
        if (blogResult) {
            blogResult.then(blogData => {
                if (needSetCookie) {
                    res.setHeader("Set-Cookie", `userId=${userId};path=/;httpOnly;expires=${getCookieExpires()};`);
                }
                res.end(JSON.stringify(blogData));
            });
            return;
        }

        // 处理user路由
        const userResult = handleUserRouter(req, res);
        if (userResult) {
            userResult.then(userData => {
                if (needSetCookie) {
                    res.setHeader("Set-Cookie", `userId=${userId};path=/;httpOnly;expires=${getCookieExpires()};`);
                }
                res.end(JSON.stringify(userData));
            });
            return;
        }

        // 未命中路由，返回404
        res.writeHead(404, {
            "Content-type": "text/plain"
        });
        res.write("404 not found");
        res.end();
    });
}

module.exports = serverHandler;