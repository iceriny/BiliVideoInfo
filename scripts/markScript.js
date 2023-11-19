const THE_BILIBILI_VIDEO_URL = "https://www.bilibili.com/video"

var myPageObserver = null;

/**
 * 从视频链接中获取视频的 BV 号
 * @param {string} s - 视频链接
 * @returns {string} - 匹配到的视频的 BV 号，如果没有匹配到则返回 null
 */
function getVideoIdFromLink(s) {
    // 定义匹配 BV 号的正则表达式
    const regex = /\/video\/(BV[0-9a-zA-Z]{10})/;
    let userId = null;

    if (s && s.match(regex)) {
        return s.match(regex)[1];
    }
    return userId;
}
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
        }
    }
}

// 安装钩子函数
function installMyHooks() {
    // 创建一个MutationObserver对象，用于观察DOM的变化
    myPageObserver = new MutationObserver((mutationList, observer) => {
        // 调用labelLinks函数对标签链接进行处理
        markLinks();
    })

    // 监听document.body元素及其子元素的变化
    myPageObserver.observe(document.body, {
        childList: true,
        subtree: true,
    })
}

installMyHooks()
