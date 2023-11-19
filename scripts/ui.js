function getVideoCard() {
    return `
    <div id="id-card"
    style="position: absolute; will-change: transform; top: 0px; left: 0px; transform: translate3d(438px, 473px, 0px); transition: transform 0.25s ease-in-out 0s;">
    显示点东西
</div>
    `
}

class VideoProfileCard {
    constructor() {
        this.el = document.createElement("div");
        this.el.style.position = "absolute";
        //this.el.style.display = "none";
        this.el.innerHTML = getVideoCard()
        console.log(this.el)
    }

    upDate() {

    }
}
var videoProfileCard = null;

window.addEventListener("load", function () {
    videoProfileCard = new VideoProfileCard();
});