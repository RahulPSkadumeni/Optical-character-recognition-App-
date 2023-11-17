// // uploadController.js

// import { createWorker } from "tesseract.js";

// const handleUpload = async (req, res) => {
//   console.log("inside controller");
//   try {
//     const frontImage = req.files["frontImage"][0];
//     const backImage = req.files["backImage"][0];
//     // Handle the images here, perform OCR or any processing needed

//     // This is where you'd integrate the OCR library and process the images

//     // Use Tesseract.js to extract text from the images
//     // const worker = await createWorker({
//     //   logger: (m) => console.log(m),
//     // });

//     (async () => {
//       const worker = await createWorker("eng");
//       const frontResult = await worker.recognize(
//         // "https://tesseract.projectnaptha.com/img/eng_bw.png"
//         frontImage.buffer,
//         backImage.buffer
//       );
//       const backResult = await worker.recognize(
//         // "https://tesseract.projectnaptha.com/img/eng_bw.png"
//         backImage.buffer
//       );

//       console.log(
//         ">>>>>>>>>>",
//         frontResult.data.text,
//         ">>>>>><<<<<<VVVVVVVVVVVVVV>>>>",
//         backResult.data.text
//       );
//       // console.log(ret.data.text);
//       await worker.terminate();

//       // Extract relevant Aadhaar card details from OCR results
//       const frontText = frontResult.data.text;
//       const backText = backResult.data.text;
//       // Implement logic to parse Aadhaar card details from the extracted text

//       // Format the extracted data
//       const extractedData = {
//         front: frontText,
//         back: backText,
//         // Include parsed Aadhaar card details here
//       };

//       // Send a response back to the client

//       res.setHeader("Content-Type", "application/json");
//       res.json(extractedData);
//     })();

//     //??  do using google tensor
//   } catch (error) {
//     console.error("Error handling files:", error);
//     res.status(500).json({ message: "Error handling files" });
//   }
// };

// export { handleUpload };
import { ocrSpace } from "ocr-space-api-wrapper";

import fs from "fs";

const handleUpload = async (req, res) => {
  console.log("handling upload");
  try {
    const frontImage = req.files["frontImage"][0];
    const backImage = req.files["backImage"][0];

    // Read image buffers
    const frontImageBuffer = frontImage.buffer;
    const backImageBuffer = backImage.buffer;
    const frontImageBase64 = frontImageBuffer.toString("base64");
    const backImageBase64 = backImageBuffer.toString("base64");

    // Replace 'YOUR_OCR_SPACE_API_KEY' with your actual API key
    const apiKey = process.env.OCR_SPACE_API_KEY;

    const frontResult = await ocrSpace(
      `data:image/png;base64,${frontImageBase64}`,
      {
        apiKey,
        language: "eng", // Set the desired language
      }
    );

    const backResult = await ocrSpace(
      `data:image/png;base64,${backImageBase64}`,
      {
        apiKey,
        language: "eng", // Set the desired language
      }
    );
    console.log(frontResult);
    console.log(backResult);

    // Perform OCR on front and back images using the ocr-space-api-wrapper
    // const frontResult = await ocrSpace(frontImageBuffer, {
    //   apiKey,
    //   language: "eng",
    // });
    // const backResult = await ocrSpace(backImageBuffer, {
    //   apiKey,
    //   language: "eng",
    // });

    // Handle OCR results...

    if (
      frontResult &&
      backResult &&
      frontResult.ParsedResults &&
      backResult.ParsedResults
    ) {
      // Process frontResult and backResult as needed
      console.log("Front OCR Result:", frontResult);
      console.log("Back OCR Result:", backResult);

      // Extract relevant Aadhaar card details from OCR results
      const frontText = frontResult.ParsedResults[0]?.ParsedText || "";
      const backText = backResult.ParsedResults[0]?.ParsedText || "";

      //   // Format the extracted data
      const extractedData = {
        front: frontText,
        back: backText,
        // Include parsed Aadhaar card details here
      };
      // finding details in the data
      // const extractDetails = (text) => {
      //   console.log("first", text);
      // };
      const extractDetails = (text) => {
        console.log("first", text);
        const lines = text.split(/\r?\n/); // Split text by line breaks

        let name = "";
        let dob = "";
        let gender = "";
        let aadharNumber = "";

        lines.forEach((line) => {
          if (line.includes("B:")) {
            // Extract date of birth
            dob = line.split("B:")[1].trim();
          } else if (line.toUpperCase().includes("MALE")) {
            // Determine gender
            gender = "Male";
          } else if (line.toUpperCase().includes("FEMALE")) {
            // Determine gender
            gender = "Female";
          } else if (line.includes("Year of Birth :")) {
            // Extract date of birth from "Year of Birth : 1995"
            dob = line.split("Year of Birth :")[1].trim();
          } else if (line.includes("Year of Birth:")) {
            // Extract date of birth from "Year of Birth: 1995"
            dob = line.split("Year of Birth:")[1].trim();
          } else {
            const aadharRegex = /\b\d{4}\s\d{4}\s\d{4}\b/;
            if (aadharRegex.test(line)) {
              // Extract Aadhaar number in the format XXXX XXXX XXXX
              const aadharMatch = line.match(aadharRegex);
              aadharNumber = aadharMatch[0];
            } else if (/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/.test(line)) {
              // Extract date of birth in the format DD/MM/YYYY or DD-MM-YYYY or any date format
              const dobMatch = line.match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
              dob = `${dobMatch[1]}/${dobMatch[2]}/${dobMatch[3]}`;
            } else if (
              !/\d/.test(line) &&
              !line.includes("of India") &&
              !line.includes("Government of")
            ) {
              // Exclude lines containing numbers and phrases like "of India" from name
              name += line + " ";
            }
          }
        });

        // Trim any extra whitespace from name
        name = name.trim();

        return { name, dob, gender, aadharNumber };
      };

      // Extract details from the parsed text
      console.log("frontResult>>>>>>", frontResult.ParsedResults[0].ParsedText);
      console.log("backResult>>>>>>", backResult.ParsedResults[0].ParsedText);

      const details = extractDetails(frontResult.ParsedResults[0].ParsedText);

      console.log("details>>>>>>", details);

      const extractAddressAndPincode = (text) => {
        const lines = text.split(/\r?\n/);
        let address = "";
        let pincode = "";

        lines.forEach((line) => {
          const pincodeRegex = /\b\d{6,7}\b/;
          if (pincodeRegex.test(line)) {
            const pincodeMatch = line.match(pincodeRegex);
            pincode = pincodeMatch[0];
            // Stop adding lines to the address once pincode is found
            return;
          } else {
            address += line + " ";
          }
        });

        address = address.trim();

        return { address, pincode };
      };
      // from back

      const details2 = extractAddressAndPincode(
        backResult.ParsedResults[0].ParsedText
      );
      console.log("details2", details2);
      // Send a response back to the client

      const responseData = {
        name: details.name,
        dob: details.dob,
        gender: details.gender,
        aadharNumber: details.aadharNumber,
        address: details2.address,
        pincode: details2.pincode,
      };

      res.setHeader("Content-Type", "application/json");
      res.json(responseData);
    } else {
      console.log("OCR failed for one or both images.");
      res.status(500).json(
        { message: "OCR failed for one or both images." }
        // frontResult.ErrorDetails,
        // backResult.ErrorDetails
      );
    }
  } catch (error) {
    console.error("Error handling files:", error);
    res.status(500).json({ message: "Error handling files" });
  }
};

export { handleUpload };
