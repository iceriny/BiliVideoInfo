const url = 'https://api.bilibili.com/x/web-interface/view';

// 使用 async/await 来获取 wbi_keys
async function handleInfoWithWbi(targetInfo, toWhat = "") {

    // 构建请求参数
    const params = {
        bvid: (toWhat == 'share') ? targetInfo : targetInfo.videoId
        // 或者 aid: 1234567
    };

    try {
        const wbiKeys = await new Promise((resolve, reject) => {
            chrome.storage.sync.get(['wbi_keys'], (result) => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                } else {
                    resolve(result.wbi_keys);
                }
            });
        });
        // 为参数进行 Wbi 签名
        const signedParams = encWbi(params, wbiKeys.img_key, wbiKeys.sub_key);
        // 构建请求 URL
        const requestURL = `https://api.bilibili.com/x/web-interface/view/detail?${signedParams}`;
        try {
            // 发送请求
            const response = await fetch(requestURL, {
                method: 'GET',
                credentials: 'include', // 认证方式：Cookie(SESSDATA)
            });

            if (!response.ok) {
                throw new Error(`请求失败：${response.status}`);
            } else {
                const videoInfo = await response.json();
                // 视频信息处理:
                const videoCardInfo = {
                    url: `www.bilibili.com/video/${params.bvid}`,//链接
                    title: videoInfo.data.View.title,//标题
                    desc: videoInfo.data.View.desc,//简介
                    tags: videoInfo.data.Tags.map(item =>
                        item.tag_name),//标签
                    viewCount: videoInfo.data.View.stat.view,//播放量
                    danmakuCount: videoInfo.data.View.stat.danmaku,//弹幕数
                    likeCount: videoInfo.data.View.stat.like,//点赞量
                    coinCount: videoInfo.data.View.stat.coin,//硬币数
                    favCount: videoInfo.data.View.stat.favorite,//收藏量
                    shareCount: videoInfo.data.View.stat.share,//分享量
                    type: VIDEO_TYPE_MAP[`${videoInfo.data.View.tid}`]//视频类型
                }
                if (videoProfileCard && toWhat == '') {
                    //videoProfileCard.
                    const dataObj = {
                        videoCardInfo: videoCardInfo,
                        targetDOMRect: targetInfo.targetDOMRect
                    }
                    console.log(videoProfileCard)
                    videoProfileCard.update(dataObj)
                }
                //分享按钮更新
                if (shareButton && toWhat == 'share') {
                    await shareButton.update(videoCardInfo, ShareButton.copyToClipboard);
                }
            }
            //});
        } catch (error) {
            console.log('发生错误:', error);
        }
    } catch (error) {
        console.error('从chrome.storage获取发生错误:', error);
    }
}


function getVideoUrl() {
    var currentURL = window.location.href;
    return currentURL.split('?')[0];
}

async function callShareButton() {
    if (shareButton) {
        let currentURL = getVideoUrl();
        let bvid = getVideoIdFromLink(currentURL);

        await handleInfoWithWbi(bvid, "share");
    }
}
/**
 * 从视频链接中获取视频的 BV 号
 * @param {string} s - 视频链接
 * @returns {string} - 匹配到的视频的 BV 号，如果没有匹配到则返回 null
 */
function getVideoIdFromLink(s) {
    // 定义匹配 BV 号的正则表达式
    const regex = /\/video\/(BV[0-9a-zA-Z]{10})/;
    let bvid = null;

    if (s && s.match(regex)) {
        return s.match(regex)[1];
    }
    return bvid;
}

function getVideoTarget(target) {
    // 获取目标节点
    let maxDepth = 5; // 定义最大深度为5
    videoLink = target; // 将传入的参数作为初始节点
    while (videoLink && maxDepth-- >= 0 && videoLink.getAttribute) {
        // 循环遍历节点，直到节点为空或达到最大深度，且节点存在getAttribute方法
        if (videoLink.getAttribute("bliVideoInfo-videoId")) {
            // 如果节点具有属性"bliVideoInfo-videoId"，则返回该节点
            return videoLink;
        }
        videoLink = videoLink.parentNode; // 将节点的父节点赋值给userLink
    }

    return null; // 如果未找到符合条件的节点，则返回空
}
let hoverTimer;
function showVideoInfo(event) {
    // 清除之前的定时器
    clearTimeout(hoverTimer);
    // 设置新的定时器，在1秒后调用函数
    hoverTimer = setTimeout(async () => {
        let target = getVideoTarget(event.target);
        if (target) {
            let videoId = target.getAttribute("bliVideoInfo-videoId");
            let targetDOMRect = target.getBoundingClientRect()
            let targetInfo = {
                videoId: videoId,
                targetDOMRect: targetDOMRect
            }

            //对target注册鼠标离开事
            target.addEventListener("mouseout", function () {
                // 取消注册事件
                target.removeEventListener("mouseout", arguments.callee);
                // 调用禁用函数
                videoProfileCard.disable();
            });

            await handleInfoWithWbi(targetInfo);
        }
    }, 800); // 设置0.8秒延迟
}


// 加载网站脚本来为用户链接添加标签
window.addEventListener("load", function () {
    //向ShareButton发送消息
    //setTimeout(callShareButton, 4000)
    // 当鼠标悬停在文档上时，调用showVideoInfo函数
    document.addEventListener("mouseover", showVideoInfo);


    // 创建一个<script>元素
    var s = document.createElement('script');
    // 设置<script>元素的src属性为chrome.runtime.getURL('scripts/markScript.js')
    s.src = chrome.runtime.getURL('scripts/markScript.js');
    // 当<script>元素加载完成后，移除该元素
    s.onload = function () { this.remove(); };
    // 将<script>元素添加到文档头部或文档文档根元素中
    (document.head || document.documentElement).appendChild(s);
});