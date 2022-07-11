const data = {
  nitter: {
    el: document.getElementById("nitter-instances"),
    selected: "",
    isCustom: true,
  },
  teddit: {
    el: document.getElementById("teddit-instances"),
    selected: "",
    isCustom: true,
  },
  invidious: {
    el: document.getElementById("invidious-instances"),
    selected: "",
    isCustom: true,
  },
  scribe: {
    el: document.getElementById("scribe-instances"),
    selected: "",
    isCustom: true,
  },
  bibliogram: {
    el: document.getElementById("bibliogram-instances"),
    selected: "",
    isCustom: true,
  },
  disable: {
    el: document.getElementById("disable"),
    selected: "",
    isCustom: false,
  },
  switch_nitter: {
    el: document.getElementById("switch-nitter"),
    isCustom: false,
  },
  switch_teddit: {
    el: document.getElementById("switch-teddit"),
    isCustom: false,
  },
  switch_invidious: {
    el: document.getElementById("switch-invidious"),
    isCustom: false,
  },
  switch_scribe: {
    el: document.getElementById("switch-scribe"),
    isCustom: false,
  },
  switch_bibliogram: {
    el: document.getElementById("switch-bibliogram"),
    isCustom: false,
  },
};

function addEventHandlers() {
  document.onclick = (e) => {
    if (e.target.nodeName === "OPTION") {
      const customInput = e.target.parentNode.nextElementSibling;
      const addCustomBtn = customInput.nextElementSibling;
      if (e.target.value === "other") {
        addCustomBtn.style.display = "none";
        customInput.style.display = "block";
        customInput.required = true;
        return;
      } else {
        addCustomBtn.style.display = "inline";
        customInput.style.display = "none";
        customInput.required = false;
      }
    }

    if (e.target.nodeName === "BUTTON") {
      if (e.target.className === "add-custom") {
        const customInput = e.target.previousElementSibling;
        const selectMenu = customInput.previousElementSibling;
        e.target.style.display = "none";
        selectMenu.value = "other";
        customInput.style.display = "block";
        customInput.required = true;
      }
    }
  };
}

function createOption(value, isSelected = false, key) {
  let optionCreated = document.createElement("option");
  optionCreated.setAttribute("value", value.toLowerCase());
  if (isSelected === true) {
    optionCreated.setAttribute("selected", "selected");
    data[key].isCustom = false;
  }
  optionCreated.innerText = value;
  return optionCreated;
}

function setCustomOptions() {
  for (let [k, v] of Object.entries(data)) {
    if (v.isCustom) {
      const customInput = v.el.nextElementSibling;
      const addCustomBtn = customInput.nextElementSibling;
      v.el.value = "other";
      addCustomBtn.style.display = "none";
      customInput.style.display = "block";
      customInput.value = v.selected;
    }
  }
}

browser.runtime.sendMessage({ type: "bg_get_instances" }).then(
  (msgFromBg) => {
    const instances = msgFromBg.allInstances;
    const currentInstances = msgFromBg.currentInstances;

    for (let key of Object.keys(data)) {
      switch (key) {
        case "disable":
          data[key].el.checked = currentInstances.disable;
          break;
        case "switch_nitter":
          data[key].el.checked = !currentInstances.disable_nitter;
          break;
        case "switch_teddit":
          data[key].el.checked = !currentInstances.disable_teddit;
          break;
        case "switch_invidious":
          data[key].el.checked = !currentInstances.disable_invidious;
          break;
        case "switch_scribe":
          data[key].el.checked = !currentInstances.disable_scribe;
          break;
        case "switch_bibliogram":
          data[key].el.checked = !currentInstances.disable_bibliogram;
          break;
        default:
          instances[key].forEach((ins) => {
            const option = createOption(
              ins,
              currentInstances[key] === ins,
              key
            );
            data[key].el.appendChild(option);
            data[key].selected = currentInstances[key];
          });
          data[key].el.appendChild(createOption("Other"));
      }
    }

    setCustomOptions();
    addEventHandlers();
  },
  (error) => {
    console.log(error);
  }
);

function getInputValue(element) {
  if (element.value === "other") {
    return element.nextElementSibling.value
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");
  } else {
    return element.value;
  }
}

document.forms[0].onsubmit = (e) => {
  e.preventDefault();
  const instancesSelected = {
    nitter: getInputValue(data.nitter.el),
    teddit: getInputValue(data.teddit.el),
    invidious: getInputValue(data.invidious.el),
    scribe: getInputValue(data.scribe.el),
    bibliogram: getInputValue(data.bibliogram.el),
    disable: data.disable.el.checked,
    disable_nitter: !data.switch_nitter.el.checked,
    disable_teddit: !data.switch_teddit.el.checked,
    disable_invidious: !data.switch_invidious.el.checked,
    disable_scribe: !data.switch_scribe.el.checked,
    disable_bibliogram: !data.switch_bibliogram.el.checked,
  };

  const sending = browser.runtime.sendMessage({
    type: "bg_update_instances",
    instancesSelected,
  });

  sending.then(
    () => {
      window.close();
    },
    (error) => {
      console.log(error);
    }
  );
};
