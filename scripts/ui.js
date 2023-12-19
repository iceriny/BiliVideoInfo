function getVideoCard(videoData) {
    return `
    <div id="biliVideoCard">
    <div id="video-card">
        <div id="card-title">
            <div id="type" ><span>#</span>${videoData.type}</div>
            <div id="title">${videoData.title}</div>
            <div id="desc">${videoData.desc}</div>
        </div>
        <div id="card-content">
            <div id="tag-list">
            ${getVideoTagsDiv(videoData.tags)}
            </div>
            <div id="card-content-bottom">
            <div id="view" class="card-content-bottom-detail">播放量：${videoData.viewCount}</div>
            <div id="danmaku" class="card-content-bottom-detail">弹幕数：${videoData.danmakuCount}</div>
            <div id="like" class="card-content-bottom-detail">点赞数：${videoData.likeCount}</div>
            <div id="coin" class="card-content-bottom-detail">硬币数：${videoData.coinCount}</div>
            <div id="favorite" class="card-content-bottom-detail">收藏数：${videoData.favCount}</div>
            <div id="share" class="card-content-bottom-detail">分享量：${videoData.shareCount}</div>
            </div>
        </div>
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
        this.el.style.zIndex = 1013

        this.el.classList.add('none-display')

        document.body.appendChild(this.el);

        this.disable();
    }

    disable() {
        this.enabled = false;
        if (this.el) {
            this.enabled = false;
            this.el.classList.remove('flex-display')
            this.el.classList.add('none-display')
        }
    }

    enable() {
        if (!this.enabled) {
            this.enabled = true;
            this.el.classList.remove('none-display')
            this.el.classList.add('flex-display')
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


    update(dataObj) {
        //this.enable()
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