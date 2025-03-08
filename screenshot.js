const express = require("express");
const { chromium } = require("playwright");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

app.post("/screenshot", async (req, res) => {
    const { url, instanceUrl, accessToken } = req.body;
    if (!targetURL) {
        return res.status(400).json({ error: "Missing 'url' query parameter" });
    }

    try {
        // Launch Playwright browser
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();

        await page.emulateMedia({ screen: { scaleFactor: 0.7 } });

        // Navigate to the provided URL
        await page.goto(instanceUrl);

        await page.evaluate((token) => {
            document.cookie = `sid=${token}; path=/; Secure`;
        }, accessToken);

        await page.goto(url,{ waitUntil: "networkidle" });

        // Wait for the page to load
        await page.waitForTimeout(3000);

        // Take a screenshot
        const screenshotBuffer = await page.screenshot();

        // Close browser
        await browser.close();

        // Send the screenshot as a Base64-encoded string
        res.json({ message: "Screenshot captured successfully!", screenshot: screenshotBuffer.toString("base64") });

    } catch (error) {
        console.error("Error capturing screenshot:", error);
        res.status(500).json({ error: "Failed to capture screenshot" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
