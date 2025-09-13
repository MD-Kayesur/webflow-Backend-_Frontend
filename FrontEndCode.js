const FrontEndCode = () => {
    // FrontEnd style 

    {/* <style>
  .form-container {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
  }
  .form-container input {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 6px;
  }
  .form-container button {
    padding: 8px 16px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  .form-container button:hover {
    background: #45a049;
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }
  .data-card {
    background: #fff;
    padding: 16px;
    border-radius: 12px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    transition: transform 0.2s ease;
  }
  .data-card:hover {
    transform: scale(1.05);
  }
</style>
 */}



 

    {/* <script> */ }
    {/* const API_URL = "https://your-backend-url.com"; // <-- আপনার backend deploy করা URL বসান */ }

    async function loadData() {
        try {
            const res = await fetch(`${API_URL}/items`);
            const data = await res.json();
            renderData(data);
        } catch (err) {
            console.error("Error fetching:", err);
        }
    }

    function renderData(dataList) {
        let html = "";
        dataList.forEach(item => {
            html += `
        <div class="data-card">
          <h3>${item.name}</h3>
          <p>Value: ${item.value}</p>
          <small>${item.description}</small>
        </div>
      `;
        });
        document.getElementById("data-container").innerHTML = html;
    }

    async function addData() {
        const name = document.getElementById("name").value;
        const value = document.getElementById("value").value;
        const description = document.getElementById("description").value;

        if (name && value && description) {
            await fetch(`${API_URL}/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, value, description })
            });
            loadData(); // refresh data
        } else {
            alert("Please fill all fields");
        }
    }

    loadData(); // প্রথম লোডের সময় ডাটা আনবে
    // </script>



    return (
        <>

            {/* // <!-- Input Form --> */}
            <div class="form-container">
                <input type="text" id="name" placeholder="Enter name" />
                <input type="text" id="value" placeholder="Enter value" />
                <input type="text" id="description" placeholder="Enter description" />
                <button onclick="addData()">Add Data</button>
            </div>

            {/* // <!-- Data Show Section --> */}
            <div id="data-container" class="card-grid"></div>
        </>





    )


}