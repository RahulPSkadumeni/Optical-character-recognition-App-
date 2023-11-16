// uploadController.js

const handleUpload = (req, res) => {
  try {
    const frontImage = req.files["frontImage"][0];
    const backImage = req.files["backImage"][0];

    // Handle the images here, perform OCR or any processing needed
    // This is where you'd integrate the OCR library and process the images

    // Send a response back to the client
    res.setHeader("Content-Type", "application/json");
    res.json({ message: "Files received successfully" });
  } catch (error) {
    console.error("Error handling files:", error);
    res.status(500).json({ message: "Error handling files" });
  }
};

export { handleUpload };
