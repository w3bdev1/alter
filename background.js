const twitterUrls = ["*://twitter.com/*"]
const redditUrls = ["*://reddit.com/*","*://www.reddit.com/*"]
const youtubeUrls = ["*://youtube.com/*","*://m.youtube.com/*", "*://www.youtube.com/*" ,"*://youtu.be/*"]

let currentInstances = {
    nitter: 'nitter.net',
    teddit: 'teddit.net',
    invidious: 'yewtu.be'
}

function redirect(requestDetails) {
    originalUrl = requestDetails.url;
    console.log("Redirecting " + originalUrl)
    
    const twitterRegex = /(.*):\/\/(twitter.com)\/(.*)/
    const redditRegex = /(.*):\/\/(reddit.com|www.reddit.com)\/(.*)/
    const youtubeRegex = /(.*):\/\/(youtube.com|m.youtube.com|www.youtube.com|youtu.be)\/(.*)/
    
    // Twitter -> Nitter
    if (twitterRegex.test(originalUrl)) {
        newUrl = originalUrl.replace(twitterRegex, `$1://${currentInstances.nitter}/$3`)

        console.log('New URL ', newUrl)
        return { redirectUrl: newUrl }
    }

    // Reddit -> Teddit
    if (redditRegex.test(originalUrl)) {
        newUrl = originalUrl.replace(redditRegex, `$1://${currentInstances.teddit}/$3`)

        console.log('New URL ', newUrl)
        return { redirectUrl: newUrl }
    }

    // YouTube -> Invidious
        if (youtubeRegex.test(originalUrl)) {
        newUrl = originalUrl.replace(youtubeRegex, `$1://${currentInstances.invidious}/$3`)

        console.log('New URL ', newUrl)
        return { redirectUrl: newUrl }
    }
}

function setToLocalStorage(object) {
    function setItem() {
        console.log("Saved to Local Storage");
    }
    function onError(error) {
        console.log(error)
    }

    browser.storage.local.set(object).then(setItem, onError);
}

function updateCurrentInstances() {
    browser.storage.local.get("nitter").then(res => {
        if (Object.values(res)[0]){
            currentInstances.nitter = Object.values(res)[0]
        }
    })
    browser.storage.local.get("teddit").then(res => {
        if (Object.values(res)[0]){
            currentInstances.teddit = Object.values(res)[0]
        }
    })
    browser.storage.local.get("invidious").then(res => {
        if (Object.values(res)[0]){
            currentInstances.invidious = Object.values(res)[0]
        }
    })
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
