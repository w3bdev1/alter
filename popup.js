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

document.forms[0].onsubmit = (e) => {
    e.preventDefault();
    const instancesSelected = { 
        nitter: nitterEl.value,
        teddit: tedditEl.value,
        invidious: invidiousEl.value
    }

    browser.runtime.sendMessage(instancesSelected)
    window.close()
}
