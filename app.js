/**
 * Lib
 */

const path = require('path')
const fs = require('fs')
const superagent = require('superagent')
const cheerio = require('cheerio')
const EventEmitter = require('events')

/**
 * Variable
 */

const URL = 'http://www.nanrencd.cc/page/'
const log = console.log
const imgRoot = path.resolve(process.cwd(), 'imgs')
let page = 1
let task = []

/**
 * Custom event
 */

class MyEmitter extends EventEmitter {}
const event = new MyEmitter()

event.on('loadItemEnd', () => {
	if (task.length) {
		loadItem(task.shift())
	} else {
		log('')
		log(`page-${page} 已加载完毕`)
		page++
		loadPage()
	}
})

/**
 * Start
 */

log('product start')

if (!fs.existsSync(imgRoot)) {
	fs.mkdirSync(imgRoot)
}

try {
	loadPage()
} catch (err) {
	task = []
	loadPage()
}

/**
 * LoadPage
 *
 * 加载列表页面
 * 读取列表项信息填充至task
 */

function loadPage () {
	down(URL+page).then( ($) => {
		log('')
		log(`loading page-${page}`)

		let girls = $('a.zoom')  // 列表项集合
		if (!girls.length) {
			log(`page-${page} 加载失败，未获取相应数据`)
			return			
		}

		girls.each((i, e) => {
			task.push({
				url: $(e).attr('href'),
				title: $(e).attr('title'),
				preview: $(e).find('img').attr('src')
			})
		})

		log(`filling the ${page}`)
		loadItem(task.shift())
	})
}

/**
 * loadItem
 *
 * 加载列表项页面
 * 加载列表项页面里的所有分页，并读取图片信息填充，传递给save函数
 */

function loadItem (obj) {
	let url = obj.url
	let title = obj.title
	let preview = obj.preview
	let srcs = []

	log('')
	log(`开始检测 ${title}`)

	// 检测是否存储过当前项
	if (fs.existsSync(path.resolve(imgRoot, title))) {
		event.emit('loadItemEnd')
		log('数据已存在')
		return
	}

	log(`准备加载 ${title}`)

	down(url).then(($) => {
		log(`准备处理 ${title}`)

		let imgs = $(`img[alt="${title}"]`)
		let pages = $(`[href^="${url}/"]`)  // 分页集合
		let pagesUrl = []

		imgs.each((i, e) => {
			srcs.push($(e).attr('src'))
		})

		pages.each((i, e) => {
			pagesUrl.push($(e).attr('href'))
		})

		log(`准备加载分页 ${title}`)

		Promise.all(pagesUrl.map(e => down(e))).then(result => {
			result.forEach((_$, index) => {
				_$(`img[alt="${title}"]`).each((_i,_e) => {
					srcs.push(_$(_e).attr('src'))
				})
			})

			log(`准备储存图片 ${title}`)

			save({title: title, srcs: srcs, preview: preview}, r => {
				log(`存储完毕 ${title}`)
				event.emit('loadItemEnd')
			})
		})
	})
}

function save(data, callback) {
	let title = data.title
	let srcs = data.srcs

	Promise.all(srcs.map(e => down(e, false))).then(result => {
		var imgPath = path.resolve(imgRoot, title) 
		fs.mkdirSync(path.resolve(imgPath))

		log(`开始储存图片 ${title}`)

		result.forEach((e, i) => {
			fs.writeFileSync(path.resolve(imgPath, `${i}.jpg`), e.body, null)
		})

		callback && callback ()
	})
}

function down (url, hasProcess = true) {
	if (hasProcess) {
		return new Promise((resolve, reject) => {
			superagent
				.get(url)
				.end((err, res) => {
					if (err) reject(err)
					resolve(cheerio.load(res.text))
				})
		})
	} else {
		return new Promise((resolve, reject) => {
			superagent
				.get(url)
				.end((err, res) => {
					if (err) reject(err)
					resolve(res)
				})
		})
	}
}