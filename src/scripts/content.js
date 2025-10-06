const hamburger = document.querySelector('.hamburger');
const button = document.querySelector('.hamburger-button');

button.addEventListener('click', () => {
	hamburger.classList.toggle('open');
});

const background = document.getElementById('background')

const header = document.getElementById('header')
const footer = document.getElementById('footer')

const screenContent = document.getElementById('content')

async function loadData() {
	try {
		const response = await fetch('./src/data.json')
		if (!response.ok) {
			throw new Error('Error loading JSON');
		}
		const data = await response.json()
		return data;
	} catch (error) {
		console.error('Error:', error)
		return null;
	}
}

document.addEventListener('click', (event) => {
	const clickedElement = event.target.closest('a[data-page]');
	if (!clickedElement) return;

	event.preventDefault();

	const page = clickedElement.dataset.page;

	background.classList.remove('home', 'destination', 'crew-bg', 'tech-bg');
	screenContent.classList.remove('content-01', 'content-02', 'content-03');
	header.classList.remove('menu-header');
	footer.classList.remove('add-footer');

	if (event.target.matches('.tech-link')) {
		event.preventDefault();
		const index = parseInt(event.target.dataset.index, 10);

		if (!jsonData || !jsonData.technology) return;

		loadContent.renderTechContent(jsonData, index);
		return;
	}

	if (!jsonData) {
		console.error("Data is loading yet.");
		return;
	}
	switch (page) {
		case 'home':
			background.classList.add('home');
			loadContent.renderIndex(jsonData, 0);
			break;

		case 'destination':
			background.classList.add('destination');
			screenContent.classList.add('content-01');
			loadContent.renderMoonContent(jsonData, 0);
			break;

		case 'crew':
			background.classList.add('crew-bg');
			screenContent.classList.add('content-02');
			loadContent.renderCrewContent(jsonData, 0);
			break;

		case 'tech':
			background.classList.add('tech-bg');
			screenContent.classList.add('content-03');
			header.classList.add('menu-header');
			footer.classList.add('add-footer');
			loadContent.renderTechContent(jsonData, 0);

			setTimeout(() => {
				invertContainerIfMobile();
			}, 50);

			break;

		default:
			console.warn(`Unknown page: ${page}`);
	}
});

const loadContent = {
	screenContent,

	renderIndex(data) {
		const home = data.home[0];

		const html = `
			<div id="description">
				<h2>${home.title}</h2>
				<h1>${home.name}</h1>
				<p>${home.description}</p>
			</div>
			<a class="button" href="#" data-page="destination">EXPLORE</a>
		`;
		this.updateContent(html);
	},

	renderMoonContent(data, index) {
		const dest = data.destinations[index];
		const html = `
			<div class="destination-title">
				<span>${dest.number}</span> ${dest.title}
			</div>
			<div class="destination-select">
				<div class="destination-image">
					<img src="${dest.images.webp}" alt="${dest.name}">
				</div>
				<div class="destination-content">
					<nav>
						${data.destinations.map((_, i) =>
			`<a href="#" class="destination-link" data-index="${i}">${_.name.toUpperCase()}</a>`).join('')}
					</nav>
					<h1>${dest.name}</h1>
					<p class="text">${dest.description}</p>
					<img src="src/assets/shared/line.png" alt="Line">
					<div class="destination-foot"> 
						<div class="distance">
							<p>AVG. DISTANCE</p>
							<h3>${dest.distance}</h3>
						</div>
						<div class="travel">
							<p>EST. TRAVEL TIME</p>
							<h3>${dest.travel}</h3>
						</div>
					</div>
				</div>
			</div>
		`;

		this.updateContent(html, '.destination-image img');
		this.activateIndexNavigation('.destination-link', index => this.renderMoonContent(data, index));
	},

	renderCrewContent(data, index) {
		const crew = data.crew[index];
		const html = `
			<div class="crew-content">
				<div class="crew-title">
					<h3><span>${crew.number}</span> ${crew.title}</h3>
				</div>
				<div class="crew-data">
					<div class="left-crew">
						<h2 class="role">${crew.role}</h2>
						<h1>${crew.name}</h1>
						<p>${crew.bio}</p>
						<nav>
							${data.crew.map((_, i) =>
			`<a href="#" class="crew-link" data-index="${i}"></a>`).join('')}
						</nav>
					</div>
					<div class="crew-images">
						<img src="${crew.images.webp}" alt="${crew.name}">
					</div>
				</div>
			</div>
		`;

		this.updateContent(html, '.crew-images img');
		this.activateIndexNavigation('.crew-link', index => this.renderCrewContent(data, index), true);
	},

	renderTechContent(data, index) {
		const tech = data.technology[index];
		const html = `
			<div class="tech-content">
				<div class="tech-title">
					<h3><span>${tech.number}</span> ${tech.title}</h3>
				</div>
				<div class="tech-data">
					<div class="left-tech">
						<nav>
							${data.technology.map((_, i) =>
			`<a href="#" class="tech-link" data-index="${i}">${i + 1}</a>`).join('')}
						</nav>
						<div class="tech-content">
							<h2>The Terminology...</h2>
							<h1>${tech.name}</h1>
							<p>${tech.description}</p>
						</div>
					</div>
					<div class="tech-images">
<img 
	src="${tech.images.portrait}" 
	alt="${tech.name}"
	data-portrait="${tech.images.portrait}"
	data-landscape="${tech.images.landscape}"
	data-mobile="${tech.images.mobile}"
/>					</div>
				</div>
			</div>
		`;



		this.updateContent(html, '.tech-images img');
		this.activateIndexNavigation('.tech-link', index => this.renderTechContent(data, index), true);
		invertContainerIfMobile();
	},

	updateContent(html, imageSelector = null) {
		this.screenContent.innerHTML = html;

		if (imageSelector) {
			const img = this.screenContent.querySelector(imageSelector);
			if (img) {
				requestAnimationFrame(() => img.classList.add('visible'));
			}
		}
	},

	activateIndexNavigation(selector, callback, restoreFocus = false) {
		const links = document.querySelectorAll(selector);
		links.forEach(link => {
			link.addEventListener('click', e => {
				e.preventDefault();
				const index = parseInt(link.getAttribute('data-index'));
				callback(index);

				if (restoreFocus) {
					setTimeout(() => {
						const updatedLinks = document.querySelectorAll(selector);
						const newLink = [...updatedLinks].find(l => parseInt(l.getAttribute('data-index')) === index);
						newLink?.focus();
					}, 0);
				}
			});
		});
	}
};

let jsonData = null;
loadData().then(data => {
	if (data) {
		jsonData = data;
		loadContent.renderIndex(jsonData, 0);
		footer.classList.add('menu-footer')
	}
});

function invertContainerIfMobile() {
	const div1 = document.querySelector('.left-tech');
	const div2 = document.querySelector('.tech-images');

	if (!div1 || !div2) return;

	const parent = div1.parentNode;
	const img = div2?.querySelector('img');

	if (!div1 || !div2 || !img) {
		console.warn('invertContainerIfMobile: elementos não encontrados.');
		return;
	}

	if (!img) return;

	const width = window.innerWidth;

	if (width <= 379) {
		parent.insertBefore(div2, div1);
		img.src = img.dataset.mobile;
	} else if (width <= 820) {
		parent.insertBefore(div2, div1);
		img.src = img.dataset.landscape;
	} else if (width <= 1025) {
		parent.insertBefore(div2, div1);
		img.src = img.dataset.landscape;
	} else {
		parent.insertBefore(div1, div2);
		img.src = img.dataset.portrait;
	}
}
window.addEventListener('onload', invertContainerIfMobile);
window.addEventListener('resize', invertContainerIfMobile);


