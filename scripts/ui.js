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

        // this.el.innerHTML = getVideoCard()
        /*
        this.el.addEventListener("transitionend", () => {
            this.updateCursor(this.cursorX, this.cursorY);
            console.log("updateCursor", this.cursorX, this.cursorY);
        });
        */

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
     * 
     * @param {DOMRect} targetDOMRect DOMRect对象
     */
    updateCursor(targetDOMRect) {
        // 计算元素B的新位置
        // 假设你想让元素B位于元素A的下方，这只是一个示例，你可能需要根据具体情况调整位置计算
        const newTop = targetDOMRect.bottom + this.el.scrollHeight / 2 + window.scrollY  + 10; // 10是用来添加一些间距的示例值
        const newLeft = targetDOMRect.right + 200 + window.scrollX;

        // 更新元素B的位置
        this.el.style.top = `${newTop}px`;
        this.el.style.left = `${newLeft}px`;

        // 避免元素B超出屏幕可视区域
        const viewportHeight = window.innerHeight + window.scrollY;
        const viewportWidth = window.innerWidth;

        // 检查是否超出屏幕高度和宽度
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