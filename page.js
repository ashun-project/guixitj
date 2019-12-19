function getPage(total, currentPage, url, search) {
    var totalPage = 0;//总页数
    var pageSize = 12;//每页显示行数
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
        tempStr += "<a href="+ url + '/' + replayOne(currentPage-1) +">上一页</a>"
    }else{
        tempStr += "<span class='btn'>首页</span>";
        tempStr += "<span class='btn'>上一页</span>";
    }

    if (currentPage > 5 && currentPage < (totalPage -5)) {
        for(var pageIndex= currentPage - 5; pageIndex<currentPage+5;pageIndex++){
            tempStr += "<a class='"+ (pageIndex=== currentPage? 'active' : '') +"' href="+ url + '/' + replayOne(pageIndex) +">"+ pageIndex +"</a>";
        }
    } else if (currentPage > (totalPage -5) && totalPage >= 10){
        for(var pageIndex= (totalPage - 9); pageIndex < totalPage+1;pageIndex++){
            tempStr += "<a class='"+ (pageIndex=== currentPage? 'active' : '') +"' href="+ url + '/' + replayOne(pageIndex) +">"+ pageIndex +"</a>";
        }
    } else if (currentPage <= 5 && totalPage > 10) {
        for(var pageIndex= 1; pageIndex <= 10;pageIndex++){
            tempStr += "<a class='"+ (pageIndex=== currentPage? 'active' : '') +"' href="+ url + '/' + replayOne(pageIndex) +">"+ pageIndex +"</a>";
        }
    } else {
        for(var pageIndex= 1; pageIndex <= totalPage;pageIndex++){
            tempStr += "<a class='"+ (pageIndex=== currentPage? 'active' : '') +"' href="+ url + '/' + replayOne(pageIndex) +">"+ pageIndex +"</a>";
        }
    }

    if(currentPage<totalPage){
        tempStr += "<a href="+ url + '/' + replayOne(currentPage+1) +">下一页</a>";
        tempStr += "<a href="+ url + '/' + replayOne(totalPage) +">尾页</a>";
    }else{
        tempStr += "<span class='btn'>下一页</span>";
        tempStr += "<span class='btn'>尾页</span>";
    }
    function replayOne(num) {
        if (num == 1) {
            return '' + pageSearch;
        } else {
            return num + '/' + pageSearch;
        }
    }
    return tempStr;
}

module.exports = getPage;