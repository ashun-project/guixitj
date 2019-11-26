var express = require('express');
var request = require("request");
var router = express.Router();
var mysql = require('mysql');
var fs = require('fs');
var pageModule = require('./page');
var pool = mysql.createPool({
    connectionLimit: 100,
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
//下面会修改临时文件的储存位置，如过没有会默认储存别的地方，这里不在详细描述,这个修改临时文件储存的位置 我在百度里查找了三四个小时才找到这个方法，不得不说nodejs真难学。
//所以在这里留下我的学习记录，以备以后翻阅。

function getClientIP(req) {
    return req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
        req.connection.remoteAddress || // 判断 connection 的远程 IP
        req.socket.remoteAddress || // 判断后端的 socket 的 IP
        req.connection.socket.remoteAddress;
};
var domain = {
    pc: 'http://www.guixitj.com',
    m: 'http://m.guixitj.com',
    static: ''
}
// 路由拦截
router.all('*', function (req, res, next) {
    var userAgent = req.headers["user-agent"] || '';
    var deviceAgent = userAgent.toLowerCase();
    var agentID = deviceAgent.match(/(iphone|ipod|ipad|android)/);
    var terminal = '';
    if (agentID) {
        terminal = "mobile";
    } else {
        terminal = "pc";
    }
    req.terminal = terminal;
    
    if (req.url.indexOf('.php') > -1) {
        return get404(req, res)
    }
    if (req.method.toLowerCase() == 'options') {
        res.send(200);  //让options尝试请求快速结束
    } else {
        next();
    }
})

// 首页
router.get('/', function (req, res) {
    // var host = 'http://'+req.headers['host'];
    var listObj = {
        // pageTitle: '情趣综合平台',
        // pageKeyword: '情趣综合平台,美女图片,美女写真,妹子,美女,星闻,绯闻八卦,明星资料，明星活动,qqzhpt,qqzhpt.com',
        // pageDescrition: '情趣综合平台是一家专门收集整理全网超高清的美女写真网站,分享各类美女图片、丝袜美腿、性感MM、清纯妹子等极品美女写真;全部超高清无杂乱水印！明星娱乐八卦新闻,明星绯闻,影视资讯,音乐资讯,八卦爆料,娱乐视频等',
        domain: domain,
        terminal: req.terminal
    }
    res.render('index', listObj);
});

// 关于我们
router.get('/aboutus', function(req, res) {
    var listObj = {
        domain: domain,
        terminal: req.terminal
    }
    res.render('about_us', listObj);
})

// 站内新闻
router.get('/news', function(req, res) {
    var listObj = {
        domain: domain,
        terminal: req.terminal,
        pageTxt: '【第2页】'
    }
    res.render('news', listObj);
})

// 常见问题
router.get('/questions', function(req, res) {
    var listObj = {
        domain: domain,
        terminal: req.terminal
    }
    res.render('questions', listObj);
})

// 最近出售
router.get('/trade', function(req, res) {
    var listObj = {
        domain: domain,
        terminal: req.terminal,
        pageTxt: '【第2页】'
    }
    res.render('trade', listObj);
})

// 最近出售
router.get('/life', function(req, res) {
    var listObj = {
        domain: domain,
        terminal: req.terminal,
        pageTxt: '【第2页】'
    }
    res.render('life', listObj);
})

// 最近出售
router.get('/detail', function(req, res) {
    // title 风骚艳妇王语纯大胆人体艺术照，红色内衣尽显妖娆身姿 - 性感妹子 - 妹子图
    // descript 风骚艳妇王语纯大胆人体艺术照，红色内衣尽显妖娆身姿 - 第1页 - 妹子图每日分享最新最全的高清性感美女图片
    var listObj = {
        pageTitle: '贵溪土鸡',
        pageDescrition: '贵溪土鸡网',
        pageUrl: '',
        domain: domain,
        terminal: req.terminal
    }
    res.render('detail', listObj);
})

// 后台管理页面
router.get('/ashun/admin', function(req, res) {
    res.render('admin');
})

// 文件上传
router.post('/upload',mutipartMiddeware,function (req,res) {  
    var path = req.files.file.path.replace(/\\/g, '\/');
    console.log(path);
    res.json({file_path: domain.static + path.replace('public', ''), file_src: path.replace('public/tmp', '')});
});

// 添加数据
router.post('/insertIntoDataList',function(req,res){
    var params = req.body;
    var create_time = new Date().getTime();
    // type类型 1：出售  2：生活  3：新闻
    pool.getConnection(function (err, conn) {
        var sqList = "INSERT INTO data_list(type,logo,title,create_time,amount,depict) VALUES (?,?,?,?,?,?)";
        var sqListInfo = [params.type, params.logo, params.title, create_time, params.amount, params.depict];
        var sqDetail = "INSERT INTO data_detail(id,content,type,title,create_time,amount) VALUES (?,?,?,?,?,?)";
        conn.query(sqList, sqListInfo, function (err, rows, fields) {
            if (err) {
                res.json({err:err.message});//返回给前端
                conn.release();//关闭连接池
            } else {
                var list_id = rows.insertId
                var sqDetailInfo = [list_id, params.cont, params.type, params.title, create_time, params.amount];
                conn.query(sqDetail, sqDetailInfo, function (err2, rows, fields) {
                    var response = '';
                    if (err2) {
                        response = {err:err2.message};
                    }else{
                        response = {success:'success'}
                    }
                    res.json(response);
                    conn.release();
                    if (params.type !== '3') {
                        moveFile(params);
                    }
                });
            }
        });
    })
})

// 迁移临时文件
function moveFile(obj) {
    fs.exists('./public/tmp' + obj.logo, function(exists) {
        if (exists) {
            try{
                var source = fs.createReadStream('./public/tmp' + obj.logo);
                if (obj.type == '2') {
                    var dest = fs.createWriteStream('./public/img/life' + obj.logo);
                } else {
                    var dest = fs.createWriteStream('./public/img/trade' + obj.logo);
                }
                source.pipe(dest);
            }catch{
                console.log('迁移文件出错')
            }
        } else {
            console.log('文件不存在')
        }
    })
    // source.on('end', function() { fs.unlinkSync(path);});   //delete
    // source.on('error', function(err) {  });
}


// 列表页
router.get('/meitu', function (req, res) {
    meituList(req, res, 'all', 1);
});
router.get('/meitu/page/:page', function (req, res) {
    meituList(req, res, 'all', req.params.page);
});
router.get('/meitu/:type', function (req, res) {
    meituList(req, res, req.params.type, 1);
});
router.get('/meitu/:type/page/:page', function (req, res) {
    var filter = meituMenus.filter(function (item) {
        return item.type === req.params.type;
    })[0];
    if (filter && req.params.page == '1') {
        res.writeHead(301, {'Location': 'http://'+req.headers['host']+'/meitu/'+filter.type+'/'});
        res.end();
    } else {
        meituList(req, res, req.params.type, req.params.page);
    }
});
function meituList(req, res, type, page){
    var limit = Number(page);
    var limitBefore = ((limit - 1) * 20);
    var filter = meituMenus.filter(function (item) {
        return item.type === type;
    })[0];
    if (!filter || !limit) {
        get404(req, res);
        return;
    } else {
        var sql = 'SELECT t1.*,t2.type FROM meitu_list t1 inner join meitu_list_rela t2 on t1.id = t2.list_id where t2.type = "' + type +'" order by t1.id desc limit ' + (limitBefore + ',' + 20);
        var count = 'SELECT COUNT(1) FROM meitu_list t1 inner join meitu_list_rela t2 on t1.id = t2.list_id where t2.type = "' + type +'"';
        if(type == 'all') {
            sql = 'SELECT * FROM meitu_list order by id desc limit ' + (limitBefore + ',' + 20);
            count = 'SELECT COUNT(1) FROM meitu_list';
        }
        pool.getConnection(function (err, conn) {
            if (err) console.log("POOL /==> " + err);
            conn.query(sql, function (err, resultList) {
                conn.query(count, function (errC, total) {
                    var host = 'http://'+req.headers['host'];
                    var result = filterTitle(resultList||[]);
                    var listObj = {
                        listData: result,
                        // headerHtml: getHeaderMenu('meitu', host),
                        childMenus: childMenus,
                        type: 'meitu/'+type,
                        page: pageModule(Number(total[0]['COUNT(1)']) || 0, limit, host+'/meitu'+(type == 'all'? '' : '/'+type)),
                        pageTitle: filter.title + '_情趣综合平台' + (limit>1? '_第'+ limit +'页' : ''),
                        pageKeyword: filter.keyword,
                        pageDescrition: filter.desc,
                        host: host,
                        terminal: req.terminal
                    }
                    res.render('meitu_list', listObj);
                    conn.release();
                });
            });
        });
    }
}

//  搜索页
router.get('/meitu/search/:value', function (req, res) {
    getMeituSearch(req, res, req.params.value, '1');
})
router.get('/meitu/search/:value/page/:page', function (req, res) {
    getMeituSearch(req, res, req.params.value, req.params.page);
})
function getMeituSearch (req, res, searchCont, page) {
    var limit = Number(page) || 1;
    var limitBefore = ((limit - 1) * 20);
    var value = searchCont.replace(/&&/g, '_');
    var sql = 'SELECT * FROM meitu_list where title like "' +'%'+ value +'%'+ '" order by id desc limit ' + (limitBefore + ',' + 20);
    var count = 'SELECT COUNT(1) FROM meitu_list where title like "' +'%'+ value +'%'+ '"';
    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL /==> " + err);
        conn.query(sql, function (err, resultList) {
            conn.query(count, function (errC, total) {
                var resultTotal = Number(total[0]['COUNT(1)']) || 0;
                var host = 'http://'+req.headers['host'];
                var result = filterTitle(resultList||[]);
                var listObj = {
                    listData: result,
                    // headerHtml: getHeaderMenu('meitu', host),
                    childMenus: childMenus,
                    type: 'meitu/tag',
                    searchCont: value,
                    searchTotal: resultTotal,
                    page: resultTotal ? pageModule(resultTotal, limit, host+'/meitu/search/'+searchCont) : '',
                    pageTitle: value+'_美图搜索_情趣综合平台'+(limit>1? '_第'+ limit +'页' : ''),
                    pageKeyword: '美图搜索,美女图片,美女写真,妹子,美女,mm,美女,qqzh8,qqzh8.com',
                    pageDescrition: '情趣综合平台美图搜索全网超高清的美女写真网站,分享各类美女图片、丝袜美腿、性感MM、清纯妹子等极品美女写真;全部超高清无杂乱水印！',
                    host: host,
                    terminal: req.terminal
                }
                res.render('meitu_search', listObj);
                conn.release();
            });
        });
    });
}

// 详情页
router.get('/meitu/detail/:id', function (req, res) {
    getMeituDetail(req, res, req.params.id, 1);
})
router.get('/meitu/detail/:id/:page', function (req, res) {
    getMeituDetail(req, res, req.params.id, Number(req.params.page));
})
function getMeituDetail(req, res, id, page){
    var sql = 'SELECT * FROM meitu_detail where id = "' + id +'"';
    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL /==> " + err);
        conn.query(sql, function (err, resultList) {
            var result = filterTitle(resultList||[]);
            var obj = result[0] || {};
            var host = 'http://'+req.headers['host'];
            var imgs = [];
            var lens = 0;
            var pageCont = '';
            var url = '';
            if (obj.imgs) {
                imgs = obj.imgs.split(',');
                lens = Math.ceil(imgs.length / 5);
                for(var i = 1; i <= lens; i++){
                    url = host + '/meitu/detail/' + id + '/' + i;
                    if (i === 1)  url = host + '/meitu/detail/' + id;
                    pageCont += '<a class="'+ (i === page ? 'active' : '') +'" href="'+ url +'">'+ i +'</a>'
                }
            }
            var listObj = {
                // headerHtml: getHeaderMenu('meitu', host),
                childMenus: childMenus,
                pageTitle: obj.title || '数据丢失',
                type: 'meitu/',
                page: pageCont,
                imgs: imgs.slice(page*5-5, page*5),
                totalImgs: imgs,
                host: host,
                terminal: req.terminal
            }
            var reNum = Math.floor(Math.random()*(1 - 10000) + 10000);//10000
            var recommondSql = 'SELECT t1.*,t2.type FROM meitu_list t1 inner join meitu_list_rela t2 on t1.id = t2.list_id order by t1.id desc limit ' + (reNum + ',' + 8);
            conn.query(recommondSql, function (err, recommondResult) {
                // console.log(reNum, '====', '记得改随机数', getClientIP(req));
                listObj.recommond = filterTitle(recommondResult||[]);
                res.render('meitu_detail', listObj);
                conn.release();
            })
            
        });
    });
}

// 星闻列表
router.get('/xingwen', function(req, res) {
    xingwenList(req, res, 'all', 1);
});
router.get('/xingwen/page/:page', function(req, res) {
    xingwenList(req, res, 'all', req.params.page);
});
router.get('/xingwen/:type', function (req, res) {
    xingwenList(req, res, req.params.type, 1);
})
router.get('/xingwen/:type/page/:page', function (req, res) {
    xingwenList(req, res, req.params.type, req.params.page);
})
function xingwenList(req, res, type, page){
    var limit = Number(page);
    var limitBefore = ((limit - 1) * 20);
    var filter = xingwenMenus.filter(function (item) {
        return item.type === type;
    })[0];
    if (!filter || !limit) {
        get404(req, res);
        return;
    } else {
        var sql = 'SELECT * FROM xingwen_list where type = "' + type + '" order by id desc limit ' + (limitBefore + ',' + 20);
        var count = 'SELECT COUNT(1) FROM xingwen_list where type = "' + type + '"';
        if (filter.type == 'all') {
            sql =  'SELECT * FROM xingwen_list order by id desc limit ' + (limitBefore + ',' + 20);
            count = 'SELECT COUNT(1) FROM xingwen_list';
        }
        pool.getConnection(function (err, conn) {
            if (err) console.log("POOL /==> " + err);
            conn.query(sql, function (err, resultList) {
                conn.query(count, function (errC, total) {
                    var host = 'http://'+req.headers['host'];
                    var listObj = {
                        listData: resultList,
                        childMenus: childMenus,
                        type: 'xingwen/'+type,
                        page: pageModule(Number(total[0]['COUNT(1)']) || 0, limit, host+'/xingwen'+(type== 'all'? '' : '/'+type)),
                        pageTitle: filter.title + '_情趣综合平台' + (limit>1? '_第'+ limit +'页' : ''),
                        pageKeyword: filter.keyword,
                        pageDescrition: filter.desc,
                        host: host,
                        terminal: req.terminal
                    }
                    res.render('xingwen_list', listObj);
                    conn.release();
                });
            });
        });
    }
}

// 星闻详情页
router.get('/xingwen/:type/:id', function (req, res) {
    if (req.params.type === 'search') {
        getXingwenSearch(req, res, req.params.id, '1');
    } else {
        getXingwenDetail(req, res, req.params.type, req.params.id, 1);
    }
})
router.get('/xingwen/:type/:id/:page', function (req, res) {
    getXingwenDetail(req, res, req.params.type, req.params.id, Number(req.params.page));
})
function getXingwenDetail(req, res, type, id, page){
    var sql = 'SELECT * FROM xingwen_detail where id = "' + id +'"';
    var filter = xingwenMenus.filter(function (item) {
        return item.type === type;
    })[0];
    if (type === 'quan') {
        filter = {name: '标签', type: ''}
    }
    if (!filter || !page) {
        get404(req, res);
        return;
    } else {
        pool.getConnection(function (err, conn) {
            if (err) console.log("POOL /==> " + err);
            conn.query(sql, function (err, resultList) {
                var obj = resultList[0] || {};
                var host = 'http://'+req.headers['host'];
                var txtList = '';
                if (obj.txt) {
                    var txtList = JSON.parse(obj.txt);
                    var txtLen = Math.floor(Math.random()*txtList.length);
                    for(var k = 0; k < txtList.length; k++) {
                        var dou = txtList[k].split('，');
                        var douLne = Math.floor(Math.random()*dou.length);
                        var newDou = [];
                        for(var b = 0; b < dou.length; b++) {
                            if (b == douLne && b > 0) {
                                newDou[b-1] = newDou[b-1]+dou[b];
                            } else {
                                newDou.push(dou[b]);
                            }
                        }
                        txtList[k] = newDou.join('，');
                    }
                    txtList.splice(txtLen, 0, '<a href="'+ host +'/xingwen/'+ (filter.type|| 'all') +'/">本章来源情趣综合平台-'+ filter.name +'</a>')
                }
                var listObj = {
                    childMenus: childMenus,
                    pageTitle: obj.title || '数据丢失',
                    position: filter,
                    txt: txtList,//JSON.parse(obj.txt),
                    type: 'xingwen/'+type,
                    host: host,
                    terminal: req.terminal
                }
                var reNum = Math.floor(Math.random()*(1 - 1000) + 1000);//10000
                var recommondSql = 'SELECT * FROM xingwen_list where type = "'+ (filter.type||'huodong')  +'" order by id desc limit ' + (reNum + ',' + 4);
                conn.query(recommondSql, function (err, recommondResult) {
                    // console.log(reNum, '====', '记得改随机数', host)
                    listObj.recommond = recommondResult.filter(function (item) {return item.id !== id});
                    res.render('xingwen_detail', listObj);
                    conn.release();
                })
            });
        });
    }
}

//  星闻搜索页
router.get('/xingwen/search/:value/page/:page', function (req, res) {
    getXingwenSearch(req, res, req.params.value, req.params.page);
})
function getXingwenSearch (req, res, searchCont, page) {
    var limit = Number(page) || 1;
    var limitBefore = ((limit - 1) * 20);
    var value = searchCont.replace(/&&/g, '_');
    var sql = 'SELECT * FROM xingwen_list where title like "' +'%'+ value +'%'+ '" order by id desc limit ' + (limitBefore + ',' + 20);
    var count = 'SELECT COUNT(1) FROM xingwen_list where title like "' +'%'+ value +'%'+ '"';
    pool.getConnection(function (err, conn) {
        if (err) console.log("POOL /==> " + err);
        conn.query(sql, function (err, resultList) {
            conn.query(count, function (errC, total) {
                var resultTotal = Number(total[0]['COUNT(1)']) || 0;
                var host = 'http://'+req.headers['host'];
                var result = filterTitle(resultList||[]);
                var listObj = {
                    listData: result,
                    // headerHtml: getHeaderMenu('meitu', host),
                    childMenus: childMenus,
                    type: 'xingwen/tag',
                    searchCont: value,
                    searchTotal: resultTotal,
                    page: resultTotal ? pageModule(resultTotal, limit, host+'/xingwen/search/'+searchCont) : '',
                    pageTitle: value+'_星闻搜索_情趣综合平台'+(limit>1? '_第'+ limit +'页' : ''),
                    pageKeyword: '星闻搜索,最新星闻,明星活动,明星趣事,美女明星,明星绯闻,qqzh8,qqzh8.com',
                    pageDescrition: '情趣综合平台星闻搜索全网超高清的美女写真网站,分享各类明星活动、明星趣事、明星绯闻、最新星闻等资讯！',
                    host: host,
                    terminal: req.terminal
                }
                res.render('xingwen_search', listObj);
                conn.release();
            });
        });
    });
}

// 获取静态图片
router.get('/meitustatic/*', function (req, res) {
    getStaticImg (req, res, 'https://mtl.ttsqgs.com', 'https://www.meitulu.com/')
});
router.get('/xingwenstatic/*', function (req, res) {
    getStaticImg (req, res, 'http://img.mingxing.com', 'http://www.mingxing.com')
});
function getStaticImg (req, res, urlHost, referer) {
    var src = urlHost + req.url.replace(/\/xingwenstatic|\/meitustatic/, '');
    var options = {
        method: 'GET',
        url: src,
        gzip: true,
        encoding: null,
        // originalHostHeaderName: 'www.mingxing.com',
        headers: {
            "X-Forwarded-For": '42.194.64.18',
            'User-Agent': 'Mozilla/8.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36',
            'referer': referer,
            'Cookie': "PHPSESSID=88f1qocpntbtjnp990pkqvo3a4; UM_distinctid=16846df58e71c8-0735f5020bd16-10326653-13c680-16846df58e8f22; CNZZDATA1273706240=1075868105-1547372666-http%253A%252F%252Fmvxoxo.com%252F%7C1547431260; CNZZDATA1275906764=206766016-1547375436-http%253A%252F%252Fmvxoxo.com%252F%7C1547430243"
        }
    };
    let head = { 'Content-Type': 'image/jpeg' };
    var rqRst = request(options);
    res.writeHead(200, head);
    rqRst.pipe(res);
    // rqRst.on('end', function () {
    //     // res.end();
    // });
    rqRst.on('error', function(err) {
        console.log("错误信息:" + err);
        res.end();
    });
}

// 友情链接相关
router.get('/friendly666', function (req, res) {
    fs.readFile('./public/users.json',function(err,data){
        var person = data.toString();//将二进制的数据转换为字符串
        person = JSON.parse(person);//将字符串转换为json对象
        res.render('friendly', person);
    })
});

router.post('/friendly/del', function (req, res) {
    var obj = req.body;
    fs.readFile('./public/users.json',function(err,data){
        var person = data.toString();//将二进制的数据转换为字符串
        person = JSON.parse(person);//将字符串转换为json对象
        for(var i = 0; i < person.data.length; i++){
            if(obj.id == person.data[i].id){
                person.data.splice(i,1);
            }
        }
        var str = JSON.stringify(person);
        //然后再把数据写进去
        fs.writeFile('./public/users.json',str,function(err){
            if(err){
                console.error(err);
            }
        })
        res.json({code: 200, msg: '删除成功'})
    })
})
router.post('/friendly/add', function (req,res){
    var params = req.body
    //现将json文件读出来
    fs.readFile('./public/users.json',function(err,data){
        if(err){
            return console.error(err);
        }
        var person = data.toString();//将二进制的数据转换为字符串
        var id = 1;
        person = JSON.parse(person);//将字符串转换为json对象
        for (var i = 0; i < person.data.length; i++) {
            if (person.data[i].id >= id) {
                id = person.data[i].id + 1
            }
        }
        params.id = id
        person.data.push(params);//将传来的对象push进数组对象中
        var str = JSON.stringify(person);//因为nodejs的写入文件只认识字符串或者二进制数，所以把json对象转换成字符串重新写入json文件中
        fs.writeFile('./public/users.json',str,function(err){
            if(err){r(err);
            }
        })
        res.json({code: 200, msg: '添加成功', data: params})
    })
})

// 404页
router.get('*', get404);
function get404(req, res) {
    var listObj = {
        pageTitle: '404页面_情趣综合平台',
        pageKeyword: '美女图片,美女写真,妹子,美女,mm,美女,qqzh8,qqzh8.com',
        pageDescrition: '情趣综合平台是一家专门收集整理全网超高清的美女写真网站,分享各类美女图片、丝袜美腿、性感MM、清纯妹子等极品美女写真;全部超高清无杂乱水印！',
        host: 'http://'+req.headers['host']
    }
    res.status(404);
    res.render('404', listObj);
}

module.exports = router;