/**
 * POST /api/upload - multipart form with field "images" (array of files).
 * Auth required. Saves to server/uploads, returns { urls: string[] } (full URLs).
 */
async function uploadImages(req, res) {
  try {
    const files = req.files;
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded. Use the "Photos" field to select images.' });
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const urls = files.map((f) => `${baseUrl}/uploads/${f.filename}`);
    return res.status(200).json({ urls });
  } catch (err) {
    console.error('Upload controller error:', err);
    return res.status(500).json({ message: err.message || 'Upload failed' });
  }
}

module.exports = { uploadImages };
