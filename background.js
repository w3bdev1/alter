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
        console.log("OK");
    }
    function onError(error) {
        console.log(error)
    }

    browser.storage.local.set(object).then(setItem, onError);
}

function getFromLocalStorage(key) {
    let returnValue = ''
    browser.storage.local.get(key).then(res => returnValue = Object.values(res)[0])

    return returnValue
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

function handleMessage(message) {
        console.log("From bg: ", message)
        setToLocalStorage(message)
        updateCurrentInstances()
}

updateCurrentInstances();

browser.runtime.onMessage.addListener(handleMessage)

browser.webRequest.onBeforeRequest.addListener(
    redirect,
    {urls: [...twitterUrls, ...redditUrls, ...youtubeUrls]},
    ["blocking"]
);