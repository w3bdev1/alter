const nitterEl = document.getElementById('nitter-instances')
const tedditEl = document.getElementById('teddit-instances')
const invidiousEl = document.getElementById('invidious-instances')
const scribeEl = document.getElementById('scribe-instances')

function createOption(value, isSelected = false) {
    let optionCreated = document.createElement('option')
    optionCreated.setAttribute('value', value)
	if (isSelected === true) {
		optionCreated.setAttribute('selected', 'selected')
	}
    optionCreated.innerText = value
    return optionCreated
}

browser.runtime.sendMessage({ type: "bg_get_instances" })
	.then(msgFromBg => {
		const instances = msgFromBg.allInstances
		const currentInstances = msgFromBg.currentInstances

		instances.nitter.forEach(ins => {
			const option = createOption(ins, currentInstances.nitter === ins)
			nitterEl.appendChild(option)
		})

		instances.teddit.forEach(ins => {
			const option = createOption(ins, currentInstances.teddit === ins)
			tedditEl.appendChild(option)
		})

		instances.invidious.forEach(ins => {
			const option = createOption(ins, currentInstances.invidious === ins)
			invidiousEl.appendChild(option)
		})

		instances.scribe.forEach(ins => {
			const option = createOption(ins, currentInstances.scribe === ins)
			scribeEl.appendChild(option)
		})

	}, error => {console.log(error)})

document.forms[0].onsubmit = (e) => {
    e.preventDefault();
    const instancesSelected = { 
        nitter: nitterEl.value,
        teddit: tedditEl.value,
        invidious: invidiousEl.value,
		scribe: scribeEl.value
    }

	const sending = browser.runtime.sendMessage(
		{
			type: "bg_update_instances",
			instancesSelected
		}
	)

	sending.then((msgFromBg) => {
		window.close()
	}, (error) => {
		console.log(error)
	})
}
