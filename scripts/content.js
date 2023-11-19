const url = 'https://api.bilibili.com/x/web-interface/view';

const cookies = {
    SESSDATA: 'your_sessdata_here'  // 替换为你的 SESSDATA，即登录状态的 Cookie
};

// 构建请求头，将 Cookie 加入其中
const headers = new Headers();
headers.append('Cookie', `SESSDATA=${cookies.SESSDATA}`);

async function getVideoInfo(params_bvid) {
    let params = {
        bvid: params_bvid
    };
    let queryParams = new URLSearchParams(params);

    try {
        const response = await fetch(`${url}?${queryParams}`, { headers });

        if (!response.ok) {
            throw new Error(`请求失败：${response.status}`);
        }

        const videoInfo = await response.json();
        return videoInfo; // 返回视频信息
    } catch (error) {
        console.error('发生错误:', error);
        return null; // 或者返回其他你认为合适的默认值
    }
}

// 使用 async/await 来获取 wbi_keys
async function handleInfoWithWbi(params_bvid) {
    try {
        // 构建请求参数
        const params = {
            bvid: params_bvid
            // 或者 aid: 1234567
        };

        // 从 Chrome Storage 中获取数据
        chrome.storage.sync.get(['wbi_keys'], async result => {
            const wbiKeys = result.wbi_keys;
            //console.log(wbiKeys); // 确认获取到数据

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
                }

                const videoInfo = await response.json();
                const videoCardInfo = {
                    title: videoInfo.data.View.title,
                    desc: videoInfo.data.View.desc,
                    tags: videoInfo.data.Tags.map(item =>
                        item.tag_name),
                    viewCount: videoInfo.data.View.stat.view,
                    likeCount: videoInfo.data.View.stat.like,
                    coinCount: videoInfo.data.View.stat.coin,
                    favoriteCount: videoInfo.data.View.stat.favorite,
                    shareCount: videoInfo.data.View.stat.share,
                    his_rank: videoInfo.data.View.stat.his_rank,
                    type: VIDEO_TYPE_MAP[`${videoInfo.data.View.tid}`]
                }
                
                //videoProfileCard.
                // 视频信息处理:



            } catch (error) {
                console.error('发生错误:', error);
            }
        });
    } catch (error) {
        console.error('发生错误:', error);
    }
}


function getVideoCard(videoCardInfo) {

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

function showVideoInfo(event) {
    let target = getVideoTarget(event.target);
    if (target) {
        let videoId = target.getAttribute("bliVideoInfo-videoId");

        handleInfoWithWbi(videoId);
    }

}


// 加载网站脚本来为用户链接添加标签
window.addEventListener("load", function () {
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