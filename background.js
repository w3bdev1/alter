const twitterUrls = ["*://twitter.com/*"]
const redditUrls = ["*://reddit.com/*","*://www.reddit.com/*"]
const youtubeUrls = ["*://youtube.com/*","*://m.youtube.com/*", "*://www.youtube.com/*" ,"*://youtu.be/*"]

let currentInstances = {
    nitter: 'nitter.net',
    teddit: 'teddit.net',
    invidious: 'yewtu.be'
}

function replaceUrl(url, regex, newDomain) {
	return url.replace(regex, `$1://${newDomain}/$3`)
}

function redirect(requestDetails) {
    const originalUrl = requestDetails.url;
    console.log("Redirecting " + originalUrl)
    
    const twitterRegex = /(.*):\/\/(twitter.com)\/(.*)/
    const redditRegex = /(.*):\/\/(reddit.com|www.reddit.com)\/(.*)/
    const youtubeRegex = /(.*):\/\/(youtube.com|m.youtube.com|www.youtube.com|youtu.be)\/(.*)/
    
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
        sendResponse(Promise.resolve(browser.storage.local.get()))
	}
}

updateCurrentInstances();

browser.runtime.onMessage.addListener(handleMessage)

browser.webRequest.onBeforeRequest.addListener(
    redirect,
    {urls: [...twitterUrls, ...redditUrls, ...youtubeUrls]},
    ["blocking"]
);
