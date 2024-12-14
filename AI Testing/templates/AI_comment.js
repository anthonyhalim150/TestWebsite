document.getElementById("analyze-btn").addEventListener("click", () => {
    fetch("/analyze", { method: "POST" })
        .then((response) => response.json())
        .then((data) => {
            const resultDiv = document.getElementById("result");
            resultDiv.innerHTML = ""; // Clear previous results

            if (data.status === "success") {
                Object.entries(data.summaries).forEach(([cluster, summary]) => {
                    const suggestion = data.suggestions[cluster];
                    const clusterDiv = document.createElement("div");
                    clusterDiv.innerHTML = `
                        <h3>Cluster ${parseInt(cluster) + 1}</h3>
                        <p><strong>Summary:</strong> ${summary}</p>
                        <p><strong>Suggestion:</strong> ${suggestion}</p>
                    `;
                    resultDiv.appendChild(clusterDiv);
                });
            } else {
                resultDiv.innerHTML = `<p class="error">${data.message}</p>`;
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("An error occurred while analyzing feedback.");
        });
});
