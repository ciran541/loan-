window.onload = function() {
  // Initialize by hiding spouse fields and setting employment fields correctly
  toggleSpouseFields();
  toggleEmploymentFields();
  toggleSpouseEmploymentFields();
}

function toggleSpouseFields() {
  const purchaseType = document.getElementById('purchaseType').value;
  const spouseFields = document.getElementById('spouseFields');
  
  // Show or hide spouse fields based on the selection
  spouseFields.style.display = (purchaseType === 'joint') ? 'block' : 'none';
}

function toggleEmploymentFields() {
  const employmentType = document.getElementById('employmentType').value;
  const employeeFields = document.querySelectorAll('.employeeField');
  const noaFields = document.querySelectorAll('.noaField');

  // Toggle Basic Salary field for main applicant
  employeeFields.forEach(field => {
    field.style.display = (employmentType === 'employee') ? 'block' : 'none';
  });

  // NOA field is always shown
  noaFields.forEach(field => {
    field.style.display = 'block';
  });
}

function toggleSpouseEmploymentFields() {
  const spouseEmploymentType = document.getElementById('spouseEmploymentType').value;
  const spouseEmployeeFields = document.querySelectorAll('.spouseEmployeeField');
  const spouseNoaFields = document.querySelectorAll('.spouseNoaField');

  // Toggle Basic Salary field for spouse
  spouseEmployeeFields.forEach(field => {
    field.style.display = (spouseEmploymentType === 'employee') ? 'block' : 'none';
  });

  // NOA field is always shown
  spouseNoaFields.forEach(field => {
    field.style.display = 'block';
  });
}
function formatNumberWithCommas(number) {
  return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}


function calculateEligibility() {
  // Main applicant details
  const basicSalary = parseFloat(document.getElementById('basicSalary').value) || 0;
  const noa = parseFloat(document.getElementById('noa').value) || 0;
  const purchaseType = document.getElementById('purchaseType').value;
  const propertyType = document.getElementById('propertyType').value;
  const age = parseInt(document.getElementById('age').value) || 0;

  // Financial commitments for main applicant
  const creditCardPayment = parseFloat(document.getElementById('creditCardPayment').value) || 0;

  // Spouse details (if joint)
  let spouseBasicSalary = 0;
  let spouseNoa = 0;
  let spouseCreditCardPayment = 0;
  let spouseAge = 0;

  if (purchaseType === 'joint') {
    spouseBasicSalary = parseFloat(document.getElementById('spouseBasicSalary').value) || 0;
    spouseNoa = parseFloat(document.getElementById('spouseNoa').value) || 0;
    spouseCreditCardPayment = parseFloat(document.getElementById('spouseCreditCardPayment').value) || 0;
    spouseAge = parseInt(document.getElementById('spouseAge').value) || 0;
  }

  // Calculate ages and tenure
  const maxAgeLimit = 65;
  const maxLoanTenurePrivate = 30;
  const maxLoanTenureHDB = 25;

  const applicantTenure = (maxAgeLimit - age < maxLoanTenurePrivate) ? maxAgeLimit - age : maxLoanTenurePrivate;
  const spouseTenure = (maxAgeLimit - spouseAge < maxLoanTenurePrivate) ? maxAgeLimit - spouseAge : maxLoanTenurePrivate;

  const tenure = (purchaseType === 'joint') ? Math.min(applicantTenure, spouseTenure) : applicantTenure;
  const maxTenure = (propertyType === 'hdb') ? maxLoanTenureHDB : maxLoanTenurePrivate;
  const finalTenure = Math.min(tenure, maxTenure);

  // Calculate incomes
  const applicantIncome = basicSalary + (noa * 0.7 / 12);
  const spouseIncome = spouseBasicSalary + (spouseNoa * 0.7 / 12);
  const totalIncome = applicantIncome + spouseIncome;

  // Calculate commitments
  const totalCommitments = creditCardPayment + spouseCreditCardPayment;

  // Calculate TDSR and MSR, similar to previous logic
  const msrAvailable = totalIncome * 0.30;
  const tdsrAvailable = Math.max((totalIncome * 0.55) - totalCommitments, 0);
  
  let availableAmount = (propertyType === 'hdb') ? Math.min(msrAvailable, tdsrAvailable) : tdsrAvailable;

  // Perform loan calculations
  const finalLoanAmount = PV(0.048 / 12, finalTenure * 12, availableAmount);  // Calculate based on final tenure
  const resultDiv = document.getElementById('result');

  resultDiv.innerHTML = `
    <h4>Loan Eligibility Details</h4>
    <p>The indicating loan amount you can borrow for a <strong style="color: blue; font-size: 1.2em;">${propertyType.toUpperCase()}</strong> property is <strong style="color: green; font-size: 1.2em;">SGD ${formatNumberWithCommas(finalLoanAmount)}</strong> over <strong style="color: red; font-size: 1.2em;">${finalTenure} years</strong>.</p>
  `;
}

// Function to calculate present value (loan amount)
function PV(rate, nper, pmt) {
  if (rate === 0) return pmt * nper;
  return pmt * (1 - Math.pow(1 + rate, -nper)) / rate;
}

// Function to calculate monthly installment
function PMT(rate, nper, pv) {
  if (rate === 0) return pv / nper;
  return pv * rate / (1 - Math.pow(1 + rate, -nper));
}
