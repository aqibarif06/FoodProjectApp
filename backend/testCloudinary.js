const dotenv = require("dotenv");

dotenv.config({
  path: "./config/config.env",
});

const cloudinary = require("./config/cloudinary");

console.log("Cloud name exists:", !!process.env.CLOUDINARY_CLOUD_NAME);
console.log("API key exists:", !!process.env.CLOUDINARY_API_KEY);
console.log("API secret exists:", !!process.env.CLOUDINARY_API_SECRET);

console.log(
  "Configured cloud name:",
  cloudinary.config().cloud_name
);

console.log(
  "Configured API key exists:",
  !!cloudinary.config().api_key
);

console.log(
  "Configured API secret exists:",
  !!cloudinary.config().api_secret
);

async function testCloudinary() {
  try {
    console.log("Testing Cloudinary API...");

    const result = await cloudinary.uploader.upload(
      "data:image/svg+xml;base64," +
        Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
            <rect width="100" height="100" fill="red"/>
          </svg>`
        ).toString("base64"),
      {
        folder: "avatars",
        public_id: "foodgenie_test",
        overwrite: true,
      }
    );

    console.log("UPLOAD SUCCESS");
    console.log("Public ID:", result.public_id);
    console.log("Secure URL:", result.secure_url);
  } catch (error) {
    console.error("UPLOAD FAILED");
    console.error("Message:", error.message);
    console.error("HTTP Code:", error.http_code);
    console.error("Name:", error.name);
    console.error("Full error:", error);
  }
}

testCloudinary();