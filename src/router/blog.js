const {
    getList,
    getDetail,
    newBlog,
    updateBlog,
    deleteBlog
} = require('../controller/blog');
const {
    SuccessModel,
    ErrorModel
} = require('../model/resModel');

// 登录验证函数
const loginCheck = (req) => {
    if (!req.session.username) {
        return Promise.resolve(new ErrorModel("尚未登录"));
    }
}

const handleBlogRouter = (req, res) => {
    const method = req.method;

    // 获取博客列表
    if (method === "GET" && req.path === "/api/blog/list") {
        const {
            author = "", keyword = ""
        } = req.query;
        const result = getList(author, keyword);
        return result.then(listData => {
            return new SuccessModel(listData);
        });
    }

    // 获取博客详情
    if (method === "GET" && req.path === "/api/blog/detail") {
        const id = req.query.id;
        const result = getDetail(id);
        return result.then(data => {
            return new SuccessModel(data);
        });
    }

    // 新建博客
    if (method === "POST" && req.path === "/api/blog/new") {
        const loginCheckResult = loginCheck(req);
        if(loginCheckResult) {
            // 未登录
            return loginCheck;
        }
        const blogData = req.body;
        req.body.author = req.session.username;
        const result = newBlog(blogData);
        return result.then(data => {
            return new SuccessModel(data);
        });
    }

    // 更新博客
    if (method === "POST" && req.path === "/api/blog/update") {
        const loginCheckResult = loginCheck(req);
        if(loginCheckResult) {
            // 未登录
            return loginCheck;
        }
        const id = req.query.id;
        const blogData = req.body;
        const result = updateBlog(id, blogData);
        return result.then(val => {
            if (val) {
                return new SuccessModel();
            } else {
                return new ErrorModel("更新博客失败");
            }
        });
    }

    // 删除博客
    if (method === "POST" && req.path === "/api/blog/del") {
        const loginCheckResult = loginCheck(req);
        if(loginCheckResult) {
            // 未登录
            return loginCheck;
        }
        const id = req.query.id;
        const author = req.session.username;
        const result = deleteBlog(id, author);
        return result.then(val => {
            if (val) {
                return new SuccessModel();
            } else {
                return new ErrorModel("删除博客失败");
            }
        });
    }
}

module.exports = handleBlogRouter;