// Add event listeners to the buttons
document.getElementById("add-button").addEventListener("click", () => addData());
document.getElementById("submit-button").addEventListener("click", () => submitData());
document.getElementById("aug-button").addEventListener("click", () => setReadingDate("aug"));
document.getElementById("sep-button").addEventListener("click", () => setReadingDate("sep"));

// Add event listeners for input fields
//document.getElementById("name-input").addEventListener("input", () => saveName());
document.getElementById("id-input").addEventListener("input", () => saveCageID());

// Add event listener for delete buttons using event delegation
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-button")) {
    deleteData(e);
  }
});

//vars
let monthReading = "";
let names = "";
let cageID = "";
let sizeData = [];
let allData = [];
let dataType = "size";


// GET THE DATA FROM THE GOOGLE SHEET
const sheetID = '1tnNSICiEBqtWQFtvm3f97aSVcw2XRPcw9Zl4Im9Kdr0';
const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json`;


// No idea wtf any of this does its all from AI
fetch(url)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substr(47).slice(0, -2));
    // Extract and log all rows as arrays of cell values, all as strings
    allData = json.table.rows.map(row =>
      row.c.map(cell => {
        if (!cell) return "";
        if (cell.v !== undefined && cell.v !== null) return cell.v;
        if (cell.f !== undefined && cell.f !== null) return cell.f;
        return "";
      })
    );
  });



//load from local storage
if (localStorage.getItem("sizeData")) {
  sizeData = JSON.parse(localStorage.getItem("sizeData"));
}

if (localStorage.getItem("monthReading")) {
  monthReading = localStorage.getItem("monthReading");
  setReadingDate(monthReading);
} else {
  setReadingDate("aug");
}

if (localStorage.getItem("dataType")) {
  dataType = localStorage.getItem("dataType");
  setDataType(dataType);
} else {
  setDataType("size");
}

/*
if (localStorage.getItem("names")) {
  names = localStorage.getItem("names");
  document.getElementById("name-input").value = names;
}
*/
if (localStorage.getItem("cageID")) {
  cageID = localStorage.getItem("cageID");
  document.getElementById("id-input").value = cageID;
}

//display the size data on page load
displaySizeData();



function addData() {
  // Get the values from the input fields
  const oysterSize = document.getElementById("value-input").value;

  // Add the oyster size to the sizeData array
  sizeData.push(oysterSize);

  // Clear the input field
  document.getElementById("value-input").value = "";

  //save the data to local storage
  localStorage.setItem("sizeData", JSON.stringify(sizeData));
  
  //display the updated data
  displaySizeData();
}

function displaySizeData() {
  let displayText = "";

  if (sizeData.length == 0) {
    document.getElementById("size-data-display").innerHTML = "No data yet";
    return;
  }

  if (dataType == "size") {
    unit = "mm";
  } else{
    unit = "spats";
  }

  for (let i = 0; i < sizeData.length; i++) {
    displayText += `
      <div class="data-row">
        <span class="data-index">${i + 1}</span>
        <span class="data-value">${sizeData[i]} ${unit}</span>
        <button class='delete-button' data-index='${i}'>Delete</button>
      </div>
    `;
  }
  document.getElementById("size-data-display").innerHTML = displayText;
}

function deleteData(e) {
  const index = parseInt(e.target.getAttribute("data-index"));
  sizeData.splice(index, 1);
  localStorage.setItem("sizeData", JSON.stringify(sizeData));
  displaySizeData();
}



function setReadingDate(month) {
  // Change the button CSS so it matches the month selection
  monthReading = month;
  if (monthReading == "aug") {
    document.getElementById("aug-button").classList.add("selected");
    document.getElementById("sep-button").classList.remove("selected");
  } else {
    document.getElementById("sep-button").classList.add("selected");
    document.getElementById("aug-button").classList.remove("selected");
  }

  //save the month reading to local storage
  localStorage.setItem("monthReading", monthReading);
}
/*
function saveName() {
  names = document.getElementById("name-input").value;
  localStorage.setItem("names", names);
}
*/
function saveCageID() {
  cageID = document.getElementById("id-input").value;
  localStorage.setItem("cageID", cageID);
}

function submitData() {
  //get the data from the input fields
  //const name = document.getElementById("name-input").value;
  const cageID = Number(document.getElementById("id-input").value);
  let newData = new Array();
  for (let i = 0; i < sizeData.length; i++) {
    newData.push([cageID, monthReading, dataType, sizeData[i]]);
  }

  // No idea what this does cuz AI did it
  fetch('https://sheetdb.io/api/v1/jnhhby8k1fo3b', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      data: newData.map(row => ({
        cage_id: row[0],
        date: row[1],
        type: row[2],
        value: row[3]
      }))
    })
  })
  .then(response => response.json())
  .then(data => console.log(data));
}


// ADD listeners for the clicks
document.getElementById("sizetype-button").addEventListener("click", () => setDataType("size"));
document.getElementById("counttype-button").addEventListener("click", () => setDataType("count"));
document.getElementById("wildtype-button").addEventListener("click", () => setDataType("wild"));

function setDataType(type) {
  dataType = type;

  //Change text displays
  if (dataType === "size") {
    document.getElementById("data-display-title").innerHTML = "Oyster Size Data:";
    document.getElementById("data-input-title").innerHTML = "Enter Oyster Size:";
  } else if (dataType === "count") {
    document.getElementById("data-display-title").innerHTML = "Oyster Spat Count Data:";
    document.getElementById("data-input-title").innerHTML = "Enter Oyster Spat Count:";
  } else if (dataType === "wild") {
    document.getElementById("data-display-title").innerHTML = "Wild Oyster Spat Data:";
    document.getElementById("data-input-title").innerHTML = "Enter Wild Oyster Spat Count:";
  }

  // Changes classes so css is different
  if (dataType === "size") {
    document.getElementById("sizetype-button").classList.add("selected");
    document.getElementById("counttype-button").classList.remove("selected");
    document.getElementById("wildtype-button").classList.remove("selected");
  } else if (dataType === "count") {
    document.getElementById("counttype-button").classList.add("selected");
    document.getElementById("sizetype-button").classList.remove("selected");
    document.getElementById("wildtype-button").classList.remove("selected");
  } else if (dataType === "wild") {
    document.getElementById("wildtype-button").classList.add("selected");
    document.getElementById("sizetype-button").classList.remove("selected");
    document.getElementById("counttype-button").classList.remove("selected");
  }

  //re-displays data because it may change units
  displaySizeData();

  localStorage.setItem("dataType", dataType);
}



// Optionally, set the default selected button on page load
//setDataType("size");
