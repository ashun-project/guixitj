var express = require('express');
var request = require("request");
var router = express.Router();
var mysql = require('mysql');
var fs = require('fs');
var pageModule = require('./page');
var pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'ashun666',
    database: 'qqzh'
});

var meituMenus = [
    {url: '/all', type: 'all', name: '全部分类', title: '精品美图_美图写真_阿顺美图', keyword: '美女图片,美女写真,妹子,美女,mm,阿顺美图', desc: '阿顺美图专门收集整理全网超高清的美女写真网站,分享各类美女图片、丝袜美腿、性感MM、清纯妹子等极品美女写真;全部超高清无杂乱水印！'},
    {url: '/t/nvshen/', type: 'nvshen', name: '女神', title: '女神_性感女神_宅男女神排行榜_超高清女神写真套图', keyword: '性感女神,宅男女神,女神图片,女神排行榜', desc: '阿顺美图整理的女神套图，都是宅男心目中的性感女神、所有图片都是超高清，并有排行榜单'},
    {url: '/t/jipin/', type: 'jipin', name: '极品', title: '极品美女图片_超高清极品美女写真套图', keyword: '极品美女,极品美女图,极品美女写真', desc: '阿顺美图整理的极品美女写真套图，全部超高清，有极品性感美女，极品清纯美女，极品诱惑美女，日本极品美女等'},
    {url: '/t/nenmo/', type: 'nenmo', name: '嫩模', title: '嫩模_嫩模图片_日本嫩模写真_超高清嫩模套图在线欣赏', keyword: '嫩模图片,嫩模写真,日本嫩模', desc: '在线欣赏阿顺美图整理的超高清嫩模写真套图;包括国产性感嫩模图片,日本嫩模写真套图,台湾美腿嫩模等'},
    {url: '/t/wangluohongren/', type: 'wangluohongren', name: '网络红人', title: '网络红人_网络红人美女_网络红人图片_网络红人排行榜', keyword: '网络红人图片,网络红人美女', desc: '阿顺美图整理的超高清网络红人美女图片'},
    {url: '/t/fengsuniang/', type: 'fengsuniang', name: '风俗娘', title: '风俗娘|韩国风俗媚娘全套图_超高清韩国风俗娘官网全集套图', keyword: '风俗娘,风俗媚娘,韩国风俗娘,韩国风俗媚娘,风俗娘官网图片', desc: '在线欣赏阿顺美图整理的韩国风俗娘官网的全集套图;全部都是无水印,原尺寸的高清大图'},
    {url: '/t/qizhi/', type: 'qizhi', name: '气质', title: '气质美女图片_气质美女生活照_超高清气质美女写真套图', keyword: '气质美女,气质美女生活照,气质美女图片', desc: '阿顺美图整理的气质美女写真套图，全部超高清；包括一些气质美女图片、生活照及一些性感的气质美女'},
    {url: '/t/youwu/', type: 'youwu', name: '尤物', title: '性感尤物_尤物美女图片|超高清极品尤物写真套图', keyword: '尤物,尤物美女,性感尤物,尤物写真', desc: '阿顺美图整理的尤物美女写真套图，所有图片全部超高清，快来领略香艳尤物的养眼美图吧'},
    {url: '/t/baoru/', type: 'baoru', name: '爆乳', title: '爆乳_爆乳美女诱惑_爆乳肥臀_爆乳妹子_超高清爆乳MM写真图片', keyword: '爆乳美女,爆乳诱惑,爆乳肥臀,爆乳妹子图片', desc: '阿顺美图整理的爆乳美女写真套图，海量超高清爆乳妹子、爆乳肥臀、丝袜诱惑等爆乳美女图片'},
    {url: '/t/xinggan/', type: 'xinggan', name: '性感', title: '性感美女_超性感美女图片_超高清性感美女写真套图', keyword: '性感,性感美女,高清性感美女图片,超高清性感美女图', desc: '阿顺美图精选的性感美女写真套图，全部超高清；而且是超性感哦'},
    {url: '/t/youhuo/', type: 'youhuo', name: '诱惑', title: '美女诱惑_性感美女诱惑图片_超高清诱惑美女写真套图', keyword: '诱惑图片,美女诱惑,诱惑美女写真,诱惑套图', desc: '阿顺美图精选整理的诱惑美女写真套图，室内诱惑，野外诱惑，场景诱惑，全部超高清！'},
    {url: '/t/meixiong/', type: 'meixiong', name: '美胸', title: '美胸_美胸美女图片_超高清美胸模特写真套图', keyword: '美胸美女,美胸图片,高清美胸图', desc: '阿顺美图整理超高清美胸美女模特的写真套图，有日本的美胸美女，也是中国的美胸美女和欧美的'},
    {url: '/t/shaofu/', type: 'shaofu', name: '少妇', title: '少妇_性感少妇图片_寂寞少妇_风骚少妇写真_超高清少妇图片大全', keyword: '少妇图片,性感少妇,寂寞少妇,风骚少妇', desc: '阿顺美图整理的极品少妇图片，全部超高清，都是套图。包括性感少妇、寂寞少妇、风骚少妇等少妇图片'},
    {url: '/t/changtui/', type: 'changtui', name: '长腿', title: '长腿美女图片_街拍长腿美女_长腿丝袜_超短裙长腿美女_超高清长腿美女写真套图', keyword: '长腿美女,长腿丝袜,街拍长腿美女,超短裙长腿美女', desc: '阿顺美图整理的长腿美女图片, 高跟鞋长腿美女,都是超高清的图片,有专业的长腿丝袜美女写真套图、也有街拍长腿美女；'},
    {url: '/t/mengmeizi/', type: 'mengmeizi', name: '萌妹子', title: '萌妹子_萌妹纸图片_超高清萌妹子写真套图', keyword: '萌妹子,天然萌妹子,萌妹纸图片,萌妹子写真', desc: '阿顺美图整理的萌妹子(萌妹纸)图片，都是超高清的大图！快来欣赏萌翻你的萌妹子吧'},
    {url: '/t/loli/', type: 'loli', name: '萝莉', title: '萝莉_萝莉控_日本萝莉_巨乳萝莉|超高清小萝莉写真套图', keyword: '小萝莉,日本萝莉,萝莉控,巨乳萝莉,萝莉写真套图', desc: '阿顺美图整理的萝莉美女写真套图，有日本萝莉、巨乳萝莉，清新萝莉妹子，萝莉控们有福了，全部都是超高清的图片'},
    {url: '/t/keai/', type: 'keai', name: '可爱', title: '可爱美女_清纯可爱美女图片_超高清日本性感可爱美女写真套图', keyword: '可爱美女图片,性感可爱美女,清纯可爱美女', desc: '阿顺美图整理的可爱美女写真套图，全部超高清，有日本性感的可爱美女写真，也有国产的清纯可爱美女图片'},
    {url: '/t/huwai/', type: 'huwai', name: '户外', title: '户外美女_户外美女图片_美女户外照片_超高清户外美女写真', keyword: '户外美女,户外美女摄影,美女户外照片,户外美女写真', desc: '阿顺美图精选的超高清户外美女写真图片,包括户外美女摄影、户外美女模特照片、户外清纯美女等图片'},
    {url: '/t/bijini/', type: 'bijini', name: '比基尼', title: '比基尼美女_性感比基尼美女图片_超高清日本比基尼美女|中国比基尼图片', keyword: '比基尼,中国比基尼美女,日本比基尼美女,性感比基尼', desc: '阿顺美图整理的比基尼美女图片，有日本比基尼美女，也有性感的中国比基尼图片；都是超高清的写真套图'},
    {url: '/t/qingchun/', type: 'qingchun', name: '清纯', title: '清纯美女图片_超高清清纯美女写真_清纯美女生活照', keyword: '清纯美女,清纯美女图,清纯美女写真,清纯美女生活照', desc: '阿顺美图精选的清纯美女写真套图，全部超高清，有清纯唯美类、有清新校园类，也有清新萝莉类'},
    {url: '/t/weimei/', type: 'weimei', name: '唯美', title: '唯美美女_清纯唯美美女图片_超高清唯美美女写真', keyword: '唯美美女图片,天然唯美,乡村唯美,清纯唯美美女,唯美美女写真', desc: '阿顺美图整理的唯美美女图片,天然唯美,乡村唯美,清纯唯美美女,唯美美女写真'},
    {url: '/t/qingxin/', type: 'qingxin', name: '清新', title: '清新美女_唯美清新美女图_超高清清新小美女图片', keyword: '清新美女,清新小美女图,清新美女图片', desc: '阿顺美图整理的清新美女图片都是超高清的套图，唯美贴近自然的清新小美女'}
];
var xingwenMenus = [
    {url: '/all', type: 'all', name: '全部分类', title: '星闻_日韩星闻_港台星闻_内地星闻', keyword: '写真,最新新闻,娱乐资讯,明星资料,资料,个人资料,高清写真,生活照,剧照,主要作品,主演电影,主演电视', desc: '情趣综合平台为大家提供,明星娱乐八卦新闻,明星绯闻,影视资讯,音乐资讯,八卦爆料,娱乐视频等'},
    {url: '/news/index?type=hdxz&p=', type: 'huodong', name: '活动', title: '活动现场', keyword: '最新新闻活动,娱乐资讯活动,生活照活动,剧照活动,主要作品活动,电影电视活动', desc: '情趣综合平台为大家提供,明星娱乐八卦活动,明星绯闻活动,影视资讯活动,音乐资讯活动,爆料、娱乐视频、等活动'},//35
    {url: '/news/index?type=fwbg&p=', type: 'feiwen', name: '绯闻', title: '绯闻八卦', keyword: '最新绯闻八卦,娱乐资讯绯闻八卦,高清写真绯闻八卦,生活照、剧照绯闻八卦,电影、电视绯闻八卦', desc: '情趣综合平台为大家提供,明星娱乐绯闻八卦,影视、音乐绯闻八卦'},//30
    {url: '/news/index?type=tupian&p=', type: 'tupian', name: '图片', title: '星图娱乐圈', keyword: '最新星图,星图资讯,星图资料,星图写真,生活星图', desc: '情趣综合平台为大家提供,港台星图,内地星图,其他星图解说'},//60
    {url: '/news/index?type=baoliaotai&p=', type: 'baoliaotai', name: '爆料台', title: '爆料星闻台', keyword: '最新爆料,娱乐爆料,明星爆料,高清爆料写真,生活照、剧照爆料', desc: '情趣综合平台为大家提供,明星爆料,爆料明星绯闻,爆料影视资讯,音乐爆料资讯等'},//10
    {url: '/news/index?type=zyxw&p=', type: 'zongyi', name: '综艺', title: '综艺星闻资源', keyword: '最新综艺,娱乐综艺,综艺高清写真,主演电影、主演电视综艺', desc: '情趣综合平台为大家提供,明星综艺新闻,影视、音乐,娱乐综艺信息'},
    {url: '/news/index?type=dsxw&p=', type: 'dianshi', name: '电视', title: '电视星闻', keyword: '最新电视,高清星闻电视,主要作品、主演电视', desc: '情趣综合平台为大家提供,明星电视,明星绯闻电视,最新电视资讯'},//21
    {url: '/news/index?type=dyxw&p=', type: 'dianying', name: '电影', title: '电影星闻', keyword: '最新电影咨询,明星电影资料,主要电影作品,电影主演,电影角色', desc: '情趣综合平台为大家提供,电影资讯信息,电影上映,电影演员,电影情况,线下电影星闻情况'},//34
    {url: '/news/index?type=yyxw&p=', type: 'yinyue', name: '音乐', title: '音乐星闻', keyword: '最新明星音乐,娱乐音乐,高清音乐写真,生活音乐照,音乐主要作品', desc: '情趣综合平台为大家提供,音乐新闻,明星绯闻,2019音乐,音乐媒体相关等资讯'},//20
    {url: '/news/index?type=mxdt&p=', type: 'dongtai', name: '动态', title: '星闻动态', keyword: '动态更新,娱乐动态,明星动态,高清写真动态,生活动态,主要作品动态、主演电影动态、主演电视动态', desc: '情趣综合平台为大家提供,明星娱乐八卦动态,绯闻动态,动态影视资讯,音乐动态资讯,八卦爆料、娱乐视频等动态更新情况'},//67
];
var childMenus = {
    meitu: meituMenus,
    xingwen: xingwenMenus
}

function filterTitle(items) {
    var substr = '';
    for (var i = 0; i < items.length; i++) {
        substr = items[i].title.match(/\[(\S*)\]/);
        if (substr && substr[0]) {
            items[i].title = items[i].title.replace(substr[0], '');
        }
    }
    return items;
}
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

    next();
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
router.get('/aboutUs', function(req, res) {
    var listObj = {
        domain: domain,
        terminal: req.terminal
    }
    res.render('about_us', listObj);
})

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