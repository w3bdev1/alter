const twitterUrls = ["*://twitter.com/*"]
const redditUrls = ["*://reddit.com/*","*://www.reddit.com/*"]
const youtubeUrls = ["*://youtube.com/*","*://m.youtube.com/*", "*://www.youtube.com/*" ,"*://youtu.be/*"]
const mediumUrls = ['*://medium.com/*', '*://*.medium.com/*']

const allInstances = {
    nitter: ['nitter.net', 'nitter.pussthecat.org',  'nitter.kavin.rocks', 'nitter.eu'],
    teddit: ['teddit.net', 'teddit.ggc-project.de', 'teddit.kavin.rocks'],
    invidious: ['invidious.snopyta.org', 'yewtu.be'],
	scribe: ['scribe.rip', 'scribe.nixnet.services', 'scribe.citizen4.eu']
}

let allInstancesArray = []
Object.values(allInstances).forEach(instances => {
	instances.forEach(instance => allInstancesArray.push(`*://${instance}/*`))
})

let currentInstances = {
    nitter: 'nitter.net',
    teddit: 'teddit.net',
    invidious: 'yewtu.be',
	scribe: 'scribe.rip'
}

function replaceUrl(url, regex, newDomain) {
	return url.replace(regex, `$1://${newDomain}/$3`)
}

function getDomain(url) {
	if (url) {
		return url.replace(/https?:\/\/([^\/]*).*/, '$1')
	} else {
		return null
	}
}

function redirect(requestDetails) {
    const originalUrl = requestDetails.url
    const originalDomain = getDomain(originalUrl)
    
    const twitterRegex = /(https?):\/\/(twitter.com)\/(.*)/
    const redditRegex = /(https?):\/\/(reddit.com|www.reddit.com)\/(.*)/
    const youtubeRegex = /(https?):\/\/(youtube.com|m.youtube.com|www.youtube.com|youtu.be)\/(.*)/
    const mediumRegex = /https?:\/\/(?:.*\.)*(?<!link\.)medium\.com(\/.*)?$/
    
    // Twitter -> Nitter
    if (twitterRegex.test(originalUrl)) {
        const newUrl = replaceUrl(originalUrl, twitterRegex, currentInstances.nitter)
        console.log('New URL ', newUrl)
        return { redirectUrl: newUrl }
    }

    // Reddit -> Teddit
    if (redditRegex.test(originalUrl)) {
        const newUrl = replaceUrl(originalUrl, redditRegex, currentInstances.teddit)
        // newUrl = originalUrl.replace(redditRegex, `$1://${currentInstances.teddit}/$3`)
        console.log('New URL ', newUrl)
        return { redirectUrl: newUrl }
    }

    // YouTube -> Invidious
    if (youtubeRegex.test(originalUrl)) {
    	const newUrl = replaceUrl(originalUrl, youtubeRegex, currentInstances.invidious)
    	console.log('New URL ', newUrl)
    	return { redirectUrl: newUrl }
    }

    // Medium → Scribe
    if (mediumRegex.test(originalUrl)) {
    	const newUrl = originalUrl.replace(mediumRegex, `https://${currentInstances.scribe}$1`)
    	console.log('New URL ', newUrl)
    	return { redirectUrl: newUrl }
    }

    // Other Instance -> Current Instance
    if (
    	allInstancesArray.findIndex(instance => instance.includes(originalDomain)) > -1 &&
    	!Object.values(currentInstances).includes(originalDomain)
    ) {
    	let instanceKey = '';
    	for (const [k,v] of Object.entries(allInstances)) {
    		if (v.includes(originalDomain)) {
    			instanceKey = k
    		}
    	}

    	const newUrl = originalUrl.replace(/(https?:\/\/)([^\/]*)(.*)/, `$1${currentInstances[instanceKey]}$3`)

    	console.log('New URL ', newUrl)
    	return { redirectUrl: newUrl }
    }
}

function setToLocalStorage(object) {
	browser.storage.local.set(object).then(() => console.log("Saved to Local Storage"), err => console.log(err))
}

function updateCurrentInstances() {
	browser.storage.local.get()
		.then(res => { 
			if (Object.keys(res).length !== 0) {
				console.log('Current', res)
				currentInstances = res
			} else {
				console.log('Local storage is empty', res)
			}
		}, err => console.log(err))
}

function handleMessage(message, sender, sendResponse) {
	if (message.type === "bg_update_instances") {
		setToLocalStorage(message.instancesSelected)
		updateCurrentInstances()
		sendResponse("Instances Updated")
	}

	if (message.type === "bg_get_instances") {
        sendResponse({
			allInstances,
			currentInstances
		})
	}
}

updateCurrentInstances();

browser.runtime.onMessage.addListener(handleMessage)

browser.webRequest.onBeforeRequest.addListener(
    redirect,
    {urls: [...twitterUrls, ...redditUrls, ...youtubeUrls, ...mediumUrls, ...allInstancesArray]},
    ["blocking"]
);
