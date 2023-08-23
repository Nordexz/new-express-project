const express = require("express");
const puppeteer = require("puppeteer");
const chromium = require("chrome-aws-lambda");
require("dotenv").config();

const port = process.env.PORT || 5002;

const app = express();

app.get("/print", async (req, res, next) => {
  try {
    const browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        "--hide-scrollbars",
        "--disable-web-security",
        "--disable-extensions",
        "--no-sandbox",
      ],
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: 'new',
    });

    const page = await browser.newPage();

    await page.goto(
      `${req.query.site}?timestamp=${req.query.timestamp}&patientId=${req.query.patientId}&doctorName=${req.query.doctorName}&firstChart=${req.query.firstChart}&secondChart=${req.query.secondChart}&patientName=${req.query.patientName}`
    );

    page.setJavaScriptEnabled(true);

    await page.setRequestInterception(true);

    page.on("request", async (request) => {
      return request.continue({
        method: "GET",
        headers: {
          ...request.headers(),
          Authorization: process.env.TOKEN,
        },
      });
    });

    // await page.waitForSelector(`#${req.query.firstChart}`);
    // await page.waitForSelector(`#${req.query.secondChart}`);

    setTimeout(async () => {
      const pdfFIle = await page.pdf({
        margin: { left: 120 },
        format: "A4",
        scale: 0.72254,
      });

      await browser.close();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=generated-pdf.pdf"
      );
      res.status(200);
      res.send(pdfFIle);
    }, 5000);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.listen(port, () => {
  console.log(`server started at ${port}`);
});
