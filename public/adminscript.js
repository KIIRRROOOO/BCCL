async function loadData(status) {
  const res = await fetch(`/admin/data?status=${status}`);
  const data = await res.json();
  const tbody = document.getElementById('requests');
  tbody.innerHTML = '';
   data.reverse();

  data.forEach(row => {
    const isApproved = row.status === 'Approved';
    const isRejected = row.status === 'Rejected';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.id}</td>
      <td>${row.applicationID}</td>
      <td>${row.name}</td>
      <td>${row.address}</td>
      <td>${row.mobile}</td>
      <td>${row.email}</td>
      <td>${row.hall}</td>
      <td>${row.date}</td>
      <td>${row.purposeDetail}</td>
      <td id="status-${row.id}">${row.status}</td>
      <td>
        <button onclick="updateStatus(${row.id}, 'Approved')" ${isApproved || isRejected ? 'disabled' : ''}>Approve</button>
        <button onclick="updateStatus(${row.id}, 'Rejected')" ${isApproved || isRejected ? 'disabled' : ''}>Reject</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function updateStatus(id, status) {
  await fetch('/admin/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status })
  });

    loadData('Pending');

  data.forEach(row => {
    const isApproved = row.status === 'Approved';
    const isRejected = row.status === 'Rejected'; 

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.id}</td>
      <td>${row.applicationID}</td>
      <td>${row.name}</td>
      <td>${row.address}</td>
      <td>${row.mobile}</td>
      <td>${row.email}</td>
      <td>${row.hall}</td>
      <td>${row.date}</td>
      <td>${row.purposeDetail}</td>
      <td id="status-${row.id}">${row.status}</td>
      <td>
        <button onclick="updateStatus(${row.id}, 'Approved')" ${isApproved || isRejected ? 'disabled' : ''}>Approve</button>
        <button onclick="updateStatus(${row.id}, 'Rejected')" ${isApproved || isRejected ? 'disabled' : ''}>Reject</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function updateStatus(id, status) {
  const currentStatus = document.getElementById(`status-${id}`).textContent;

  if (currentStatus === 'Approved') return;
  if (currentStatus === 'Rejected' && status === 'Approved') {
    return;
  }

  await fetch('/admin/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status })
  });


  document.getElementById(`status-${id}`).textContent = status;
  fetchData(); 
}

fetchData();
