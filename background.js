const twitterUrls = ["*://twitter.com/*", "*://mobile.twitter.com/*"];
const quoraUrls = ["*://www.quora.com/*", "*://quora.com/*"];
const redditUrls = ["*://reddit.com/*", "*://www.reddit.com/*"];
const youtubeUrls = [
  "*://youtube.com/*",
  "*://m.youtube.com/*",
  "*://www.youtube.com/*",
  "*://youtu.be/*",
];
const mediumUrls = ["*://medium.com/*", "*://*.medium.com/*"];
const allInstances = {
  nitter: [
    "nitter.net",
    "nitter.pussthecat.org",
    "nitter.kavin.rocks",
    "nitter.eu",
  ],
  teddit: ["teddit.net", "teddit.ggc-project.de", "teddit.kavin.rocks"],
  invidious: ["invidious.snopyta.org", "yewtu.be"],
  scribe: ["scribe.rip", "scribe.nixnet.services", "scribe.citizen4.eu"],
  quetre: ["quetre.iket.me", "quetre.vern.cc", "quetre.pussthecat.org"],
  // quetre: ["quetre.odyssey346.dev", quetre.tokhmi.xyz, quetre.privacydev.net],
};

let allInstancesArray = [];
Object.values(allInstances).forEach((instances) => {
  instances.forEach((instance) => allInstancesArray.push(`*://${instance}/*`));
});

let currentInstances = {
  nitter: "nitter.net",
  teddit: "teddit.net",
  invidious: "yewtu.be",
  scribe: "scribe.rip",
  quetre: "quetre.iket.me",
  disable: false,
  disable_nitter: false,
  disable_teddit: false,
  disable_invidious: false,
  disable_scribe: false,
  disable_quetre: false,
};

function replaceUrl(url, regex, newDomain) {
  return url.replace(regex, `$1://${newDomain}/$3`);
}

function getDomain(url) {
  if (url) {
    return url.replace(/https?:\/\/([^\/]*).*/, "$1");
  } else {
    return null;
  }
}

function redirect(requestDetails) {
  if (currentInstances.disable) {
    return null;
  } else {
    const originalUrl = requestDetails.url;
    const originalDomain = getDomain(originalUrl);

    const twitterRegex = /(https?):\/\/(twitter.com|mobile.twitter.com)\/(.*)/;
    const redditRegex = /(https?):\/\/(reddit.com|www.reddit.com)\/(.*)/;
    const youtubeRegex =
      /(https?):\/\/(youtube.com|m.youtube.com|www.youtube.com|youtu.be)\/(.*)/;
    const mediumRegex = /https?:\/\/(?:.*\.)*(?<!link\.)medium\.com(\/.*)?$/;
    const quoraRegex = /(https?):\/\/(quora.com|www.quora.com)\/(.*)/;

    // Twitter -> Nitter
    if (!currentInstances.disable_nitter && twitterRegex.test(originalUrl)) {
      const newUrl = replaceUrl(
        originalUrl,
        twitterRegex,
        currentInstances.nitter
      );
      console.log("New URL ", newUrl);
      return { redirectUrl: newUrl };
    }

    // Reddit -> Teddit
    if (!currentInstances.disable_teddit && redditRegex.test(originalUrl)) {
      const newUrl = replaceUrl(
        originalUrl,
        redditRegex,
        currentInstances.teddit
      );
      // newUrl = originalUrl.replace(redditRegex, `$1://${currentInstances.teddit}/$3`)
      console.log("New URL ", newUrl);
      return { redirectUrl: newUrl };
    }

    // YouTube -> Invidious
    if (!currentInstances.disable_invidious && youtubeRegex.test(originalUrl)) {
      const newUrl = replaceUrl(
        originalUrl,
        youtubeRegex,
        currentInstances.invidious
      );
      console.log("New URL ", newUrl);
      return { redirectUrl: newUrl };
    }

    // Medium → Scribe
    if (!currentInstances.disable_scribe && mediumRegex.test(originalUrl)) {
      const newUrl = originalUrl.replace(
        mediumRegex,
        `https://${currentInstances.scribe}$1`
      );
      console.log("New URL ", newUrl);
      return { redirectUrl: newUrl };
    }

    // Quora → Quetre
    if (!currentInstances.disable_quetre && quoraRegex.test(originalUrl)) {
      const newUrl = replaceUrl(
        originalUrl,
        quoraRegex,
        currentInstances.quetre
      );
      console.log("New URL ", newUrl);
      return { redirectUrl: newUrl };
    }

    // Other Instance -> Current Instance
    if (
      allInstancesArray.findIndex((instance) =>
        instance.includes(originalDomain)
      ) > -1 &&
      !Object.values(currentInstances).includes(originalDomain)
    ) {
      let instanceKey = "";
      for (const [k, v] of Object.entries(allInstances)) {
        if (v.includes(originalDomain)) {
          instanceKey = k;
        }
      }

      const newUrl = originalUrl.replace(
        /(https?:\/\/)([^\/]*)(.*)/,
        `$1${currentInstances[instanceKey]}$3`
      );

      console.log("New URL ", newUrl);
      return { redirectUrl: newUrl };
    }
  }
}

function setToLocalStorage(object) {
  browser.storage.local.set(object).then(
    () => console.log("Saved to Local Storage"),
    (err) => console.log(err)
  );
}

function updateCurrentInstances() {
  browser.storage.local.get().then(
    (res) => {
      if (Object.keys(res).length !== 0) {
        console.log("Current", res);
        currentInstances = res;
      } else {
        console.log("Local storage is empty", res);
      }
    },
    (err) => console.log(err)
  );
}

function handleMessage(message, sender, sendResponse) {
  if (message.type === "bg_update_instances") {
    setToLocalStorage(message.instancesSelected);
    updateCurrentInstances();
    sendResponse("Instances Updated");
  }

  if (message.type === "bg_get_instances") {
    sendResponse({
      allInstances,
      currentInstances,
    });
  }
}

updateCurrentInstances();

browser.runtime.onMessage.addListener(handleMessage);

browser.webRequest.onBeforeRequest.addListener(
  redirect,
  {
    urls: [
      ...twitterUrls,
      ...redditUrls,
      ...youtubeUrls,
      ...mediumUrls,
      ...quoraUrls,
      ...allInstancesArray,
    ],
    types: ["main_frame"],
  },
  ["blocking"]
);
