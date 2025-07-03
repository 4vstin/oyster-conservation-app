// Add event listeners to the buttons
document.getElementById("add-button").addEventListener("click", () => addData());
document.getElementById("submit-button").addEventListener("click", () => showConfirmationModal(event));
document.getElementById("delete-all-button").addEventListener("click", () => showDeleteAllModal(event));

// Add event listeners for input fields
//document.getElementById("name-input").addEventListener("input", () => saveName());
document.getElementById("id-input").addEventListener("input", () => saveCageID());

// Add event listener for delete buttons using event delegation
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-button")) {
    // Instead of deleting immediately, show confirmation modal
    const index = parseInt(e.target.getAttribute("data-index"));
    showDeleteSingleModal(index);
  }
});

//vars
let monthReading = "";
let names = "";
let cageID = "";
let sizeData = [];
let allData = [];
let dataType = "size";

// Store the index to delete for single entry
let singleDeleteIndex = null;

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

// Add event listeners for dropdowns
const monthSelect = document.getElementById("month-select");
const dataTypeSelect = document.getElementById("datatype-select");

monthSelect.addEventListener("change", (e) => setReadingDate(e.target.value));
dataTypeSelect.addEventListener("change", (e) => setDataType(e.target.value));

// On load, set dropdowns to saved values or defaults
if (localStorage.getItem("monthReading")) {
  monthReading = localStorage.getItem("monthReading");
  monthSelect.value = monthReading;
  setReadingDate(monthReading);
} else {
  setReadingDate("aug");
  monthSelect.value = "aug";
}

if (localStorage.getItem("dataType")) {
  dataType = localStorage.getItem("dataType");
  dataTypeSelect.value = dataType;
  setDataType(dataType);
} else {
  setDataType("size");
  dataTypeSelect.value = "size";
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



function showErrorModal(message) {
  document.getElementById("error-modal-message").textContent = message;
  document.getElementById("error-modal").style.display = "flex";
}
document.getElementById("error-modal-ok").onclick = function() {
  document.getElementById("error-modal").style.display = "none";
};

function addData() {
  // Get the values from the input fields
  const oysterSize = document.getElementById("value-input").value;

  // Check if the oyster size is a number
  if (isNaN(oysterSize) || oysterSize < 0 || oysterSize === "") {
    showErrorModal("Value must be a valid number");
    return;
  }
  // Check for max data points
  if (sizeData.length >= 30) {
    showErrorModal("You cannot enter more than 30 data points.");
    return;
  }

  // Add the oyster size to the sizeData array
  sizeData.push(oysterSize);

  // Clear the input field
  document.getElementById("value-input").value = "";

  //save the data to local storage
  localStorage.setItem("sizeData", JSON.stringify(sizeData));
  
  //display the updated data
  displaySizeData();
}

// Add micro-animations for data rows and buttons
function animateDataRow(rowElem) {
  rowElem.classList.add('fade-in');
  setTimeout(() => rowElem.classList.remove('fade-in'), 400);
}

function displaySizeData() {
  let displayText = "";

  if (sizeData.length == 0) {
    document.getElementById("size-data-display").innerHTML = "No data yet";
    // Hide delete all button when no data
    document.getElementById("delete-all-button").style.display = "none";
    return;
  } else {
    // Show delete all button when there's data
    document.getElementById("delete-all-button").style.display = "block";
  }

  if (dataType == "size") {
    unit = "mm";
  } else{
    unit = "spat";
  }

  for (let i = 0; i < sizeData.length; i++) {
    displayText += `
      <div class="data-row" id="data-row-${i}">
        <span class="data-index">${i + 1}</span>
        <span class="data-value">${sizeData[i]} ${unit}</span>
        <button class='delete-button' data-index='${i}'>Delete</button>
      </div>
    `;
  }
  document.getElementById("size-data-display").innerHTML = displayText;
  // Animate new rows
  for (let i = 0; i < sizeData.length; i++) {
    const rowElem = document.getElementById(`data-row-${i}`);
    if (rowElem) animateDataRow(rowElem);
  }
}

function showDeleteSingleModal(index) {
  singleDeleteIndex = index;
  // Show the value in the modal
  const value = sizeData[index];
  document.getElementById("delete-single-value").textContent = `Entry: ${value}`;
  document.getElementById("delete-single-modal").style.display = "flex";
}

function closeDeleteSingleModal() {
  document.getElementById("delete-single-modal").style.display = "none";
  singleDeleteIndex = null;
}

function setReadingDate(month) {
  monthReading = month;
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
  // Show processing modal first
  document.getElementById("processing-modal").style.display = "flex";

  //get the data from the input fields
  //const name = document.getElementById("name-input").value;
  const cageID = Number(document.getElementById("id-input").value);
  const extraComments = document.getElementById("paraInput").value;
  
  let newData = new Array();
  for (let i = 0; i < sizeData.length; i++) {
    newData.push([cageID, monthReading, dataType, sizeData[i], extraComments]);
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
        month: row[1],
        type: row[2],
        value: row[3],
        comment: row[4],
        date: new Date().toISOString()
      }))
    })
  })
  .then(response => response.json())
  .then(data => {
    
    
    // Send email receipt first, then show success modal
    sendEmailReceipt().then(() => {
      // Hide processing modal
      document.getElementById("processing-modal").style.display = "none";
      // Show success modal after email is processed
      document.getElementById("success-modal").style.display = "flex";
      
      // Clear data and comments
      sizeData = [];
      localStorage.setItem("sizeData", JSON.stringify(sizeData));
      displaySizeData();
      document.getElementById("paraInput").value = "";
    });
  });
}

document.getElementById("success-modal-ok").onclick = function() {
  document.getElementById("success-modal").style.display = "none";
  // Hide the email receipt message when closing the modal
  document.getElementById("email-receipt-message").style.display = "none";
};

function setDataType(type) {
  dataType = type;
  if (dataType === "size") {
    document.getElementById("data-display-title").innerHTML = "Oyster Size Data:";
    document.getElementById("data-input-title").innerHTML = "Enter Oyster Size:";
  } else if (dataType === "count") {
    document.getElementById("data-display-title").innerHTML = "Shell Spat Count Data:";
    document.getElementById("data-input-title").innerHTML = "Enter Shell Spat Count:";
  } else if (dataType === "wild") {
    document.getElementById("data-display-title").innerHTML = "Wild Shell Spat Count Data:";
    document.getElementById("data-input-title").innerHTML = "Enter Wild Shell Spat Count:";
  }
  displaySizeData();
  localStorage.setItem("dataType", dataType);
}



// Optionally, set the default selected button on page load
//setDataType("size");
//document.getElementById("modal-yes-submit").addEventListener("click", () => submitData());


function showConfirmationModal(e) {
  e.preventDefault();
  const cageID = Number(document.getElementById("id-input").value);
  //check if the cage ID is a number
  if (isNaN(cageID) || cageID <= 0 || document.getElementById("id-input").value === "") {
    showErrorModal("Cage ID# must be a valid number");
    document.getElementById("confirmation-modal").style.display = "none";
    document.body.style.overflow = "";
    return;
  }

  // check if there is data
  if (sizeData.length == 0) {
    showErrorModal("No data to submit");
    document.getElementById("confirmation-modal").style.display = "none";
    document.body.style.overflow = "";
    return;
  }

  // Get values
  const month = monthReading === "aug" ? "August" : "September";
  let type = "Oyster Size";
  if (dataType === "count") type = "Shell Spat Count";
  if (dataType === "wild") type = "Wild Shell Spat Count";
  // Fill modal
  document.getElementById("modal-cage-id").textContent = cageID;
  document.getElementById("modal-month").textContent = month;
  document.getElementById("modal-type").textContent = type;
  // Data list
  const dataList = document.getElementById("modal-data-list");
  dataList.innerHTML = "";
  sizeData.forEach((val, i) => {
    const li = document.createElement("li");
    li.textContent = val;
    dataList.appendChild(li);
  });
  // Show modal
  document.getElementById("confirmation-modal").style.display = "flex";
}

function deleteAllData() {
  sizeData = [];
  localStorage.setItem("sizeData", JSON.stringify(sizeData));
  displaySizeData();
  // Button will be hidden by displaySizeData() when no data remains
}

function showDeleteAllModal(e) {
  e.preventDefault();
  
  // Show modal (button will only be visible when there's data)
  document.getElementById("delete-all-modal").style.display = "flex";
}

// Modal button logic
const modal = document.getElementById("confirmation-modal");
const deleteModal = document.getElementById("delete-all-modal");

document.getElementById("modal-cancel").onclick = closeModal;
document.getElementById("close-modal").onclick = closeModal;
document.getElementById("modal-cancel-delete").onclick = closeDeleteModal;
document.getElementById("close-delete-modal").onclick = closeDeleteModal;

function closeModal() {
  document.body.style.overflow = "";
  modal.style.display = "none";
}

function closeDeleteModal() {
  deleteModal.style.display = "none";
}

document.getElementById("modal-yes-submit").onclick = function() {
  document.body.style.overflow = "";
  modal.style.display = "none";
  submitData();
};

document.getElementById("modal-yes-delete").onclick = function() {
  deleteModal.style.display = "none";
  deleteAllData();
};

// Hide modals if click outside
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
  if (event.target == deleteModal) {
    deleteModal.style.display = "none";
  }
  // Add for single delete modal
  const singleDeleteModal = document.getElementById("delete-single-modal");
  if (event.target == singleDeleteModal) {
    singleDeleteModal.style.display = "none";
    singleDeleteIndex = null;
  }
};

function sendEmailReceipt() {
  const email = document.getElementById("email-input").value.trim();
  
  // Only send email if an email address is provided
  if (!email) {
    console.log('No email provided, skipping email receipt');
    // Return a resolved promise so the flow continues
    return Promise.resolve();
  }

  const cageID = document.getElementById("id-input").value;
  const month = monthReading === "aug" ? "August" : "September";
  let type = "Oyster Size";
  if (dataType === "count") type = "Shell Spat Count";
  if (dataType === "wild") type = "Wild Shell Spat Count";
  const dataList = sizeData.join(", ");
  const comments = document.getElementById("paraInput").value;

  // Prepare the template parameters
  const templateParams = {
    email: email,
    cage_id: cageID,
    month: month,
    type: type,
    data: dataList,
    comments: comments
  };

  //console.log('Sending email with params:', templateParams);

  // Use EmailJS v4 syntax and return the promise
  return emailjs.send('service_uclwzai', 'template_vbhx2kn', templateParams, 'p3npZNZS0Qh-04faz')
    .then(function(response) {
      console.log('Email sent successfully!', response.status, response.text);
      // Show email receipt message in success modal
      document.getElementById("email-receipt-message").style.display = "block";
    }, function(error) {
      console.error('Failed to send email:', error);
      console.error('Error details:', error.text);
      // Don't show email receipt message if email failed
    });
}

document.getElementById("modal-cancel-delete-single").onclick = closeDeleteSingleModal;
document.getElementById("close-delete-single-modal").onclick = closeDeleteSingleModal;
document.getElementById("modal-yes-delete-single").onclick = function() {
  if (singleDeleteIndex !== null) {
    sizeData.splice(singleDeleteIndex, 1);
    localStorage.setItem("sizeData", JSON.stringify(sizeData));
    displaySizeData();
  }
  closeDeleteSingleModal();
};

// Add pulse animation to buttons
function pulseButton(btn) {
  btn.classList.add('pulse');
  setTimeout(() => btn.classList.remove('pulse'), 250);
}

// Patch add-button, submit-button, delete-all-button click handlers to pulse
const addBtn = document.getElementById("add-button");
if (addBtn) {
  addBtn.addEventListener("click", function(e) {
    pulseButton(addBtn);
  });
}
const submitBtn = document.getElementById("submit-button");
if (submitBtn) {
  submitBtn.addEventListener("click", function(e) {
    pulseButton(submitBtn);
  });
}
const delAllBtn = document.getElementById("delete-all-button");
if (delAllBtn) {
  delAllBtn.addEventListener("click", function(e) {
    pulseButton(delAllBtn);
  });
}


