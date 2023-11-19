const THE_BILIBILI_VIDEO_URL = "https://www.bilibili.com/video"

var myPageObserver = null;

function getVideoIdFromLink(s) {
    // 定义匹配 BV 号的正则表达式
    const regex = /\/video\/(BV[0-9a-zA-Z]{10})/;
    let userId = null;

    if (s && s.match(regex)) {
        return s.match(regex)[1];
    }
    return userId;
}
/*
function markPopularPage() {
    // 遍历所有类名为 "video-card" 的元素
    for (let el of document.getElementsByClassName("video-card")) {
        // 获取视频数据的 owner.mid 值
        let mid = el.__vue__.videoData.owner.mid;
        // 如果 mid 存在
        if (mid) {
            // 设置类名为 "up-name__text" 的元素的属性 "bliVideoInfo-videoId" 为 mid
            el.getElementsByClassName("up-name__text")[0].setAttribute("bliVideoInfo-videoId", mid);
        }
    }
}

// 标签动态页面函数
function markDynamicPage() {
    // 遍历所有的 class 名为 'bili-dyn-item' 的元素
    for (let el of document.getElementsByClassName("bili-dyn-item")) {
        // 获取 author 的 mid
        let mid = el.__vue__.author.mid;
        if (mid) {
            // 如果 mid 存在，将 mid 设置为属性 'bliVideoInfo-videoId' 的值
            el.getElementsByClassName("bili-dyn-item__avatar")[0].setAttribute("bliVideoInfo-videoId", mid);
        }
    }

    // 遍历所有的 class 名为 'bili-dyn-title' 的元素
    for (let el of document.getElementsByClassName("bili-dyn-title")) {
        // 获取 author 的 mid
        let mid = el.__vue__.author.mid;
        if (mid) {
            // 如果 mid 存在，将 mid 设置为属性 'bliVideoInfo-videoId' 的值
            el.getElementsByClassName("bili-dyn-title__text")[0].setAttribute("bliVideoInfo-videoId", mid);
        }
    }

    // 遍历所有的 class 名为 'bili-dyn-up-list' 的元素
    for (let el of document.getElementsByClassName("bili-dyn-up-list")) {
        // 获取 upList
        let upList = el.__vue__.list;
        // 获取 class 名为 'bili-dyn-up-list__item' 的元素
        let upElements = el.getElementsByClassName("bili-dyn-up-list__item");
        // 遍历 upList
        for (let idx = 0; idx < upList.length; idx++) {
            // 正常情况下，第一个元素是 "all"，所以我们从第二个元素开始
            let up = upElements[idx + 1];
            // 将 up 的 mid 设置为属性 'bliVideoInfo-videoId' 的值
            up.setAttribute("bliVideoInfo-videoId", upList[idx].mid);
        }
    }

    // 遍历 className 数组
    for (let className of ["user-name", "root-reply-avatar", "sub-user-name", "sub-reply-avatar"]) {
        // 遍历所有 class 名为当前 className 的元素
        for (let el of document.getElementsByClassName(className)) {
            // 获取 data-user-id 属性的值
            let mid = el.getAttribute("data-user-id");
            if (mid) {
                // 如果 mid 存在，将 mid 设置为属性 'bliVideoInfo-videoId' 的值
                el.setAttribute("bliVideoInfo-videoId", mid);
            }
        }
    }
}
*/

/**
 * 标签视频页面
 */
/*
function markVideoPage() {
    // 遍历选中的元素集合
    for (let el of document.querySelectorAll(".user-name,.root-reply-avatar,.sub-user-name,.sub-reply-avatar")) {
        // 获取元素的data-user-id属性的值
        let mid = el.getAttribute("data-user-id");
        // 如果属性值存在，则设置bliVideoInfo-videoId属性为该值
        if (mid) {
            el.setAttribute("bliVideoInfo-videoId", mid);
        }
    }
}
*/
// 标签链接函数

function markLinks() {
    // 遍历所有的a标签
    for (let el of document.getElementsByTagName("a")) {
        // 判断链接是否以BILIBILI_VIDEO_URL开头
        if (el.href.startsWith(THE_BILIBILI_VIDEO_URL)) {
            // 从链接中获取视频ID
            let videoId = getVideoIdFromLink(el.href);
            // 如果成功获取到视频ID，则设置属性bliVideoInfo-videoId为视频ID
            if (videoId) {
                el.setAttribute("bliVideoInfo-videoId", videoId);
            }
        } /*else if (el.classList.contains("jump-link")) {
            // 从链接的data-user-id属性中获取用户ID
            let userId = el.getAttribute("data-user-id");
            // 如果成功获取到用户ID，则设置属性bliVideoInfo-videoId为用户ID
            if (userId) {
                el.setAttribute("bliVideoInfo-videoId", userId);
            }
        }*/
    }
}

// 安装钩子函数
function installMyHooks() {
    // 创建一个MutationObserver对象，用于观察DOM的变化
    myPageObserver = new MutationObserver((mutationList, observer) => {
        // 调用labelLinks函数对标签链接进行处理
        markLinks();
        /*
        // 如果当前页面链接以BILIBILI_POPULAR_URL开头，则调用labelPopularPage函数对热门页面进行处理
        if (window.location.href.startsWith(BILIBILI_POPULAR_URL)) {
            markPopularPage();
        } 
        // 如果当前页面链接以BILIBILI_DYNAMIC_URL开头，则调用labelDynamicPage函数对动态页面进行处理
        else if (window.location.href.startsWith(BILIBILI_DYNAMIC_URL)) {
            markDynamicPage();
        }
        // 如果当前页面链接以BILIBILI_VIDEO_URL开头，则调用labelVideoPage函数对视频页面进行处理
        else if (window.location.href.startsWith(BILIBILI_VIDEO_URL)) {
            markVideoPage();
        }
        */
    })

    // 监听document.body元素及其子元素的变化
    myPageObserver.observe(document.body, {
        childList: true,
        subtree: true,
    })
}

installMyHooks()
