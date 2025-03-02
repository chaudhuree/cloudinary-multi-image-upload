import React, { useState } from "react";
import axios from "axios"; // Import Axios

const CloudinaryMultiUpload = () => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgresses, setUploadProgresses] = useState([]);
  const [error, setError] = useState("");

  const cloudName = "djftsbsuu"; // Replace with your Cloudinary cloud name
  const uploadPreset = "syoung"; // Replace with your upload preset name

  const handleImageChange = (event) => {
    setSelectedImages(Array.from(event.target.files));
  };

  const handleUpload = async () => {
    if (selectedImages.length === 0) {
      setError("Please select at least one image.");
      return;
    }

    setUploading(true);
    setError("");
    setImageUrls([]);
    setUploadProgresses(Array(selectedImages.length).fill(0));

    const uploadPromises = selectedImages.map((image, index) => {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", uploadPreset);

      return axios
        .post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgresses((prevProgresses) => {
                const newProgresses = [...prevProgresses];
                newProgresses[index] = progress;
                return newProgresses;
              });
            },
          }
        )
        .then((response) => response.data.secure_url) // Extract URL from response
        .catch((error) => {
          throw new Error(`Upload failed for ${image.name}: ${error.message}`);
        });
    });

    try {
      const urls = await Promise.all(uploadPromises);
      setImageUrls(urls);
    } catch (err) {
      setError(`One or more uploads failed: ${err}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
      />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload Images"}
      </button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {uploading && (
        <div>
          {selectedImages.map((image, index) => (
            <div key={index}>
              Uploading {image.name}: {uploadProgresses[index]}%
              <progress value={uploadProgresses[index]} max="100" />
            </div>
          ))}
        </div>
      )}

      {imageUrls.length > 0 && (
        <div>
          <h3>Uploaded Images:</h3>
          {imageUrls.map((url, index) => (
            <div key={index}>
              <img
                src={url}
                alt={`Uploaded ${index + 1}`}
                style={{ maxWidth: "100px" }}
              />
              <p>URL: {url}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CloudinaryMultiUpload;
