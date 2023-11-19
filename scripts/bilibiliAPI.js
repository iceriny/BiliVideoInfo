const mixinKeyEncTab = [
    46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
    33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
    61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
    36, 20, 34, 44, 52
]

// 对 imgKey 和 subKey 进行字符顺序打乱编码
function getMixinKey(orig) {
    let temp = ''
    mixinKeyEncTab.forEach((n) => {
        temp += orig[n]
    })
    return temp.slice(0, 32)
}

// 为请求参数进行 wbi 签名
function encWbi(params, img_key, sub_key) {
    const mixin_key = getMixinKey(img_key + sub_key),
        curr_time = Math.round(Date.now() / 1000),
        chr_filter = /[!'()*]/g
    let query = []
    Object.assign(params, { wts: curr_time }) // 添加 wts 字段
    // 按照 key 重排参数
    Object.keys(params).sort().forEach((key) => {
        query.push(
            `${encodeURIComponent(key)}=${encodeURIComponent(
                // 过滤 value 中的 "!'()*" 字符
                params[key].toString().replace(chr_filter, '')
            )}`
        )
    })
    query = query.join('&')
    const wbi_sign = md5(query + mixin_key) // 计算 w_rid
    return query + '&w_rid=' + wbi_sign
}

// 获取最新的 img_key 和 sub_key
async function getWbiKeys() {
    try {
        const response = await fetch('https://api.bilibili.com/x/web-interface/nav');
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }

        const json_content = await response.json();
        const img_url = json_content.data.wbi_img.img_url;
        const sub_url = json_content.data.wbi_img.sub_url;

        return {
            img_key: img_url.slice(
                img_url.lastIndexOf('/') + 1,
                img_url.lastIndexOf('.')
            ),
            sub_key: sub_url.slice(
                sub_url.lastIndexOf('/') + 1,
                sub_url.lastIndexOf('.')
            )
        };
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

getWbiKeys().then((wbi_keys) => {
    const query = encWbi(
        {
            foo: '114',
            bar: '514',
            baz: 1919810
        },
        wbi_keys.img_key,
        wbi_keys.sub_key
    )
    console.log(query)
})


async function checkAndUpdateData() {
    const todayMidnight = getMidnightTimestamp(); // 获取今天0点的时间戳

    chrome.storage.sync.get('lastUpdate', async function(result) {
        const lastUpdateTimestamp = result.lastUpdate || 0;

        // 如果上次更新的时间早于今天0点，进行更新
        if (lastUpdateTimestamp < todayMidnight) {
            // 存储新数据到 chrome.storage.sync
            chrome.storage.sync.set({ wbi_keys: await getWbiKeys(), lastUpdate: getCurrentTimestamp() }, function() {
                console.log('数据已更新');
            });
        } else {
            console.log('今天已更新过数据');
        }
    });
}

function getMidnightTimestamp() {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0); // 设置为今天0点
    return Math.floor(midnight.getTime() / 1000); // 转换为时间戳（单位：秒）
}

function getCurrentTimestamp() {
    return Math.floor(Date.now() / 1000); // 获取当前时间戳（单位：秒）
}


checkAndUpdateData();