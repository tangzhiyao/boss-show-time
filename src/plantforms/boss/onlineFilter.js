function _console() {
    if (process.env.NODE_ENV !== 'production') {
        console.log(...arguments)
    } else return;
}

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
        const isSelected = filterEle.classList.contains('is-select');
        if(isSelected) {
            filterEle.classList.remove('is-select');
        } else {
            filterEle.classList.add('is-select');
        }
        Array.from(document.querySelectorAll('.search-job-result .job-card-wrapper')).map(node => {
           const isOnline = node.getElementsByClassName('boss-online-tag').length !== 0;
            if(isSelected) {
                node.classList.remove('__boss_filter_result-hidden');
            } else {
                !isOnline && node.classList.add('__boss_filter_result-hidden');
            }
        });

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


export default main;

