const instances = {
    nitter: ['nitter.net', 'nitter.pussthecat.org', 'nitter.eu'],
    teddit: ['teddit.net', 'teddit.ggc-project.de', 'teddit.kavin.rocks'],
    invidious: ['invidious.snopyta.org', 'yewtu.be']
}

const nitterEl = document.getElementById('nitter-instances')
const tedditEl = document.getElementById('teddit-instances')
const invidiousEl = document.getElementById('invidious-instances')

function createOption(value) {
    let optionCreated = document.createElement('option')
    optionCreated.setAttribute('value', value)
    optionCreated.innerText = value
    return optionCreated
}

browser.runtime.sendMessage({ type: "bg_get_instances" })
	.then(msgFromBg => {
		console.log(msgFromBg)

		instances.nitter.forEach(ins => {
			let option = createOption(ins)
			nitterEl.appendChild(option)
		})

		instances.teddit.forEach(ins => {
			let option = createOption(ins)
			tedditEl.appendChild(option)
		})

		instances.invidious.forEach(ins => {
			let option = createOption(ins)
			invidiousEl.appendChild(option)
		})

	}, error => {console.log(error)})

document.forms[0].onsubmit = (e) => {
    e.preventDefault();
    const instancesSelected = { 
        nitter: nitterEl.value,
        teddit: tedditEl.value,
        invidious: invidiousEl.value
    }

	const sending = browser.runtime.sendMessage(
		{
			type: "bg_update_instances",
			instancesSelected
		}
	)

	sending.then((msgFromBg) => {
		console.log(msgFromBg)
		window.close()
	}, (error) => {
		console.log(error)
	})
}
