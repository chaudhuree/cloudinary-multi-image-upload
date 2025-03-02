import React, { useState, ChangeEvent, FormEvent } from 'react';
import axios, { AxiosResponse, AxiosError, ProgressEvent } from 'axios';

interface CloudinaryResponse {
    secure_url: string;
}

const CloudinaryMultiUpload: React.FC = () => {
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [uploading, setUploading] = useState<boolean>(false);
    const [uploadProgresses, setUploadProgresses] = useState<number[]>([]);
    const [error, setError] = useState<string>('');

    const cloudName: string = "djftsbsuu"; // Replace with your Cloudinary cloud name
    const uploadPreset: string = "syoung"; // Replace with your upload preset name



    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedImages(Array.from(event.target.files));
        }
    };

    const handleUpload = async (event: FormEvent) => {
        event.preventDefault(); // Prevent default form submission

        if (selectedImages.length === 0) {
            setError('Please select at least one image.');
            return;
        }

        setUploading(true);
        setError('');
        setImageUrls([]);
        setUploadProgresses(Array(selectedImages.length).fill(0));

        const uploadPromises: Promise<string>[] = selectedImages.map((image: File, index: number) => {
            const formData = new FormData();
            formData.append('file', image);
            formData.append('upload_preset', uploadPreset);

            return axios.post<CloudinaryResponse>(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent: ProgressEvent) => {
                        const progress: number = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgresses((prevProgresses: number[]) => {
                            const newProgresses: number[] = [...prevProgresses];
                            newProgresses[index] = progress;
                            return newProgresses;
                        });
                    },
                }
            )
            .then((response: AxiosResponse<CloudinaryResponse>) => response.data.secure_url)
            .catch((error: AxiosError) => {
                throw new Error(`Upload failed for ${image.name}: ${error.message}`);
            });
        });

        try {
            const urls: string[] = await Promise.all(uploadPromises);
            setImageUrls(urls);
        } catch (err: any) { // Use any to catch errors with unknown type
            setError(`One or more uploads failed: ${err}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleUpload}>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} />
                <button type="submit" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload Images'}
                </button>
            </form>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {uploading && (
                <div>
                    {selectedImages.map((image: File, index: number) => (
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
                    {imageUrls.map((url: string, index: number) => (
                        <div key={index}>
                            <img src={url} alt={`Uploaded ${index + 1}`} style={{ maxWidth: '100px' }} />
                            <p>URL: {url}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CloudinaryMultiUpload;