let time = [
  { client: "Tin Internal", croName: "Placeholder", timeSpent: "15000", timeAllocation: "18000", empID: "tinInt" },
  { client: "Tin Meeting", croName: "Placeholder", timeSpent: "2063", timeAllocation: "18000", empID: "tinMeet" },
  { client: "Nocturne", croName: "Placeholder", timeSpent: "3600", timeAllocation: "57600", empID: "noc" },
  { client: "Hansons", croName: "Placeholder", timeSpent: "3600", timeAllocation: "86400", empID: "han" },
  { client: "Rowan", croName: "Placeholder", timeSpent: "1218", timeAllocation: "86400", empID: "row" },
  { client: "Parts Town", croName: "Placeholder", timeSpent: "14000", timeAllocation: "144000", empID: "pt" },
  { client: "Life Stance", croName: "Placeholder", timeSpent: "716", timeAllocation: "57600", empID: "ls" },
  { client: "Us Polo", croName: "Placeholder", timeSpent: "33", timeAllocation: "28800", empID: "usp" },
];

function formatTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes}m`;
}

function percentAllocationSpent(timeSpent, allocationAmount) {
  let percent = Math.round((timeSpent / allocationAmount) * 100);
  return percent;
}

async function saveTime() {
  console.log("Saving Time");
  const options = {
    suggestedName: "userdata.txt",
    types: [
      {
        description: "Text file",
        accept: { "text/plain": [".txt"] },
      },
    ],
  };

  // Prompt the user to pick a save location
  const handle = await window.showSaveFilePicker(options);
  const writable = await handle.createWritable();

  let realTime = [];

  document.querySelectorAll(".client-info").forEach((elm) => {
    console.log(elm.querySelector(".client-name"));
    realTime.push({
      client: elm.querySelector(".client-name").innerText,
      croName: "Placeholder",
      timeSpent: elm.querySelector(`[class^="time-spent"]`).getAttribute("data-time"),
      timeAllocation: elm.querySelector(`[class^="time-allocated"]`).getAttribute("data-allocated"),
      empID: elm.querySelector("button").getAttribute(`id`),
    });
  });

  console.log(realTime);
  await writable.write(JSON.stringify(realTime));
  await writable.close();
}

//todo: Build array structure that is easily json's that can include the client, time spent this month, and time allocation
//must be able to easily add multiple clients

function getElapsedSeconds(start) {
  let now = Date.now();
  let diffMs = now - start;
  return Math.floor(diffMs / 1000);
}

function timeTrack(e) {
  let button = document.querySelector(`#${e.target.id}`);
  let initialTime = Number(document.querySelector(`.time-spent-${e.target.id}`).getAttribute("data-time"));
  if (button.getAttribute("timer-status") == "paused") {
    button.setAttribute("timer-status", "counting");
    button.parentNode.classList.add("actively-tracking");
    button.innerText = "Stop Time";

    const startTime = Date.now();
    button.dataset.startTime = startTime;

    const intervalId = setInterval(() => {
      //current number of total seconds
      const totalTime = initialTime + getElapsedSeconds(startTime);
      document.querySelector(`.time-spent-${e.target.id}`).innerText = formatTime(totalTime);
      //document.querySelector(`.time-spent-${e.target.id}`).setAttribute("data-time", totalTime);
    }, 1000);
    button.dataset.intervalId = intervalId;
  } else {
    document.querySelector(`.time-spent-${e.target.id}`).setAttribute("data-time", Number(initialTime) + getElapsedSeconds(Number(button.dataset.startTime)));
    button.setAttribute("timer-status", "paused");
    button.innerText = "Start Time";
    button.parentNode.classList.remove("actively-tracking");
    clearInterval(button.dataset.intervalId);
  }
}

async function openTime() {
  // Prompt the user to select a file
  const [fileHandle] = await window.showOpenFilePicker({
    types: [
      {
        description: "Text Files",
        accept: { "text/plain": [".txt"] },
      },
    ],
  });

  const file = await fileHandle.getFile();
  const contents = await file.text();

  let updatedtime = JSON.parse(contents);
  //build out users
  updatedtime.forEach((elm) => {
    document.querySelector(".clientHolder").insertAdjacentHTML(
      "beforebegin",
      ` <div class="client-info"><div class="client-name">${elm.client}</div><button id="${elm.empID}" class="time-track" timer-status="paused">Start Time</button> <div class="time-spent-${
        elm.empID
      }" data-time="${elm.timeSpent}">${formatTime(elm.timeSpent)}</div> <div class="time-allocated-${elm.empID}" data-allocated="${elm.timeAllocation}">${percentAllocationSpent(
        elm.timeSpent,
        elm.timeAllocation
      )}%</div>
        </div>`
    );

    //console.log(elm);
  });
  document.querySelectorAll(".time-track").forEach((elm) => {
    elm.addEventListener("click", timeTrack);
  });

  return contents;
}

function generateReport() {
  document.querySelector(".report").classList.remove("hide");

  console.log("beep boop....generating report");
  document.querySelectorAll(".client-info").forEach((elm) => {
    document.querySelector(".report").insertAdjacentHTML(
      "beforeend",
      ` <div class="client-report">
    <div>${elm.querySelector(".client-name").innerText}</div> <div>${formatTime(Math.round(elm.querySelector(`[class^="time-spent"]`).getAttribute("data-time") / 4))} per week</div> <div>${Math.round(
        (elm.querySelector(`[class^="time-spent"]`).getAttribute("data-time") / elm.querySelector(`[class^="time-allocated"]`).getAttribute("data-allocated")) * 100
      )}% of allocation</div>    
    </div>`
    );
  });
}

function closeReport() {
  console.log("CLICKED");
  document.querySelector(".report").classList.add("hide");
  document.querySelectorAll(".report > .client-report").forEach((elm) => {
    elm.remove();
  });
}

document.querySelector("#openTime").addEventListener("click", openTime);

document.querySelector("#timeSave").addEventListener("click", saveTime);

//generateReport
document.querySelector("#generateReport").addEventListener("click", generateReport);
document.querySelector(".closeReport").addEventListener("click", closeReport);
//160 hours full month
