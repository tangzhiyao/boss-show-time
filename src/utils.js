import dayjs from "dayjs";
export function createScript(src) {
    const script = document.createElement('script');
    script.setAttribute('src', src);
    return script;
}


export function createLink(href) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    
    // 注意这里需要配置 manifest 的 web_accessible_resources 字段，否则无法加载
    link.setAttribute('href', href);
    link.setAttribute('crossorigin', 'anonymous');
    return link;
}
 
 
// 转换时间
export function convertTimeToHumanReadable(dateTime) {
    let date = dayjs(dateTime);
    let curDate = dayjs();
	
	// 计算时间差共有多少个分钟
	let minC = curDate.diff(date, 'minute', true);
	// 计算时间差共有多少个小时
	let hourC = curDate.diff(date, 'hour', true);
	// 计算时间差共有多少个天
	let dayC = curDate.diff(date, 'day', true);
	// 计算时间差共有多少个周
	let weekC = curDate.diff(date, 'week', true);
	// 计算时间差共有多少个月
	let monthC = curDate.diff(date, 'month', true);
 
    if(minC < 5) {
        return `刚刚`;
    } else if (minC < 60) {
        return `1小时内`;
    } else if (hourC < 24) {
        return `1天内`;
    } else if (dayC < 7) {
        return `${parseInt(dayC)}天内`
    } else if (monthC < 1) {
        return `${parseInt(Math.ceil(weekC))}周内`
    } else if (monthC <= 2) {
        return `2个月内`
    } else if (monthC <= 3) {
        return `3个月内`
    } else {
        return '超出3个月';
    }

}

export function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
 
export function debounce(fn, delay) {
    let timer = null;
    return function(...args) {
        if(timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            fn(...args);
        }, delay);
    }
}
