const axios = require("axios");
const fs = require("fs").promises;
const path = require("path");

exports.detectDisease = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    // Read uploaded image as base64
    const filePath = req.file.path;
    const imageBuffer = await fs.readFile(filePath);
    const imageBase64 = imageBuffer.toString("base64");

    const requestBody = {
      images: [imageBase64],
      modifiers: ["crops_simple"],
      plant_details: ["common_names", "url", "description", "disease", "wiki_description"],
    };

    // Plant.id v3 API
    const { data } = await axios.post("https://plant.id/api/v3/identify", requestBody, {
      headers: {
        "Content-Type": "application/json",
        "Api-Key": process.env.PLANT_ID_KEY,
      },
    });

    // Cleanup uploaded file
    await fs.unlink(filePath).catch(() => {});

    // Extract top suggestion for easier frontend usage
    const topSuggestion = data?.suggestions?.[0] || {};
    const diseaseDetails = topSuggestion?.details?.disease?.list || [];

    const responsePayload = {
      plantName: topSuggestion?.plant_name || "Unknown",
      commonNames: topSuggestion?.plant_details?.common_names || [],
      probability: topSuggestion?.probability ? (topSuggestion.probability * 100).toFixed(2) + "%" : "N/A",
      description: topSuggestion?.plant_details?.description?.value || "No description available",
      wikiUrl: topSuggestion?.plant_details?.url || null,
      diseases: diseaseDetails.map((d) => ({
        name: d?.name,
        description: d?.description,
        treatment: d?.treatments?.map((t) => t?.name),
      })),
      raw: data, // keep raw in case frontend wants full response
    };

    res.json(responsePayload);
  } catch (error) {
    console.error("Plant.id API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to identify plant disease" });
  }
};
