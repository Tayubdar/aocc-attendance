document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("attendanceForm");
    const generatePDFButton = document.getElementById("generatePDF");
    const fetchDataButton = document.getElementById("fetchData");
    const attendanceList = document.getElementById("attendanceList");
  
    // Function to get the current shift
    function getCurrentShift() {
      const hour = new Date().getHours(); // Use local time
      return hour >= 6 && hour < 18 ? "Day Shift" : "Night Shift";
    }
  
    // Submit form
    form.addEventListener("submit", function (event) {
      event.preventDefault();
  
      const department = document.getElementById("department").value;
      const name = document.getElementById("name").value;
      const role = document.getElementById("role").value;
      const initials = document.getElementById("initials").value;
      const shift = getCurrentShift();
      const date = new Date().toLocaleDateString();
  
      // Create an attendance entry
      const attendanceData = {
        department,
        name,
        role,
        initials,
        shift,
        date,
      };
  
      // Send data to the backend
      fetch("http://localhost:3000/submit-attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(attendanceData),
      })
        .then((response) => response.text())
        .then((data) => {
          alert(data); // Show success message
          form.reset(); // Clear the form
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
  
    // Fetch and display all attendance data
    fetchDataButton.addEventListener("click", function () {
      fetch("http://localhost:3000/get-attendance")
        .then((response) => response.json())
        .then((data) => {
          attendanceList.innerHTML = ""; // Clear previous data
  
          data.forEach((entry) => {
            const entryDiv = document.createElement("div");
            entryDiv.textContent = `Name: ${entry.name}, Department: ${entry.department}, Role: ${entry.role}, Shift: ${entry.shift}, Date: ${entry.date}`;
            attendanceList.appendChild(entryDiv);
          });
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
  
    // Generate PDF
    generatePDFButton.addEventListener("click", function () {
      fetch("http://localhost:3000/get-attendance")
        .then((response) => response.json())
        .then((data) => {
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF();
  
          // Add a title to the PDF
          doc.setFontSize(16);
          doc.text("AOCC Attendance Record", 10, 10);
  
          // Define table columns and rows
          const columns = ["Name", "Department", "Role", "Shift", "Date"];
          const rows = data.map((entry) => [
            entry.name, // Ensure this is in Latin characters
            entry.department.replace(/[^\x00-\x7F]/g, ""), // Remove non-Latin characters
            entry.role.replace(/[^\x00-\x7F]/g, ""), // Remove non-Latin characters
            entry.shift,
            entry.date,
          ]);
  
          // Add the table to the PDF
          doc.autoTable({
            head: [columns],
            body: rows,
            startY: 20, // Start table below the title
          });
  
          // Save the PDF
          doc.save("attendance_record.pdf");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
  });