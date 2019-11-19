var menuLi = document.querySelectorAll('.menu ul li a');
var bodyW = document.getElementsByTagName('body')[0].offsetWidth;
var menu = document.querySelector('.header .menu');
var mobileMenu = document.getElementById('mobile-menu');
var mask = document.querySelector('.mask');
var menuChild = document.querySelector('.menu-child');
var currentUrl = window.location.href;
if (bodyW > 600) {
    // menuLiEvent();
}
function menuLiEvent() {
    for(var i = 0; i < menuLi.length; i++) {
        menuLi[i].onmouseover = function() {
            doSomeThing(this.getAttribute('class'), 'show-menu');
        }
        menuLi[i].onmouseout = function () {
            doSomeThing(this.getAttribute('class'), '');
        }
    }
    function doSomeThing(parent, value){
        var childSelect = document.querySelector('.'+parent+'-child-menu');
        if (childSelect) {
            var cla = childSelect.getAttribute('class');
            if (cla.indexOf('active') <= -1) {
                childSelect.setAttribute('id', value);
            }
        }
    }
}
mobileMenu.addEventListener('click', function(){
    if (menu.getAttribute('id')) {
        hideMenu('','','');
    } else {
        hideMenu('show-ul', 'show-mask', 'show-menu-child');
    }
});
mask.addEventListener('click', function () {
    hideMenu('','','');
});
function hideMenu(showUl, showMask, showMenuChild) {
    menu.setAttribute('id', showUl);
    mask.setAttribute('id', showMask);
    menuChild.setAttribute('id', showMenuChild);
}
function goSearch () {
    var searchValue = document.getElementById("search-value").value;
    var type = '/meitu/search/';
    if (currentUrl.indexOf('xingwen') > -1) {
        type = '/xingwen/search/';
    }
    if(searchValue){
        window.location.href=type+searchValue.replace(/_/g,"&&")+"/";
    };
};
function getKeyup (e) {
    var event=e||window.event;
    if(event.keyCode=="13"){
        goSearch();
    }
}
