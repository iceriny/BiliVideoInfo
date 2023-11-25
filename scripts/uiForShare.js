var shareButton = null;
var titleObserver = null;


class ShareButton {
    constructor() {
        this.getCount = 0;

        this.data = {};
        this.target = document.body;
        this.shareText = '';
        this.el = document.createElement("button");
        this.el.id = 'biliSimple-share-button';
        this.el.type = 'button';
        this.el.innerText = '分享';
        this.el.onclick = async () => {
            await this.Click();
        }

        //let videoInfoDetail = document.getElementById("arc_toolbar_report");

        //this.addShareButton();
    }

    addShareButton() {
        this.target.appendChild(this.el);
    }

    async update(data, callback = null) {
        this.data = data;
        await this.formatVideoData();
        this.shareText =
            `${this.data.title}\n类型：${this.data.type}\n简介：${this.data.desc}\n标签: ${this.getTagsText()}
\n播放量：${this.data.viewCount}  硬币数：${this.data.coinCount}\n弹幕数：${this.data.danmakuCount}  收藏数：${this.data.favCount}\n点赞数：${this.data.likeCount}  分享量：${this.data.shareCount}
\n分享链接：${this.data.url}`;

        if (typeof callback === 'function') {
            await callback();
        }
    }
    /*
    upDataTarget = () => {
        this.getCount++;
        let videoInfoDetail = document.getElementById("viewbox_report");

        if (videoInfoDetail) {
            videoInfoDetail = videoInfoDetail.getElementsByClassName('video-title');
            if (videoInfoDetail.length > 0) {
                this.target = videoInfoDetail[0];
                this.addShareButton();
                //callShareButton();
            }
        }
        if (videoInfoDetail || this.getCount >= 10) {
            this.getCount = 0;

            clearInterval(intervalId);
        }
    }
    */

    getTagsText() {
        let tags = this.data.tags;
        let tagsText = "";
        for (let i = 0; i < tags.length; i++) {
            tagsText += tags[i] + " ";
        }
        return tagsText;
    }

    async Click() {
        try {
            await callShareButton();
        } catch (err) {
            await navigator.clipboard.writeText(`uiForShare.js => Click() => ${err}\nhttps://github.com/iceriny/BiliVideoInfo/issues`);
            this.popUps(`复制到剪贴板时出错${err}\n请联系作者，联系地址与错误信息已经已复制到剪切板`, 2000);
        }
    }

    async copyToClipboard() {
        if (this.shareText !== '') {
            await navigator.clipboard.writeText(this.shareText);
            this.popUps('文本已成功复制到剪贴板', 2000);
        } else {
            this.popUps('未获取到分享信息', 2000);
        }
    }

    async formatVideoData() {
        const videoDataKeys = ['viewCount', 'danmakuCount', 'likeCount', 'coinCount', 'favCount', 'shareCount'];

        let maxLength = 0;
        for (const key of videoDataKeys) {
            const stringValue =await this.data[key].toString();
            maxLength = Math.max(maxLength, stringValue.length);
        }

        for (const key of videoDataKeys) {
            this.data[key] =await this.data[key].toString().padStart(maxLength, " ");
        }
    }

    popUps(text, delay) {
        const showPopup = () => {
            pop.style.display = "flex";
            setTimeout(() => {
                pop.style.display = "none";
            }, delay);
        };

        let pop = document.getElementById("biliSimple-share-button-pop");
        if (!pop) {
            pop = document.createElement("div");
            pop.id = "biliSimple-share-pop";
            pop.innerText = text;
            document.body.appendChild(pop);
        }

        showPopup();
    }
}



function setTitleObserver() {
    // 创建一个MutationObserver对象，用于观察DOM的变化
    titleObserver = new MutationObserver((mutationList, observer) => {
        // 调用labelLinks函数对标签链接进行处理
        shareButton.upDataTarget();
    });

    // 监听document.body元素及其子元素的变化
    titleObserver.observe(document.body, {
        childList: true,
        subtree: true,
    })
}

let intervalId = null;
window.addEventListener("load", function () {
    shareButton = new ShareButton();
    if (shareButton) {
        //shareButton.upDataTarget();
        shareButton.addShareButton();
    }
});