var shareButton = null;
var titleObserver = null;


class ShareButton {
    static shareText = ''
    constructor() {
        this.getCount = 0;

        this.data = {};
        this.target = document.body;
        // this.shareText = '';
        this.el = document.createElement("button");
        this.el.id = 'biliSimple-share-button';
        this.el.type = 'button';
        this.el.innerText = '分享';
        this.el.style.cssText = `
        left: -1vw;
        top: 18vh;`
        this.el.onclick = async () => {
            await this.Click();
        }

        //let videoInfoDetail = document.getElementById("arc_toolbar_report");

        //this.addShareButton();
    }

    addShareButton() {
        this.target.appendChild(this.el);
    }

    async update(data) {
        this.data = data;
        this.formatVideoData();
        ShareButton.shareText =
            `${this.data.title}\n类型：${this.data.type}\n简介：${this.data.desc}\n标签: ${this.getTagsText()}
\n播放量：${this.data.viewCount}  硬币数：${this.data.coinCount}\n弹幕数：${this.data.danmakuCount}  收藏数：${this.data.favCount}\n点赞数：${this.data.likeCount}  分享量：${this.data.shareCount}
\n分享链接：${this.data.url}`;
        await ShareButton.copyToClipboard();
    }
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
            await shareHandle();
        } catch (err) {
            await navigator.clipboard.writeText(`uiForShare.js => Click() => ${err}\nhttps://github.com/iceriny/BiliVideoInfo/issues`);
            ShareButton.popUps(`复制到剪贴板时出错${err}\n请联系作者，联系地址与错误信息已经已复制到剪切板`, 2000);
        }
    }

    static async copyToClipboard() {
        if (ShareButton.shareText !== '') {
            await navigator.clipboard.writeText(ShareButton.shareText);
            ShareButton.popUps('文本已成功复制到剪贴板', 2000);
        } else {
            ShareButton.popUps('未获取到分享信息', 2000);
        }
    }

    formatVideoData() {
        const videoDataKeys = ['viewCount', 'danmakuCount', 'likeCount', 'coinCount', 'favCount', 'shareCount'];

        let maxLength = 0;
        for (const key of videoDataKeys) {
            const stringValue = this.data[key].toString();
            maxLength = Math.max(maxLength, stringValue.length);
        }

        for (const key of videoDataKeys) {
            this.data[key] = this.data[key].toString().padStart(maxLength, " ");
        }
    }

    static popUps(text, delay) {
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
    let currentURL = window.location.href.split('?')[0];
    if (currentURL.startsWith('https://www.bilibili.com/video')) {
        shareButton = new ShareButton();
        if (shareButton) {
            //shareButton.upDataTarget();
            shareButton.addShareButton();
        }
    }
});