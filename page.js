function getPage(total, currentPage, url, search) {
    var totalPage = 0;//总页数
    var pageSize = 20;//每页显示行数
    // var pageUrl = url+'/';
    var pageSearch = search ? '?search='+search : '';
    //总共分几页
    if(total/pageSize > parseInt(total/pageSize)){
        totalPage=parseInt(total/pageSize)+1;
    }else{
        totalPage=parseInt(total/pageSize);
    }
    var tempStr = "<span>共"+totalPage+"页</span>";
    if(currentPage>1){
        tempStr += "<a href="+ url + '/' + pageSearch + ">首页</a>";
        tempStr += "<a href="+ url + '/page/' + (currentPage-1) + '/' + pageSearch +">上一页</a>"
    }else{
        tempStr += "<span class='btn'>首页</span>";
        tempStr += "<span class='btn'>上一页</span>";
    }

    if (currentPage > 5 && currentPage < (totalPage -5)) {
        for(var pageIndex= currentPage - 5; pageIndex<currentPage+5;pageIndex++){
            tempStr += "<a class='"+ (pageIndex=== currentPage? 'active' : '') +"' href="+ url + '/page/' + pageIndex + '/' + pageSearch +">"+ pageIndex +"</a>";
        }
    } else if (currentPage > (totalPage -5) && totalPage >= 10){
        for(var pageIndex= (totalPage - 9); pageIndex < totalPage+1;pageIndex++){
            tempStr += "<a class='"+ (pageIndex=== currentPage? 'active' : '') +"' href="+ url + '/page/' + pageIndex + '/' + pageSearch +">"+ pageIndex +"</a>";
        }
    } else if (currentPage <= 5 && totalPage > 10) {
        for(var pageIndex= 1; pageIndex <= 10;pageIndex++){
            tempStr += "<a class='"+ (pageIndex=== currentPage? 'active' : '') +"' href="+ url + '/page/' + pageIndex + '/' + pageSearch +">"+ pageIndex +"</a>";
        }
    } else {
        for(var pageIndex= 1; pageIndex <= totalPage;pageIndex++){
            tempStr += "<a class='"+ (pageIndex=== currentPage? 'active' : '') +"' href="+ url + '/page/' + pageIndex + '/' + pageSearch +">"+ pageIndex +"</a>";
        }
    }

    if(currentPage<totalPage){
        tempStr += "<a href="+ url + '/page/' + (currentPage+1) + '/' + pageSearch +">下一页</a>";
        tempStr += "<a href="+ url + '/page/' + totalPage + '/' + pageSearch +">尾页</a>";
    }else{
        tempStr += "<span class='btn'>下一页</span>";
        tempStr += "<span class='btn'>尾页</span>";
    }

    return tempStr.replace(/page\/1\//g, '');
}

module.exports = getPage;