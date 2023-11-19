function getVideoCard(videoData) {
    return `
    <div id="biliVideoCard">
        <div id="card-title">
            <div id="title">${videoData.title}</div>
            <div id="desc">${videoData.desc}</div>
        </div>
        <div id="card-content">
            <div id="tag-list">
                ${getVideoTagsDiv(videoData.tags)}
            </div>
            <div id="card-content-bottom">
                <div id="view" class="card-content-bottom-detail">播放量：${videoData.viewCount}</div>
                <div id="danmaku" class="card-content-bottom-detail">弹幕量：${videoData.danmakuCount}</div>
                <div id="like" class="card-content-bottom-detail">点赞量：${videoData.likeCount}</div>
                <div id="coin" class="card-content-bottom-detail">硬币量：${videoData.coinCount}</div>
                <div id="favorite" class="card-content-bottom-detail">收藏数：${videoData.favoriteCount}</div>
                <div id="share" class="card-content-bottom-detail">分享数：${videoData.shareCount}</div>
            </div>
            <div id="type" >${videoData.type}</div>
        </div>
    </div>
    `
}
/**
 * 获取视频标签的div元素
 * 
 * @param {Array} tagsList - 标签列表
 * @returns {string} - div元素的HTML字符串
 */
function getVideoTagsDiv(tagsList) {
    let tagsContent = ``;
    for (let i = 0; i < tagsList.length; i++) {
        tagsContent += `<div id="tag">${tagsList[i]}</div>`;
    }
    return tagsContent;
}

/**
 * 处理与储存VideoCard的类
 */
class VideoProfileCard {
    constructor() {
        this.data = {};
        this.cursorX = 0;
        this.cursorY = 0;
        this.enabled = false;
        this.cursorInside = false;

        this.el = document.createElement("div");
        this.el.style.position = "absolute";
        this.el.style.display = "none";
        this.el.style.zIndex = 1013

        document.body.appendChild(this.el);

        this.disable();
    }

    disable() {
        this.enabled = false;
        if (this.el) {
            this.el.style.display = "none";
        }
    }

    enable() {
        if (!this.enabled) {
            this.enabled = true;
            this.el.style.display = "flex";
        }
    }

    /**
     * 更新光标位置
     * @param {DOMRect} targetDOMRect - 目标DOM元素的矩形信息
     */
    updateCursor(targetDOMRect) {
        const newTop = targetDOMRect.bottom + this.el.scrollHeight / 2 + window.scrollY + 10;
        const newLeft = targetDOMRect.right + 200 + window.scrollX;

        this.el.style.top = `${newTop}px`;
        this.el.style.left = `${newLeft}px`;

        // 边界处理
        const viewportHeight = window.innerHeight + window.scrollY;
        const viewportWidth = window.innerWidth;

        if (newTop + this.el.scrollHeight > viewportHeight) {
            this.el.style.top = `${viewportHeight - this.el.scrollHeight - 20}px`;
        }

        if (newLeft + this.el.scrollWidth > viewportWidth) {
            this.el.style.left = `${viewportWidth - this.el.scrollWidth - 25}px`;
        }
    }


    upDate(dataObj) {
        this.enable()
        this.data = dataObj
        if (this.el) {
            this.el.innerHTML = getVideoCard(this.data.videoCardInfo)
            this.updateCursor(this.data.targetDOMRect)
        }

    }
}
var videoProfileCard = null;

window.addEventListener("load", function () {
    videoProfileCard = new VideoProfileCard();
});