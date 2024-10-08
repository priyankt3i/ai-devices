"use client";
import { useState, useRef } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';

interface InputComponentProps {
  onSubmit: (formData: FormData) => void;
  useTTS: boolean;
  useInternet: boolean;
  usePhotos: boolean;
  useLudicrousMode: boolean;
  useRabbitMode: boolean;
}

const InputComponent: React.FC<InputComponentProps> = ({
  onSubmit,
  useTTS,
  useInternet,
  usePhotos,
  useLudicrousMode,
  useRabbitMode,
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setSelectedImage(acceptedFiles[0]);
    },
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
    },
  } as DropzoneOptions);

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handleRecording = () => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
    setRecording(!recording);
  };

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const options = { mimeType: 'audio/webm' };
      mediaRecorderRef.current = new MediaRecorder(stream, options);
      mediaRecorderRef.current.addEventListener('dataavailable', (event: BlobEvent) => {
        chunksRef.current.push(event.data);
      });
      mediaRecorderRef.current.start();
    });
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.addEventListener('stop', async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob);
        formData.append('useTTS', String(useTTS));
        formData.append('useInternet', String(useInternet));
        formData.append('usePhotos', String(usePhotos));
        formData.append('useLudicrousMode', String(useLudicrousMode));
        if (selectedImage) {
          formData.append('image', selectedImage, selectedImage.name);
        }
        onSubmit(formData);
        chunksRef.current = [];
      });
    }
  };

  return (
    <div className="center top-[350px] left-1/2 transform -translate-y-1/2 flex items-center justify-center max-w-[300px]">
      <div className="relative">
        {useRabbitMode ? (
          <img
            src="https://developersdigest.s3.amazonaws.com/r1.png"
            alt="Rabbit"
            /*className={`w-full ${recording ? '' : ''} prevent-image-drag cursor-pointer`}*/
            className="animate-slide-in-right w-full max-w-[395px] rabbit-animation"
            onMouseDown={handleRecording}
            onMouseUp={handleRecording}
            onTouchStart={handleRecording}
            onTouchEnd={handleRecording}
          />
        ) : (
          <img
            src="https://developersdigest.s3.amazonaws.com/pin.png"
            alt="Second"
            /*className={`w-full ${recording ? '' : ''} prevent-image-drag cursor-pointer`}*/
            className={`animate-slide-in-right w-full max-w-[395px]`}
            onMouseDown={handleRecording}
            onMouseUp={handleRecording}
            onTouchStart={handleRecording}
            onTouchEnd={handleRecording}
          />
        )}
        {recording && (
          <div className="absolute top-[99px] right-[39px]">
            <div className="w-2 h-2 bg-red-500 rounded-full shadow-pulse"></div>
          </div>
        )}
        {usePhotos && (
          <div className={`absolute ${useRabbitMode? '-top-[230px]': '-top-[200px] right-0'} left-0  flex flex-col items-center min-w-[300px]`}>
            <div
              {...getRootProps()}
              className={`w-full h-40 border-2 border-dashed ${isDragActive ? 'border-blue-500' : 'border-gray-400'
                } rounded-md flex items-center justify-center cursor-pointer`}
            >
              <input {...getInputProps()} />
              {selectedImage ? (
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Selected"
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <div className="p-4 text-center">
                  <p className="text-gray-500">Drag and drop an image here</p>
                  <p className="text-gray-500 text-sm">.png, .jpg, .jpeg, .webp, .gif</p>
                </div>
              )}
            </div>
            {selectedImage && (
              <button
                onClick={removeImage}
                className="mt-2 text-sm text-red-500 hover:text-red-700 focus:outline-none"
              >
                Remove Image
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InputComponent;