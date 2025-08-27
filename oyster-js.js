// =====================
// Event Listeners Setup
// =====================
document.getElementById("add-button").addEventListener("click", addData);
document.getElementById("submit-button").addEventListener("click", showSimpleSubmitModal);
document.getElementById("delete-all-button").addEventListener("click", showDeleteAllModal);
document.getElementById("id-input").addEventListener("input", saveCageID);

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-button")) {
    const index = parseInt(e.target.getAttribute("data-index"));
    showDeleteSingleModal(index);
  }
});

// =====================
// Global Variables
// =====================
let monthReading = "";
let cageID = "";
let sizeData = [];
let allData = [];
let dataType = "size";
let singleDeleteIndex = null;

const sheetID = '1tnNSICiEBqtWQFtvm3f97aSVcw2XRPcw9Zl4Im9Kdr0';
const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json`;

// =====================
// Data Fetching
// =====================
fetch(url)
  .then(res => res.text())
  .then(text => {
    const json = JSON.parse(text.substr(47).slice(0, -2));
    allData = json.table.rows.map(row =>
      row.c.map(cell => {
        if (!cell) return "";
        if (cell.v !== undefined && cell.v !== null) return cell.v;
        if (cell.f !== undefined && cell.f !== null) return cell.f;
        return "";
      })
    );
  });

// =====================
// Local Storage Loading
// =====================
if (localStorage.getItem("sizeData")) {
  sizeData = JSON.parse(localStorage.getItem("sizeData"));
}

const monthSelect = document.getElementById("month-select");
const dataTypeSelect = document.getElementById("datatype-select");

monthSelect.addEventListener("change", (e) => setReadingDate(e.target.value));
dataTypeSelect.addEventListener("change", (e) => setDataType(e.target.value));

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

if (localStorage.getItem("cageID")) {
  cageID = localStorage.getItem("cageID");
  document.getElementById("id-input").value = cageID;
}

displaySizeData();

// =====================
// Modal Functions
// =====================
function showErrorModal(message) {
  document.getElementById("error-modal-message").textContent = message;
  document.getElementById("error-modal").style.display = "flex";
}
document.getElementById("error-modal-ok").onclick = function() {
  document.getElementById("error-modal").style.display = "none";
};

function showSimpleSubmitModal(e) {
  e.preventDefault();
  const cageID = Number(document.getElementById("id-input").value);
  if (isNaN(cageID) || cageID <= 0 || document.getElementById("id-input").value === "") {
    showErrorModal("Cage ID# must be a valid number");
    return;
  }
  if (sizeData.length == 0) {
    showErrorModal("No data to submit");
    return;
  }
  document.getElementById("simple-submit-modal").style.display = "flex";
}
document.getElementById("simple-modal-yes-submit").onclick = function() {
  document.getElementById("simple-submit-modal").style.display = "none";
  submitData();
};
document.getElementById("simple-modal-cancel").onclick = function() {
  document.getElementById("simple-submit-modal").style.display = "none";
};

function showDeleteAllModal(e) {
  e.preventDefault();
  document.getElementById("delete-all-modal").style.display = "flex";
}
function closeDeleteModal() {
  document.getElementById("delete-all-modal").style.display = "none";
}
document.getElementById("modal-cancel-delete").onclick = closeDeleteModal;
document.getElementById("close-delete-modal").onclick = closeDeleteModal;
document.getElementById("modal-yes-delete").onclick = function() {
  closeDeleteModal();
  deleteAllData();
};

function showDeleteSingleModal(index) {
  singleDeleteIndex = index;
  const value = sizeData[index];
  document.getElementById("delete-single-value").textContent = `Entry: ${value}`;
  document.getElementById("delete-single-modal").style.display = "flex";
}
function closeDeleteSingleModal() {
  document.getElementById("delete-single-modal").style.display = "none";
  singleDeleteIndex = null;
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

// Hide modals if click outside
window.onclick = function(event) {
  if (event.target == document.getElementById("simple-submit-modal")) {
    document.getElementById("simple-submit-modal").style.display = "none";
  }
  if (event.target == document.getElementById("delete-all-modal")) {
    closeDeleteModal();
  }
  if (event.target == document.getElementById("delete-single-modal")) {
    closeDeleteSingleModal();
  }
};

document.getElementById("success-modal-ok").onclick = function() {
  document.getElementById("success-modal").style.display = "none";
  document.getElementById("email-receipt-message").style.display = "none";
};

// =====================
// Data Handling Functions
// =====================
function addData() {
  const oysterSize = document.getElementById("value-input").value;
  if (isNaN(oysterSize) || oysterSize < 0 || oysterSize === "") {
    showErrorModal("Value must be a valid number");
    return;
  }
  if (sizeData.length >= 30) {
    showErrorModal("You cannot enter more than 30 data points.");
    return;
  }
  sizeData.push(oysterSize);
  document.getElementById("value-input").value = "";
  localStorage.setItem("sizeData", JSON.stringify(sizeData));
  displaySizeData();
}

function displaySizeData() {
  let displayText = "";
  if (sizeData.length == 0) {
    document.getElementById("size-data-display").innerHTML = "No data yet";
    document.getElementById("delete-all-button").style.display = "none";
    return;
  } else {
    document.getElementById("delete-all-button").style.display = "block";
  }
  let unit = dataType == "size" ? "mm" : "spat";
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
  for (let i = 0; i < sizeData.length; i++) {
    const rowElem = document.getElementById(`data-row-${i}`);
    if (rowElem) animateDataRow(rowElem);
  }
}

function deleteAllData() {
  sizeData = [];
  localStorage.setItem("sizeData", JSON.stringify(sizeData));
  displaySizeData();
}

function setReadingDate(month) {
  monthReading = month;
  localStorage.setItem("monthReading", monthReading);
}

function saveCageID() {
  cageID = document.getElementById("id-input").value;
  localStorage.setItem("cageID", cageID);
}

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

// =====================
// Utility Functions
// =====================
function formatDateForSheet(date) {
  // Format date as YYYY-MM-DD and ensure it's treated as text
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// =====================
// Submission & Email
// =====================
function submitData() {
  document.getElementById("processing-modal").style.display = "flex";
  const cageID = Number(document.getElementById("id-input").value);
  const extraComments = document.getElementById("paraInput").value;
  const isOverride = extraComments.trim().toUpperCase() === "OVERRIDE";
  let newData = [];
  for (let i = 0; i < sizeData.length; i++) {
    newData.push([cageID, monthReading, dataType, sizeData[i], extraComments]);
  }

  /*
  // Upload photo if selected
  const fileInput = document.getElementById('file-input');
  let photoUploadPromise = Promise.resolve();
  
  if (fileInput && fileInput.files.length > 0) {
    const formData = new FormData();
    formData.append('photo', fileInput.files[0]);
    photoUploadPromise = fetch('https://oyster-data-backend.onrender.com/upload-photo', {
      method: 'POST',
      body: formData,
    })
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        throw new Error('Photo upload failed: ' + data.error);
      }
      return data.fileId;
    });
  }
  */

  // Handle data submission based on override status
  let dataSubmissionPromise;
  if (isOverride) {
    // Skip data upload for OVERRIDE
    dataSubmissionPromise = Promise.resolve();
  } else {
    // Submit data to sheet
    dataSubmissionPromise = fetch('https://sheetdb.io/api/v1/jnhhby8k1fo3b', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: newData.map(row => ({
          cage_id: row[0],
          month: row[1],
          type: row[2],
          value: row[3],
          comment: row[4],
          date: formatDateForSheet(new Date()),
          email: document.getElementById("email-input").value.trim()
        }))
      })
    });
  }

  dataSubmissionPromise
  .then(dataResponse => {
    // Send confirmation email to admin (unless OVERRIDE)
    let adminEmailPromise = Promise.resolve();
    if (!isOverride) {
      adminEmailPromise = sendAdminConfirmationEmail();
    }
    
    // Send email receipt to user (if email provided)
    return Promise.all([adminEmailPromise, sendEmailReceipt()]);
  })
  .then(() => {
    document.getElementById("processing-modal").style.display = "none";
    document.getElementById("success-modal").style.display = "flex";
    sizeData = [];
    localStorage.setItem("sizeData", JSON.stringify(sizeData));
    displaySizeData();
    document.getElementById("paraInput").value = "";
    // const fileInput = document.getElementById("file-input");
    // if (fileInput) fileInput.value = ""; // Clear file input
  })
  .catch(error => {
    document.getElementById("processing-modal").style.display = "none";
    showErrorModal('Submission failed: ' + error.message);
  });
}

function sendEmailReceipt() {
  const email = document.getElementById("email-input").value.trim();
  if (!email) {
    return Promise.resolve();
  }
  const cageID = document.getElementById("id-input").value;
  const month = monthReading === "aug" ? "August" : "September";
  let type = "Oyster Size";
  if (dataType === "count") type = "Shell Spat Count";
  if (dataType === "wild") type = "Wild Shell Spat Count";
  const dataList = sizeData.join(", ");
  const comments = document.getElementById("paraInput").value;
  const templateParams = {
    email: email,
    cage_id: cageID,
    month: month,
    type: type,
    data: dataList,
    comments: comments
  };
  return emailjs.send('service_uclwzai', 'template_vbhx2kn', templateParams, 'p3npZNZS0Qh-04faz')
    .then(function(response) {
      document.getElementById("email-receipt-message").style.display = "block";
    }, function(error) {
      // Email failed, do not show receipt message
    });
}

function sendAdminConfirmationEmail() {
  const cageID = document.getElementById("id-input").value;
  const month = monthReading === "aug" ? "August" : "September";
  let type = "Oyster Size";
  if (dataType === "count") type = "Shell Spat Count";
  if (dataType === "wild") type = "Wild Shell Spat Count";
  const dataList = sizeData.join(", ");
  const comments = document.getElementById("paraInput").value;
  const userEmail = document.getElementById("email-input").value.trim();
  
  const templateParams = {
    email: "kelsey.meyer@tnc.org",
    cage_id: cageID,
    month: month,
    type: type,
    data: dataList,
    comments: comments,
    user_email: userEmail || "No email provided"
  };
  
  return emailjs.send('service_uclwzai', 'template_vbhx2kn', templateParams, 'p3npZNZS0Qh-04faz')
    .then(function(response) {
      console.log('Confirmation email sent to admin');
    }, function(error) {
      console.error('Failed to send confirmation email to admin:', error);
    });
}

// =====================
// Animations
// =====================
function animateDataRow(rowElem) {
  rowElem.classList.add('fade-in');
  setTimeout(() => rowElem.classList.remove('fade-in'), 400);
}

function pulseButton(btn) {
  btn.classList.add('pulse');
  setTimeout(() => btn.classList.remove('pulse'), 250);
}

// Add pulse animation to buttons
const addBtn = document.getElementById("add-button");
if (addBtn) {
  addBtn.addEventListener("click", function() { pulseButton(addBtn); });
}
const submitBtn = document.getElementById("submit-button");
if (submitBtn) {
  submitBtn.addEventListener("click", function() { pulseButton(submitBtn); });
}
const delAllBtn = document.getElementById("delete-all-button");
if (delAllBtn) {
  delAllBtn.addEventListener("click", function() { pulseButton(delAllBtn); });
}

// Comment out file input change event for photo upload
/*
document.getElementById('file-input').addEventListener('change', function() {
  const fileNameDisplay = document.getElementById('file-name-display');
  if (this.files && this.files.length > 0) {
    fileNameDisplay.textContent = this.files[0].name;
  } else {
    fileNameDisplay.textContent = '';
  }
});
*/


