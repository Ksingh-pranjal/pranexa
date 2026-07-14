import { useState, useRef } from 'react';

function Composer({ onSend, disabled }) {
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState(null); // for showing thumbnail
  const [imageBase64, setImageBase64] = useState(null);   // raw base64, no prefix
  const [mimeType, setMimeType] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Only image files are supported right now.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const fullDataUrl = reader.result; // "data:image/png;base64,AAAA..."
      const base64Only = fullDataUrl.split(',')[1]; // strip the prefix, Gemini wants raw base64
      setImagePreview(fullDataUrl); // keep the full data URL for displaying the thumbnail
      setImageBase64(base64Only);
      setMimeType(file.type);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    setMimeType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = () => {
    if (!text.trim() && !imageBase64) return;
    onSend(text, imageBase64, mimeType, imagePreview);
    setText('');
    removeImage();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="composer">
      {imagePreview && (
        <div className="image-preview">
          <img src={imagePreview} alt="preview" />
          <button onClick={removeImage} className="remove-image-btn">✕</button>
        </div>
      )}
      <div className="composer-box">
        <button
          className="attach-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          title="Attach an image"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
          </svg>
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <input
          placeholder="Message PraNexa..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button className="send-btn" onClick={handleSend} disabled={disabled}>
          Send
        </button>
      </div>
    </div>
  );
}

export default Composer;