
const dateInput = document.getElementById("Date");
const today = new Date();
const sixMonthsLater = new Date();
sixMonthsLater.setMonth(today.getMonth() + 6);

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

dateInput.min = formatDate(today);
dateInput.max = formatDate(sixMonthsLater);

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("myform");

  const hall = document.getElementById("Halls");
  const date = document.getElementById("Date");
  const name = document.getElementById("Name");
  const address = document.getElementById("Address");
  const mobile = document.getElementById("Mobile");
  const email = document.getElementById("Email");
  const bccl = document.getElementById("bccl");
  const adhaar = document.getElementById("adhaar");
  const BCCLID = document.getElementById("BCCLID");
  const AdhaarInput = document.getElementById("Adhaar");
  const File1 = document.getElementById("File1");
  const purpose = document.getElementById("Purpose");
  const purposeDetail = document.getElementsByName("purposeDetail")[0];
  const declare = document.getElementById("declare");
  const submitBtn = form.querySelector('input[type="submit"]');

  const label = document.getElementById("Dependent");
  const adhaarD = document.getElementById("adhaarD");
  const file2 = document.getElementById("File2");


  [date, name, address, mobile, email, bccl, adhaar, purpose, purposeDetail, declare, submitBtn].forEach(el => el.disabled = true);

  hall.addEventListener("change", () => date.disabled = false);
  date.addEventListener("change", () => name.disabled = false);
  name.addEventListener("input", () => {
    const valid = name.value.trim() !== "";
    address.disabled = !valid;

    if (!valid) {
      mobile.disabled = true;
      email.disabled = true;
      bccl.disabled = true;
      adhaar.disabled = true;
      purpose.disabled = true;
      purposeDetail.disabled = true;
      declare.disabled = true;
      submitBtn.disabled = true;
    }
  });

  address.addEventListener("input", () => {
    const valid = address.value.trim() !== "";
    mobile.disabled = !valid;

    if (!valid) {
      email.disabled = true;
      bccl.disabled = true;
      adhaar.disabled = true;
      purpose.disabled = true;
      purposeDetail.disabled = true;
      declare.disabled = true;
      submitBtn.disabled = true;
    }
  });


  mobile.addEventListener("input", () => {
    if (/^\d{10}$/.test(mobile.value.trim())) {
      document.getElementById("MobileError").style.display = "none";
      email.disabled = false;
    } else {
      document.getElementById("MobileError").style.display = "inline";
      email.disabled = true;
    }
  });

  email.addEventListener("input", () => {
    const valid = email.checkValidity();
    document.getElementById("EmailError").style.display = valid ? "none" : "inline";
    bccl.disabled = adhaar.disabled = valid ? false : true;
  });

  const checkboxes = document.getElementsByName('login');
  checkboxes.forEach(cb => {
    cb.addEventListener("click", function () {
      checkboxes.forEach(other => { if (other !== cb) other.checked = false; });

      if (cb.id === "bccl" && cb.checked) {
        BCCLID.style.display = "inline";
        AdhaarInput.style.display = "none";
        File1.style.display = "none";
      } else if (cb.id === "adhaar" && cb.checked) {
        BCCLID.style.display = "none";
        AdhaarInput.style.display = "inline";
        File1.style.display = "inline";
      }

      purpose.disabled = purposeDetail.disabled = declare.disabled = submitBtn.disabled = true;
      if (cb.checked) purpose.disabled = false;
    });
  });

  purpose.addEventListener("change", () => {
    purposeDetail.disabled = false;

    if (purpose.value === "Dependent") {
      label.style.display = "inline";
      adhaarD.style.display = "inline";
      file2.style.display = "inline";
      adhaarD.setAttribute("required", "true");
      file2.setAttribute("required", "true");
    } else {
      label.style.display = "none";
      adhaarD.style.display = "none";
      file2.style.display = "none";
      adhaarD.removeAttribute("required");
      file2.removeAttribute("required");
      adhaarD.value = "";
      file2.value = "";
    }
  });

  purposeDetail.addEventListener("input", () => {
    declare.disabled = purposeDetail.value.trim() === "";
  });

  declare.addEventListener("change", () => {
    submitBtn.disabled = !declare.checked;

    if (declare.checked && purpose.value === "Dependent") {
      label.style.display = "inline";
      adhaarD.style.display = "inline";
      file2.style.display = "inline";
    } else {
      label.style.display = "none";
      adhaarD.style.display = "none";
      file2.style.display = "none";
    }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const mobileValid = /^\d{10}$/.test(mobile.value.trim());
    if (!mobileValid) {
      document.getElementById("MobileError").style.display = "inline";
      return;
    }


    if (purpose.value === "Dependent") {
      if (!adhaarD.value.trim() || !file2.files.length) {
        alert("Please fill Aadhaar number and upload file for dependent.");
        return;
      }
    }

    const appID = "BCCL-" + Math.floor(100000 + Math.random() * 900000);
    document.getElementById("ApplicationID").value = appID;
    form.submit();

  });
});