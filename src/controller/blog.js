// 专门处理数据的地方
const { exec } = require('../db/mysql');
const xss = require('xss');

const getList = (author, keyword) => {
    // 1=1的作用：为了加where和统一add的语句
    let sql = `select * from blogs where 1=1 `;
    if(author) {
        sql += `and author='${author}' `
    }
    if(keyword) {
        sql += `and title like '%${keyword}%' `
    }
    sql+=`order by createtime desc;`;

    // 返回promise
    return exec(sql);
}

const getDetail = (id) => {
    // return [
    //     {
    //         id: 1,
    //         title: "标题A",
    //         content: "内容A",
    //         createTime: 1609430400000,
    //         author: "zhangsan"
    //     }
    // ];
    const sql = `select * from blogs where id='${id}'`;
    
    // 返回promise
    return exec(sql).then(rows => {
        return rows[0];
    });
}

const newBlog = (blodData = {}) => {
    // return {
    //     id: 3,
    // }
    let { title, content, author } = blodData;
    const createtime = Date.now();
    // 预防xss攻击
    title = xss(title);
    content = xss(content);

    const sql = `insert into blogs (title,content, author,createtime) values ('${title}','${content}','${author}',${createtime})`;
    return exec(sql).then(insertData => {
        return {
            id: insertData.insertId
        };
    })
}

const updateBlog = (id, blodData = {}) => {
    const { title, content } = blodData;
    const sql = `update blogs set title='${title}',content='${content}' where id=${id}`;

    return exec(sql).then(updateData => {
        if(updateData.affectedRows > 0) {
            return true;
        }
        return false;
    })
}

const deleteBlog = (id, author) => {
    const sql = `delete from blogs where id='${id}' and author='${author}';`;

    return exec(sql).then(delData => {
        if(delData.affectedRows > 0) {
            return true;
        }
        return false;
    });
}

module.exports = {
    getList,
    getDetail,
    newBlog,
    updateBlog,
    deleteBlog
};