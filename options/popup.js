

document.addEventListener('DOMContentLoaded', function () {
    // 在 DOMContentLoaded 事件触发后执行代码
    const isDebugCheckbox = document.getElementById("isDebug");
    const delayTimeBtn = document.getElementById("saveBtn"); // 保存按钮
    const delayTimeLabel = document.getElementById("delayTimeLabel"); // 延迟时间标签
    const delayTimeTextBox = document.getElementById("delayTime"); // 延迟时间文本框


    let isDebug;
    let delayTime;
    // 获取当前值
    chrome.storage.sync.get(['KeyForIsDebug', 'KeyForDelayTime'], function (result) {
        delayTime = result.KeyForDelayTime !== null && result.KeyForDelayTime !== undefined
            ? result.KeyForDelayTime
            : 100;
        isDebug = result.KeyForIsDebug !== null && result.KeyForIsDebug !== undefined
            ? result.KeyForIsDebug
            : false;
        isDebugCheckbox.checked = isDebug;
        delayTimeLabel.innerHTML = `延迟时间(ms)<当前:${delayTime}>`;
    });

    // 监听消息，在content脚本中分别在加载页面、修改isDebug值、修改delayTime值时触发
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        // 处理接收到的消息
        myDebug('收到来自内容脚本的消息：');
        myDebug(request);
        isDebug = request.KeyForIsDebug;
        delayTime = request.KeyForDelayTime;
        delayTimeLabel.innerHTML = `延迟时间(ms)<当前:${delayTime}>`;
    });

    // 注册调试模式UI事件监听器
    isDebugCheckbox.addEventListener("change", function (event) {
        if (this.checked) {
            isDebug = true;
            sendMessageToActiveTab({ isDebug: true });
        } else {
            isDebug = false;
            sendMessageToActiveTab({ isDebug: false });
        }
    });

    // 注册延迟时间UI事件监听器
    delayTimeBtn.addEventListener("click", () => {
        sendDelayTime(); // 向content脚本发送延迟时间
    });
    delayTimeTextBox.addEventListener("keyup", (event) => {
        myDebug(event.key);
        if (event.key === 'Enter') {
            sendDelayTime();// 向content脚本发送延迟时间
            delayTimeTextBox.blur();
        }
    });
    delayTimeTextBox.addEventListener("focus", (event) => {
        delayTimeLabel.innerHTML = `当前延迟: ${delayTime}`;
    });
    delayTimeTextBox.addEventListener("blur", (event) => {
        delayTimeLabel.innerHTML = `延迟时间(ms)<当前:${delayTime}>`;
    });


});
function sendDelayTime() {
    const delayTimeTextBox = document.getElementById("delayTime");
    myDebug(delayTimeTextBox.value);
    const _delayTime = delayTimeTextBox.valueAsNumber;
    if (_delayTime.valueAsNumber != NaN) {
        sendMessageToActiveTab({ haveDelayTime: true, delayTime: _delayTime });
        delayTimeTextBox.value = '';
    }
}

// 发送消息到当前激活的标签页
function sendMessageToActiveTab(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, message);
        }
    });
}

function myDebug(msg) {
    if (isDebug) {
        console.log(msg);
    }
}