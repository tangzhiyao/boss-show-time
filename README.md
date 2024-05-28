# <img src="./public/icons/icon_48.png" width="45" align="left"> Boss Show Time

boss 直聘时间展示插件

## 说明

一款可以展示招聘平台职位时间的 chrome 浏览器插件
已支持：

* boss直聘（目前部分时间已失效
* 智联招聘
* 前程无忧
* 拉勾招聘

在 web 端进入搜索列表后，职位的右上方展示时间
![image](https://github.com/tangzhiyao/boss-show-time/assets/48377612/31c37f4a-4fa0-4c21-ad8d-51abd7dc9354)

## 运行及编译

**直接下载**

![image](https://github.com/tangzhiyao/boss-show-time/assets/48377612/0ac8f395-0612-4eca-a933-e41d8cb1dfb3)

1. 切换到 gh-pages 分支
2. 点击右边绿色 code 按钮，选择下拉框中的 Download ZIP 下载

**编译**

1. 安装，编译

```bash
    npm i
    npm run build
```

2. 打开chrome，选择加载已解压的扩展程序，选择当前项目的 build 目录

3. 打开页面
    * boss直聘： <https://www.zhipin.com/web/geek/job>
    * 智联招聘： <https://sou.zhaopin.com/?jl=653&kw=Java%E5%BC%80%E5%8F%91&p=2>

**开发**

1. 安装，编译

   ```bash
   npm i
   npm run watch
   ```

2. chrome 浏览器打开 chrome://extensions/ 页面

3. 点击`加载已解压的扩展程序`

4. 选择项目中生成的 build 文件夹即可

5. 每次保存都会重新编译，扩展程序需要***重新点一次刷新按钮***才生效

## 其他

* b站插件安装视频：<https://www.bilibili.com/video/BV1rf421S74a/#reply1203871368>

* 掘金文章：<https://juejin.cn/post/7363164068910071834>

## 更新日志

WIP

1. 新增本地显示职位初次浏览时间，历史浏览次数
2. 新增本地职位记录统计，查询，查询结果导出
3. 新增数据备份，数据恢复

2024-5-15

1. 修改boss时间展示 - 感谢 lastsunday 提供

2024-05-11

1. 新增拉勾时间展示

2024-05-07

1. 标签信息修改，新增外包公司图标标识；背景颜色由绿到红代表时间越来越早 - 感谢 lastsunday 提供
2. 新增前程无忧时间展示 - 感谢 lastsunday 提供
3. boss，智联，前程无忧新增时间排序默认由近到远，仅限当前页的数据排序 - 感谢 lastsunday 提供

2024-05-06：

1. boss直聘新增在线筛选，筛选出当前页在线的招聘者 - 感谢 Vivi-wu 提供
2. boss直聘新增日期格式 - 感谢 lastsunday 提供
3. boss直聘新增外包公司提示 - 感谢 lastsunday 提供
4. 智联新增日期格式，一周内发布职位标红

2024-04-30:

1. 更新文档说明，添加视频教程链接
2. 添加智联招聘的时间显示

2024-04-28:

1. 新增 boss 直聘列表展示时间
