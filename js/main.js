$(function() {
	// $('body').scrollspy({
	// 	target: navSelector
	// })

	var navItemProto = document.querySelector('[data-nav-proto]')
	var content = document.querySelector('[data-content]')

	var navContainer = navItemProto.parentNode
	navContainer.removeChild(navItemProto)

	fetch('/toc.json', function(json) {
		window.MCM = JSON.parse(json)

		renderNavItems(navContainer, MCM, true)
		renderContentDivs(MCM)

		var keys = Object.keys(MCM)
		renderContentFor(keys[0])
		renderContentFor(keys[1])

		$('body').scrollspy({
			target: '[data-toc]'
		})
	})

	function renderContentFor(key) {
		var contentDiv = document.getElementById(parameterize(key))
		var html = contentize(MCM[key])
		if (key.indexOf('_') === -1) {
			contentDiv.innerHTML = renderPart(key, html)
		}

		fixListElements(contentDiv)
	}

	function renderPart(key, html) {
		var result = "<h1 style='text-align: center'>"
		var id = parseInt(key)
		if (id) result += "Part " + romanize(id) + "<br>"
		result += key.split(' - ')[1].toUpperCase()
		result += "</h1>"
		result += contentize(html)
		return result
	}

	function renderContentDivs(sections, keypath) {
		if (!keypath) keypath = []

		for (var key in sections) {
			var value = sections[key]
			var newKeypath = keypath.concat(key)

			if (typeof value === 'string') {
				var el = document.createElement('div')
				el.id = parameterize(newKeypath.join('_'))
				content.appendChild(el)
			} else if (typeof value === 'object') {
				renderContentDivs(value, newKeypath)
			}
		}
	}

	function renderNavItems(container, sections, root) {
		container.innerHTML = ''

		for (var key in sections) {
			var value = sections[key]
			var navItem = renderNavItem(key, root && typeof value !== 'string' && value)
			container.appendChild(navItem)
		}
	}

	function renderNavItem(title, children) {
		var item = navItemProto.cloneNode(true)
		item.querySelector('[data-title]').innerHTML = romanizeTitle(title)
		item.querySelector('[data-target]').href = '#' + parameterize(title)

		var subNav = item.querySelector('[data-subnav]')
		if (children) {
			renderNavItems(subNav, children)
		} else {
			item.removeChild(subNav)
		}

		return item
	}

	function fetch(url, callback) {
		var request = new XMLHttpRequest()
		request.addEventListener('load', function() {callback(this.responseText)})
		request.open('GET', url)
		request.send()
	}

	function parameterize(string) {
		return string.trim().replace(/[\s|-]+/g, '-').split(/[^\w|-]/)[0].toLowerCase()
	}

	function contentize(html) {
		return html.replace(/<(\/?)list/g, '<$1ol')
	}

	var LIST_TYPES = {
		'I': /I/,
		'i': /i/,
		'A': /[A-Z]/,
		'a': /[a-z]/,
		'1': /[0-9]/,
	}

	function fixListElements(el) {
		var lists = el.querySelectorAll('ol')
		lists && lists.forEach(function(list) {
			var li = list.querySelector('li')
			var index = li.getAttribute('index')
			for (var listType in LIST_TYPES) {
				if (LIST_TYPES[listType].test(index)) {
					list.type = listType
					break
				}
			}
		})
	}

	function romanizeTitle(title) {
		var comps = title.split(' - ')
		if (comps.length > 1) {
			var romanized = [romanize(comps[0])]
			if (!romanized[0]) romanized.pop()
				
			romanized.push(comps[1])
			return romanized.join(' - ')
		} else { return comps[0] }
	}

	function romanize(num) {
		var lookup = {M:1000,CM:900,D:500,CD:400,C:100,XC:90,L:50,XL:40,X:10,IX:9,V:5,IV:4,I:1}, roman = '', i
		for (i in lookup) {
			while (num >= lookup[i]) {
				roman += i
				num -= lookup[i]
			}
		}
		
		return roman
	}
})