var shareButton = null;

class ShareButton {
    constructor(videoInfoDetail) {
        this.data = {};
        this.el = document.createElement("button");
        this.el.id = 'biliSimple-share-button';
        this.el.type = 'button';
        this.el.innerText = '分享';
        this.el.onclick = () => {
            shareButton.Click();
        }

        //let videoInfoDetail = document.getElementById("arc_toolbar_report");

        videoInfoDetail[0].appendChild(this.el);
    }

    Update(data) {
        this.data = data;
    }

    getTagsText() {
        let tags = this.data.tags;
        console.log(this.data);
        let tagsText = "";
        for (let i = 0; i < tags.length; i++) {
            tagsText += tags[i] + " ";
        }
        return tagsText;
    }

    async Click() {
        this.formatVideoData();
        let shareText = `${this.data.title}
类型：${this.data.type}
简介：${this.data.desc}
标签: ${this.getTagsText()}
播放量：${this.data.viewCount}  硬币数：${this.data.coinCount}
弹幕数：${this.data.danmakuCount}  收藏数：${this.data.favCount}
点赞数：${this.data.likeCount}  分享量：${this.data.shareCount}
分享链接：${this.data.url}`;

        try {
            await navigator.clipboard.writeText(shareText);
            this.popUps('文本已成功复制到剪贴板');
        } catch (err) {
            this.popUps(`复制到剪贴板时出错${err}`);
        }
    }

    formatVideoData() {
        const videoDataKeys = ['viewCount', 'danmakuCount', 'likeCount', 'coinCount', 'favCount', 'shareCount'];
    
        let maxLength = 0;
        for (const key of videoDataKeys) {
            console.log(this.data)
            const stringValue = this.data[key].toString();
            maxLength = Math.max(maxLength, stringValue.length);
        }
    
        for (const key of videoDataKeys) {
            this.data[key] = this.data[key].toString().padStart(maxLength, " ");
        }
    }

    popUps(text) {
        const showPopup = () => {
            pop.style.display = "flex";
            setTimeout(() => {
                pop.style.display = "none";
            }, 2000);
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


window.addEventListener("load", function () {

    let hoverTimer = setTimeout(() => {
        let videoInfoDetail = document.getElementById("viewbox_report").getElementsByClassName('video-title');
        shareButton = new ShareButton(videoInfoDetail);
        console.log("\n创建按钮\n")
    }, 3000); // 设置1秒延迟
});
