const url = 'https://api.bilibili.com/x/web-interface/view';
const settingItemsKeys = ['KeyForIsDebug', 'KeyForDelayTime']


let isDebug = false;
let delayTime = 500;

chrome.storage.sync.get(settingItemsKeys, function (result) {
    if (result.KeyForDelayTime) {
        delayTime = result.KeyForDelayTime;
    } else {
        delayTime = 500;
    }
    if (result.KeyForIsDebug) {
        isDebug = true;
    } else {
        isDebug = false;
    };
});

function myDebug(msg) {
    if (isDebug) {
        console.log(msg);
    }
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

function updateTargetInfo(target) {
    if (target) {
        let videoId = target.getAttribute("bliVideoInfo-videoId");
        let targetDOMRect = target.getBoundingClientRect()
        let targetInfo = {
            state: true,
            videoId: videoId,
            targetDOMRect: targetDOMRect
        }
        return targetInfo;
    }
    return null;
}

async function callAPI(targetInfo) {
    // 构建请求参数
    const params = {
        bvid: targetInfo.videoId
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
                return videoCardInfo;
            }
            //});
        } catch (error) {
            console.error('发生错误:', error);
        }
    } catch (error) {
        console.error('从chrome.storage获取发生错误:', error);
    }
}
let hoverTimer;
function showVideoInfo() {
    myDebug("开始显示视频信息");
    if (videoProfileCard) {
        myDebug("显示卡片");
        videoProfileCard.enable();
    }
}
/**
 * 卡片处理函数
 * 
 * @param {Event} event - 事件对象
 */
async function cardHandle(event) {
    let target = getVideoTarget(event.target); // 获取视频目标
    if (!target == true) {
        myDebug("目标未找到");
        return;
    }

    let isDisabled = false; // 标记是否已禁用

    // 对target注册鼠标离开事件
    target.addEventListener("mouseout", function () {
        // 取消注册事件
        target.removeEventListener("mouseout", arguments.callee);
        // 调用禁用函数
        videoProfileCard.disable();
        isDisabled = true;
        clearTimeout(hoverTimer);
        hoverTimer = null;
        myDebug("鼠标离开，取消计时器");
    });

    myDebug("找到目标，清理计时器，开始计时");
    clearTimeout(hoverTimer);
    let timerPromise = new Promise((resolve) => {
        hoverTimer = setTimeout(() => {
            resolve();
            myDebug("计时结束");
        }, delayTime);
    });

    const targetInfo = updateTargetInfo(target); // 更新目标信息
    if (targetInfo && hoverTimer) {
        await callAPI(targetInfo) // 调用API
            .then(async data => {
                if (data && videoProfileCard) {
                    const dataObj = {
                        videoCardInfo: data,
                        targetDOMRect: targetInfo.targetDOMRect
                    }
                    videoProfileCard.update(dataObj); // 更新卡片数据
                    myDebug(`更新卡片数据: ${dataObj}`);
                    await timerPromise;
                    if (!isDisabled) {
                        showVideoInfo(); // 显示视频信息
                    }
                }
            })
            .catch(error => {
                console.error('发生错误:', error);
            }
            )
    }
}

/**
 * 分享处理函数
 */
async function shareHandle() {
    if (shareButton) { // 如果存在分享按钮
        let currentURL = window.location.href.split('?')[0]; // 获取当前URL
        let bvid = getVideoIdFromLink(currentURL); // 获取视频ID

        await callAPI({ // 调用API
            videoId: bvid
        }).then(async data => { // 处理API返回的数据
            if (data && shareButton) { // 如果数据存在且分享按钮存在
                await shareButton.update(data); // 更新分享按钮
            }
        })
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

function updateStage() {
    chrome.runtime.sendMessage({ KeyForIsDebug: isDebug, KeyForDelayTime: delayTime });
    myDebug("信息传递...")
    chrome.storage.sync.set({ KeyForIsDebug: isDebug, KeyForDelayTime: delayTime }, function () {
        myDebug("信息储存:...")
    });
}
// 加载网站脚本来为用户链接添加标签
window.addEventListener("load", function () {
    updateStage();

    // 当鼠标悬停在文档上时，调用showVideoInfo函数
    document.addEventListener("mouseover", cardHandle);


    // 添加markScript.js来对网站元素进行标记处理
    // 创建一个<script>元素
    var s = document.createElement('script');
    // 设置<script>元素的src属性为chrome.runtime.getURL('scripts/markScript.js')
    s.src = chrome.runtime.getURL('scripts/markScript.js');
    // 当<script>元素加载完成后，移除该元素
    s.onload = function () { this.remove(); };
    // 将<script>元素添加到文档头部或文档文档根元素中
    (document.head || document.documentElement).appendChild(s);

    // 监听来自弹出式页面的消息
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.isDebug === true) {
            console.log("调试模式打开")
            isDebug = true;
            updateStage();
        };
        if (request.isDebug === false) {
            console.log("调试模式关闭")
            isDebug = false;
            updateStage();
        };
        if (request.haveDelayTime) {
            delayTime = request.delayTime;
            myDebug(`request.delayTime: ${request.delayTime}\n延迟事件输入事件: ${delayTime}`)
            updateStage();
        }
    });
});