# node爬虫爬取写真站图片

## 前言

例行交待背景，很早做的一个小项目。当时公司需要爬取58数据，本是后台的事，我闲着无聊，也跟着搜了搜相关资料。不想爬取新闻类站点，想到写真站广告多，分页多，体验不好。正好可以拿来爬爬练手，于是有了这么一个项目。最近面试，整理下作为作品冲冲门面。

## 项目概述

项目地址： [https://github.com/jide123456/girl](https://github.com/jide123456/girl)

- 拉取列表页， 遍历读取单项信息填充至队列。
- 从队列中取出一项， 读取分页图片信息并转存在本地， **用Promise.all确保所有异步操作同时完成**。
- 用自定义事件控制队列进度
- 队列加载完后拉取下一页列表页。 重复上述过程。
- 关键流程点加上打印信息， 以便了解程序进度。
- 简单的错误处理。

## 项目依赖

- [superagent](https://github.com/visionmedia/superagent)
- [cheerio](https://github.com/cheeriojs/cheerio)

## 项目运行

`npm install && npm run start`

## 项目展示

![reptile01](http://jideblog.b0.upaiyun.com/static/blog/images/reptile01.png)

![reptile02](http://jideblog.b0.upaiyun.com/static/blog/images/reptile02.png)

![reptile03](http://jideblog.b0.upaiyun.com/static/blog/images/reptile03.png)