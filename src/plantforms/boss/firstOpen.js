function _console() {
    if (process.env.NODE_ENV !== 'production') {
        console.log(...arguments)
    } else return;
}

let bossOfflineJobIds = [];

// 创建filter过滤招聘人在线的job
function createFilter() {
    _console('2. bfEle 不存在，执行添加');

    let newFilterNode = document.createElement('div');
    newFilterNode.innerHTML = `<div class="current-select">
        <span class="placeholder-text">招聘人在线</span>
    </div>`;
    newFilterNode.classList.add('condition-filter-select', '__boss_filter');

    // 绑定点击事件
    newFilterNode.addEventListener('click', function (e) {
        e.stopPropagation();

        let filterEle = e.currentTarget;
        let tmpEle;
        _console('5. click事件响应', bossOfflineJobIds);

        try {
            if (filterEle.classList.contains('is-select')) {
                bossOfflineJobIds.forEach(index => {
                    tmpEle = document.querySelector(`.job-card-wrapper[ka=search_list_${index}]`);
                    tmpEle.classList.remove('__boss_filter_result-hidden');
                });
                filterEle.classList.remove('is-select');
            } else {
                bossOfflineJobIds.forEach(index => {
                    tmpEle = document.querySelector(`.job-card-wrapper[ka=search_list_${index}]`);
                    tmpEle.classList.add('__boss_filter_result-hidden');
                });
                filterEle.classList.add('is-select');
            }
        } catch (error) {
            _console('筛选出错', error);
        }
    });

    // 插入到父元素 .search-condition-wrapper 最后一个元素之前
    let parentNode = document.querySelector('.search-condition-wrapper');
    
    if (parentNode !== null) {
        let lastChild = parentNode.lastChild;
        parentNode.insertBefore(newFilterNode, lastChild);
    } else {
        _console('3. parentNode 不存在，无法插入filter');
    }
}

function main() {
    const bfEle = document.querySelector('.__boss_filter.condition-filter-select');
    if (bfEle) {
        _console('1. bfEle 已经存在');
        // 先移除选中样式
        bfEle.classList.remove('is-select');
    } else {
        // 不存在则创建并添加到DOM树中
        try {
            createFilter();
        } catch (error) {
            _console('新增筛选出错', error);
        }
    }
}

_console('0.1 load firstOpen.js');
// 页面加载完成后执行
if (document.readyState === 'complete') {
    _console('0.2 页面readyState为complete');
    main();
} else {
    _console('0.3 页面readyState不为complete');
    window.addEventListener('load', main);
}

// 监听job-list-change事件，更新bossOfflineJobIds
window.addEventListener('job-list-change', (e) => {
    main();
    bossOfflineJobIds = e.detail.bossOfflineJobIds;
    _console('4. 自定义job-list-change回调', bossOfflineJobIds);
});
