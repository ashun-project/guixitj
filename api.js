var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var fs = require('fs');
var pageModule = require('./page');
var pool = mysql.createPool({
    // connectionLimit: 100,
    host: 'localhost',
    user: 'root',
    password: 'ashun666',
    database: 'guixitj'
});

//form表单需要的中间件。
var mutipart= require('connect-multiparty');
var mutipartMiddeware = mutipart({
    uploadDir: './public/tmp'
});

function getClientIP(req) {
    return req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
        req.connection.remoteAddress || // 判断 connection 的远程 IP
        req.socket.remoteAddress || // 判断后端的 socket 的 IP
        req.connection.socket.remoteAddress;
};
var domain = {
    pc: 'http://www.guixitj.com',//'http://www.guixitj.com',
    m: 'http://m.guixitj.com',//'http://m.guixitj.com',
    static: 'http://static.guixitj.com'//http://static.guixitj.com
}
// 路由拦截
router.all('*', function (req, res, next) {
    var userAgent = req.headers["user-agent"] || '';
    var deviceAgent = userAgent.toLowerCase();
    var agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/);
    var terminal = '';
    if (agentID) {
        terminal = "mobile";
        if (req.headers['host'] !== 'm.guixitj.com') {
            return res.redirect(302, domain.m + req.url);
        }
    } else {
        terminal = "pc";
    }
    req.terminal = terminal;
    
    if (req.url.indexOf('.php') > -1) {
        return get404(req, res)
    }
    if (req.method.toLowerCase() == 'options') {
        res.send('');  //让options尝试请求快速结束
    } else {
        next();
    }
})

// 首页
router.get('/', function (req, res) {
    // var host = 'http://'+req.headers['host'];
    var sql = 'select a.* from (select * from data_list where type = "life" order by id desc limit 5) a union all select b.* from (select * from data_list where type = "trade" order by id desc limit 5) b union all select c.* from (select * from data_list where type = "news" order by id desc limit 6) c';
    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL /==> " + err);
        conn.query(sql, function (err, result) {
            var dataList = result || [];
            var dataObj = {
                life: [],
                trade: [],
                news: []
            }
            for (var i = 0; i < dataList.length; i++) {
                dataObj[dataList[i].type].push(dataList[i]);
            }
            var listObj = {
                domain: domain,
                life: dataObj.life,
                trade: dataObj.trade,
                news: dataObj.news,
                pageUrl: '/'
            }
            res.render('index', listObj);
            conn.release();
        })
    })
});

// 关于我们
router.get('/aboutus', function(req, res) {
    var sql = 'SELECT * FROM data_list where type = "life" order by id desc limit 5';
    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL /==> " + err);
        conn.query(sql, function (err, result) {
            var listObj = {
                domain: domain,
                pageUrl: req.url,
                life: result || []
            }
            res.render('about_us', listObj);
            conn.release();
        })
    })
})

// 常见问题
router.get('/questions', function(req, res) {
    var sql = 'SELECT * FROM data_list where type = "news" order by id desc limit 8';
    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL /==> " + err);
        conn.query(sql, function (err, result) {
            var listObj = {
                domain: domain,
                pageUrl: req.url,
                news: result || []
            }
            res.render('questions', listObj);
            conn.release();
        })
    })
})

// 站内新闻
router.get('/news', function (req, res) {
    getNewsDataList(req, res, '1');
});
router.get('/news/:page', function (req, res) {
    getNewsDataList(req, res, req.params.page);
});
function getNewsDataList(req, res, page) {
    var limit = Number(page);
    var limitBefore = ((limit - 1) * 12);
    var sql = 'select a.* from (select * from data_list where type = "news" order by id desc limit '+ limitBefore + ',' + 12 +') a union all select b.* from (select * from data_list where type = "life" order by id desc limit 4) b';
    var count = 'SELECT COUNT(1) FROM data_list where type = "news"';
    var listObj = {
        domain: domain,
        pageTxt: limit > 1 ? '【第' + limit + '页】' : '',
        pageUrl: req.url,
        news: [],
        life: []
    };
    if (!limit) {
        get404(req, res);
        return;
    }
    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL /==> " + err);
        conn.query(sql, function (err, result) {
            if (err) {
                res.render(type, listObj);
                conn.release();
            } else {
                conn.query(count, function (errC, total) {
                    var resultTotal = Number(total[0]['COUNT(1)']) || 0;
                    var resultList = result || [];
                    for (var i = 0; i < resultList.length; i++) {
                        listObj[resultList[i].type].push(resultList[i]);
                    }
                    listObj.page = resultTotal ? pageModule(resultTotal, limit, domain.pc + '/news') : '';
                    res.render('news', listObj);
                    conn.release();
                })
            }
        })
    })
}

// 成交记录
router.get('/trade', function (req, res) {
    getTradeDataList(req, res, 'trade', '1');
});
router.get('/trade/:page', function (req, res) {
    getTradeDataList(req, res, 'trade', req.params.page);
});
function getTradeDataList(req, res, type, page) {
    var limit = Number(page);
    var limitBefore = ((limit - 1) * 12);
    var sql = 'select a.* from (select * from data_list where type = "'+ type +'" order by id desc limit '+ limitBefore + ',' + 12 +') a union all select b.* from (select * from data_list where type = "news" order by id desc limit 8) b';
    var count = 'SELECT COUNT(1) FROM data_list where type = "'+ type +'"';
    var listObj = {
        domain: domain,
        pageTxt: limit > 1 ? '【第' + limit + '页】' : '',
        pageUrl: req.url,
        news: [],
        trade: []
    };
    listObj[type] = [];
    if (!limit) {
        get404(req, res);
        return;
    }
    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL /==> " + err);
        conn.query(sql, function (err, result) {
            if (err) {
                res.render(type, listObj);
                conn.release();
            } else {
                conn.query(count, function (errC, total) {
                    var resultTotal = Number(total[0]['COUNT(1)']) || 0;
                    var resultList = result || [];
                    for (var i = 0; i < resultList.length; i++) {
                        listObj[resultList[i].type].push(resultList[i]);
                    }
                    listObj.page = resultTotal ? pageModule(resultTotal, limit, domain.pc + '/' + type) : '';
                    res.render(type, listObj);
                    conn.release();
                })
            }
        })
    })
}

// 农家生活
router.get('/life', function (req, res) {
    getLifeDataList(req, res, '1');
});
router.get('/life/:page', function (req, res) {
    getLifeDataList(req, res, req.params.page);
});
function getLifeDataList(req, res, page) {
    var limit = Number(page);
    var limitBefore = ((limit - 1) * 12);
    var sql = 'SELECT * FROM data_list where type = "life" order by id desc limit ' + limitBefore + ',' + 12;
    var count = 'SELECT COUNT(1) FROM data_list where type = "life"';
    var listObj = {
        domain: domain,
        pageTxt: limit > 1 ? '【第' + limit + '页】' : '',
        pageUrl: req.url,
        life: []
    };
    if (!limit) {
        get404(req, res);
        return;
    }
    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL /==> " + err);
        conn.query(sql, function (err, result) {
            if (err) {
                res.render(type, listObj);
                conn.release();
            } else {
                conn.query(count, function (errC, total) {
                    var resultTotal = Number(total[0]['COUNT(1)']) || 0;
                    listObj.life = result || [];
                    listObj.page = resultTotal ? pageModule(resultTotal, limit, domain.pc + '/news') : '';
                    res.render('life', listObj);
                    conn.release();
                })
            }
        })
    })
}

// 文章详情
router.get('/detail/:id', function(req, res) {
    var listObj = {
        // pageTitle: obj.title + ' - 贵溪土鸡',
        // pageDescrition: obj.title + ' - 贵溪土鸡每日分享农家生活，近日出售，站内新闻相关文章',
        pageUrl: req.url,
        domain: domain,
        objData: {title: '没有找到数据', content: '数据出错'},
        typeTxt: {trade: '成交记录', news: '站内新闻', life: '农家生活'},
        newsList: []
    }
    var sql = 'SELECT * FROM data_detail where id = "' + req.params.id +'"';
    var tuijian = 'SELECT * FROM data_list where type = "news" order by id desc limit 10';
    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL /==> " + err);
        conn.query(sql, function (err, result) {
            if (err) {
                res.render('detail', listObj);
                conn.release();
            } else {
                conn.query(tuijian, function (err, resultList) {
                    listObj.objData = result[0] || {};
                    listObj.newsList = resultList || [];
                    res.render('detail', listObj);
                    conn.release();
                })
            }
        })
    })
})

// 后台管理页面
router.get('/ashun/admin', function(req, res) {
    res.render('admin', {domain: domain});
})
// 获取通知信息
router.get('/notice/service', function(req, res) {
    // console.log(req)
    console.log('=======================')
    console.log(req.body, req.query, req.params)
    res.send('')
})

// 文件上传
router.post('/upload',mutipartMiddeware,function (req,res) {  
    var path = req.files.file.path.replace(/\\/g, '\/');
    res.json({file_path: path.replace('public', ''), file_src: path.replace('public/tmp', '')});
});

// 添加数据
function getFormatDate(time) {
    var date = time ? new Date(time) : new Date();
    var str = '';
    var dateArr = [date.getFullYear(), '-', date.getMonth() + 1, '-', date.getDate(), ' ', date.getHours(), ':', date.getMinutes()];
    dateArr.forEach(item => {
        if (typeof item === 'number' && item < 10) item = '0' + item;
        str += item;
    });
    return str;
}
router.post('/insertIntoDataList',function(req,res){
    var params = req.body;
    var create_time = new Date().getTime();
    pool.getConnection(function (err, conn) {
        var sqList = "INSERT INTO data_list(type,logo,title,create_time,amount,depict) VALUES (?,?,?,?,?,?)";
        var sqListInfo = [params.type, params.logo, params.title, getFormatDate(), params.amount, params.depict];
        var sqDetail = "INSERT INTO data_detail(id,content,type,title,create_time,amount) VALUES (?,?,?,?,?,?)";
        conn.query(sqList, sqListInfo, function (err, rows, fields) {
            if (err) {
                res.json({err:err.message});//返回给前端
                conn.release();//关闭连接池
            } else {
                var list_id = rows.insertId
                var sqDetailInfo = [list_id, replayImg(params.cont, params.type), params.type, params.title, getFormatDate(), params.amount];
                conn.query(sqDetail, sqDetailInfo, function (err2, rows, fields) {
                    var response = '';
                    if (err2) {
                        response = {err:err2.message};
                    }else{
                        response = {success:'success'}
                    }
                    res.json(response);
                    for (var i = 0; i < params.imgs.length; i++) {
                        moveFile(params.type, params.imgs[i]);
                    }
                    conn.release();
                });
            }
        });
    })
})

// 替换临时文件路径
function replayImg(cont, type) {
    var src = 'src="' + domain.static + '/img/' + type;
    return cont.replace(/src=\"\/tmp/g, src)
}

// 迁移临时文件
function moveFile(type, src) {
    fs.exists('./public/tmp' + src, function(exists) {
        if (exists) {
            try{
                var source = fs.createReadStream('./public/tmp' + src);
                var dest = fs.createWriteStream('./public/img/' + type + src);
                // if (type == '2') {
                //     var dest = fs.createWriteStream('./public/img/life' + src);
                // } else {
                //     var dest = fs.createWriteStream('./public/img/trade' + src);
                // }
                source.pipe(dest);
            }catch (e){
                console.log('迁移文件出错')
            }
        } else {
            console.log('文件不存在')
        }
    })
    // source.on('end', function() { fs.unlinkSync(path);});   //delete
    // source.on('error', function(err) {  });
}

// 404页
router.get('*', get404);
function get404(req, res) {
    var listObj = {
        host: 'http://'+req.headers['host']
    }
    res.status(404);
    res.render('404', listObj);
}

module.exports = router;