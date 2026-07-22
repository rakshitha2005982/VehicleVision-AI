const imageInput = document.getElementById("image");
const uploadBtn = document.getElementById("uploadBtn");
const preview = document.getElementById("preview");
const result = document.getElementById("result");
const loader = document.getElementById("loader");

// Preview Image
imageInput.addEventListener("change", () => {

    const file = imageInput.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {

        preview.src = e.target.result;
        preview.style.display = "block";

    };

    reader.readAsDataURL(file);

});

// Upload Button
uploadBtn.addEventListener("click", async () => {

    const file = imageInput.files[0];

    if (!file) {

        alert("Please select an image");
        return;

    }

    loader.classList.remove("hidden");

    result.innerHTML = `
        <h2>AI Processing...</h2>
        <p>Please wait while VehicleVision AI analyzes your image.</p>
    `;

    const formData = new FormData();
    formData.append("image", file);

    try {
        const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formData
        });

        const uploadData = await uploadResponse.json();
        const processingId = uploadData.processingId;

        if (!processingId) {
            loader.classList.add("hidden");
            result.innerHTML = `<h2>❌ Upload Failed</h2>`;
            return;
        }

        let interval = null;

        const stopPolling = () => {
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
        };

        let consecutiveErrors = 0;
        const maxErrors = 5;

        interval = setInterval(async () => {
            try {
                const statusResponse = await fetch(`/api/status/${processingId}`);

                if (!statusResponse.ok) {
                    consecutiveErrors++;
                    console.warn(`Transient polling status error (${statusResponse.status}). Retry ${consecutiveErrors}/${maxErrors}`);
                    if (consecutiveErrors >= maxErrors) {
                        stopPolling();
                        loader.classList.add("hidden");
                        result.innerHTML = `<h2>❌ Upload Failed</h2><p>Server error ${statusResponse.status}. Please check backend logs.</p>`;
                    }
                    return;
                }

                consecutiveErrors = 0;
                const statusData = await statusResponse.json();

                if (statusData.status === "completed") {
                    stopPolling();
                    loader.classList.add("hidden");

                    const response = await fetch(`/api/result/${processingId}`);
                    if (!response.ok) {
                        result.innerHTML = `<h2>❌ Analysis Failed</h2><p>Could not fetch results from server.</p>`;
                        return;
                    }

                    const data = await response.json();

                    if (data.success) {
                        displayResult(data);
                    } else {
                        result.innerHTML = `<h2>❌ Analysis Failed</h2><p>${data.message}</p>`;
                    }
                } else if (statusData.status === "failed") {
                    stopPolling();
                    loader.classList.add("hidden");
                    result.innerHTML = `<h2>❌ Processing Failed</h2><p>${statusData.message || "The image could not be analyzed."}</p>`;
                }
            } catch (err) {
                consecutiveErrors++;
                console.warn(`Polling error: ${err.message}. Retry ${consecutiveErrors}/${maxErrors}`);
                if (consecutiveErrors >= maxErrors) {
                    stopPolling();
                    loader.classList.add("hidden");
                    result.innerHTML = `<h2>❌ Upload Failed</h2><p>${err.message}</p>`;
                }
            }
        }, 2000);

    } catch (err) {
        loader.classList.add("hidden");
        result.innerHTML = `
            <h2>❌ Upload Failed</h2>
            <p>${err.message}</p>
        `;
    }

});

function displayResult(data) {

    const a = data.analysis;

    result.innerHTML = `

<h2>📊 AI Analysis Report</h2>

<div class="badge success">
${data.status.toUpperCase()}
</div>

<div class="result-grid">

<div class="result-card">

<h3>🚘 Vehicle</h3>

<p><b>Number Plate</b></p>

<p>${data.vehicleNumber}</p>

</div>

<div class="result-card">

<h3>📷 Resolution</h3>

<p>${a.width} × ${a.height}</p>

</div>

<div class="result-card">

<h3>☀ Brightness</h3>

<p>${a.brightnessScore}</p>

</div>

<div class="result-card">

<h3>🔍 Blur Score</h3>

<p>${a.blurScore}</p>

</div>

<div class="result-card">

<h3>📱 Screenshot</h3>

<p>${a.screenshotDetected ? "Yes" : "No"}</p>

</div>

<div class="result-card">

<h3>📋 Metadata</h3>

<p><b>Format</b> : ${a.metadata.format}</p>

<p><b>Density</b> : ${a.metadata.density}</p>

<p><b>Channels</b> : ${a.metadata.channels}</p>

<p><b>EXIF</b> : ${a.metadata.hasExif ? "Yes" : "No"}</p>

</div>

<div class="result-card">

<h3>🎯 Confidence</h3>

<p>${a.confidenceScore}%</p>

<div class="confidence">

<div class="confidence-bar">

<div
class="confidence-fill"
style="width:${a.confidenceScore}%">

</div>

</div>

</div>

</div>

<div class="result-card">

<h3>✅ Quality Check</h3>

<p>${quality(a)}</p>

</div>

</div>

`;

}

function quality(a){

    if(a.blurScore<50)
        return "Poor";

    if(a.brightnessScore<50)
        return "Low Light";

    if(a.confidenceScore<70)
        return "Needs Review";

    return "Excellent";

}